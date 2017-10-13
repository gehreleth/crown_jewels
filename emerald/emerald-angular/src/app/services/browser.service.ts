import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/distinctUntilChanged';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ITreeNode, NodeType } from '../backend/entities/tree-node';

import populateChildren from '../backend/populateChildren';
import populateBranchByTerminalNodeId from '../backend/populateBranchByTerminalNodeId';

enum TrackingStatus { PENDING, SUCCESS, FAIL };

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

import { HttpSettingsService } from './http-settings.service';

interface ILazyTreeState {
  selection?: ITreeNode,
  root: Array<ITreeNode>,
  id2Node: Map<number, ITreeNode>
};

@Injectable()
export class BrowserService implements IBusyIndicatorHolder {
  /**
   * Backend call queue. It's supposed to be bound to a busy GUI indicator.
   * User shouldn't alter this value directry.
   */
  busyIndicator: Promise<any> = Promise.resolve(1);

  private static readonly INITIAL_STATE = {
    root: [],
    id2Node: new Map<number, ITreeNode>()
  };

  private readonly _tree$ = new BehaviorSubject<ILazyTreeState>(BrowserService.INITIAL_STATE);
  private readonly _isNumberRe: RegExp = new RegExp("^\\d+$");

  constructor(private _http: Http, private _httpSettings: HttpSettingsService)
  {
    this._tree$.map(state => state.selection)
      .filter( selection => selection &&
              (selection.type === NodeType.Zip || selection.type === NodeType.Folder))
       /* NOTE: requestNodes causes indirect recursive invokation of this subscription.
          Distinct clause breaks this infinite recursion. Helluva bug =(
        */
      .distinctUntilChanged((u, v) => u === v, selection => selection.id)
      .subscribe(selection => this.requestNodes(selection, false));
    this.requestNodes(null, true);
  }

  /**
   * Cold Observable of the tree's selected node.
   * Can return falsy values if none selected.
   */
  get selection(): Observable<ITreeNode> {
    return this._tree$.map(state => state.selection);
  }

  /**
   * Cold Observable of the tree's root nodes set.
   * Initially empty array, supposed to be altered on its own after
   * initial portion of nodes is received from the backend
   * (As a result of the this.requestNodes(null, true) call in the constructor).
   */
  get rootNodes(): Observable<Array<ITreeNode>> {
    return this._tree$.map(q => q.root);
  }

  /**
   * Handler of a route activation event.
   * @param id supposed node.id field, usually the route parameter.
   */
  selectById(id: number) {
    let obs = this._tree$.concatMap(tree => {
      let retVal: Observable<ILazyTreeState>;
      if (tree.id2Node.has(id)) {
        retVal = Observable.of(expandBranch(tree, tree.id2Node.get(id)));
      } else {
        retVal = populateBranchByTerminalNodeId(this._http, id)
          .map((branchRoot: ITreeNode) => {
            tree = mergeBranch(tree, branchRoot);
            return expandBranch(tree, tree.id2Node.get(id));
          });
      }
      return retVal;
    }).take(1);
    setBusyIndicator(this, obs).subscribe(tree => {
      this._tree$.next(tree);
    });
  }

  /**
   * Handler of a non-leaf node expansion event.
   * @param parent node being expanded
   * @param forceRefresh ignore cached values, always perform backend call.
   */
  requestNodes(parent?: ITreeNode, forceRefresh?: boolean) {
    let obs = this._tree$.concatMap(tree => {
      let retVal: Observable<ILazyTreeState>;
      if (parent && tree.id2Node.has(parent.id)) {
        parent = tree.id2Node.get(parent.id);
      }
      let curChildren = parent ? parent.children : tree.root;
      if (!curChildren || forceRefresh) {
        retVal = populateChildren(this._http, parent)
          .map(children => mergeChildrenSets(tree, parent, curChildren, children));
      } else {
        retVal = Observable.of(tree);
      }
      return retVal;
    }).take(1);
    setBusyIndicator(this, obs).subscribe(tree => this._tree$.next(tree));
  }

 /**
  * Uploads a file using POST request. Polls for a server event
  * signalling end of processing. Requests tree root update upon success.
  */
  upload(file: any) {
    let formData = new FormData();
    formData.append('file', file);
    this._http.post('/emerald/input-content/submit-content', formData)
    .subscribe((rsp: Response) => {
      const dict = rsp.json();
      const submitAccepted = dict['success'] as boolean;
      if (submitAccepted) {
        let trackingId = dict['trackingId'] as number;
        this.trackBatchExecution(trackingId);
      }
    });
  }

  private trackBatchExecution(trackingId: number) {
    this._http.get(`/emerald/input-content/submit-status/${trackingId}`)
      .subscribe((rsp: Response) =>
    {
      const dict = rsp.json();
      const status = TrackingStatus[dict['status'] as string];
      switch (status) {
        case TrackingStatus.SUCCESS:
          this.requestNodes(null, true);
          break;
        case TrackingStatus.PENDING:
          setTimeout(() => this.trackBatchExecution(trackingId), 5000);
          break;
        case TrackingStatus.FAIL:
        default:
      }
    });
  }
}

/**
 * Updates children sets of a given paren (null parent is the root).
 * This function doesn't alter children with ids already esisting in the parent's
 * children set in any way.
 *
 * @param tree the tree instance we're operating on.
 *
 * @param parent the parent of the given children set.
 * If null, the result of this merge operation will go to tree.root.
 *
 * @param oldCh existing children of the parent.
 *
 * @param ch new children we're mirging in here.
 *
 * @return the altered tree.
 */
function mergeChildrenSets(tree: ILazyTreeState, parent: ITreeNode,
  oldCh: Array<ITreeNode>, ch: Array<ITreeNode>): ILazyTreeState
{
  ch = ch.filter(n => !tree.id2Node.has(n.id));
  const newCh = (oldCh ? oldCh.concat(ch) : ch);
  for (const n of newCh) {
    tree.id2Node.set(n.id, n);
  }
  if (parent) {
    parent.children = newCh;
  } else {
    tree.root = newCh;
  }
  return tree;
}

/**
* This function merges eagerly received branch to a lazily initiated tree.
* Needed for eages context when user explicitly request exact node by its id.
* This node may be absent from a tree because it's initiated lazily ad may
* miss lots of branches.
*
* @param tree the tree instance we're operating on.
* @param newBranchRoot new branch eagerly received from the server.
* it should have caterpillar tree structure.
* @return the altered tree.
*/
function mergeBranch(tree: ILazyTreeState, newBranchRoot: ITreeNode): ILazyTreeState {
  let rootNodes = tree.root;
  let lookup = new Map<number, ITreeNode>();
  makeSliceToMerge(rootNodes, [newBranchRoot], lookup);
  let newNodes = mergeBranchRec(null, rootNodes, [newBranchRoot], lookup);
  let newId2Node = new Map<number, ITreeNode>(tree.id2Node);
  lookup.forEach((v, k) => newId2Node.set(k, v));
  tree.root = newNodes;
  tree.id2Node = newId2Node;
  return tree;
}

/**
* Expands all nodes on a path from root to terminal node. Sets selection to terminal node.
*
* @param tree the tree instance we're operating on.
*
* @param terminal node terminal node ona a branch we're expanding.
*
* @return the altered tree.
*/
function expandBranch(state: ILazyTreeState, terminalNode: ITreeNode): ILazyTreeState {
  let cur = terminalNode;
  while (cur) {
    cur.isExpanded = true;
    cur = cur.parent;
  }
  state.selection = terminalNode
  return state;
}

/**
* Builds a set of nodes that should be kept intact during mergeBranch procedure
* Basically, it's all the nodes that already exist in the tree,
* but nave intersection with the branch.
*
* @param src of the nodes that already exist in one level of hiererchy.
*
* @param newBranch branch we're merging with.
*
* @param lookup the procedure will store its output here.
* we can't make it a return value because this function it recursive and uses
* this as accumulator shared between all its recursive contexts.
*/
function makeSliceToMerge(src: Array<ITreeNode>,
  newBranch: Array<ITreeNode>, lookup: Map<number, ITreeNode>)
{
  src.forEach(n => lookup.set(n.id, n));
  const nextNodeInBranch = newBranch.filter(n => n.children).pop();
  if (nextNodeInBranch) {
    let srcNested : Array<ITreeNode> = [];
    {
      const src0 = lookup.get(nextNodeInBranch.id);
      if (src0)
        srcNested = src0.children ? src0.children : [];
    }
    makeSliceToMerge(srcNested, nextNodeInBranch.children, lookup);
  }
}

/**
* Merges a new branch into a tree, most likely a lazily initiated tree and
* its eagerly initiated branch just received from the server.
*
* @param parent the root branch from where we start merging.
* Server currently give a whole branch growing from the root,
* so this parameter is supposed to be null.
* _But_ this recursive function uses this parameter internally
* for merging sub-branches.
*
* @param src collection of exinting nodes on a branch
*
* @param newBranch collection of new nodes we merge with.
* This algorithm assumes that newBranch have caterpillar tree structure.
*
* @returns src collection merged with new nodes
*/
function mergeBranchRec(parent: ITreeNode, src: Array<ITreeNode>,
  newBranch: Array<ITreeNode>, lookup: Map<number, ITreeNode>): Array<ITreeNode>
{
  let retVal : Array<ITreeNode> = src != null ? src : [];
  newBranch.forEach(q => { q.parent = parent });

  // because the branch we're merging with has caterpillar structure,
  // next node in it is the only one having children.
  let nextNodeInBranch: ITreeNode =
    newBranch.filter(q => q.children != null).pop();

  if (nextNodeInBranch) {
    // children are being merged by recursive application of the same procedure.
    const existingSrcBranch = lookup.get(nextNodeInBranch.id);
    const nestedSrc = existingSrcBranch ? existingSrcBranch.children : null;

    nextNodeInBranch.children = mergeBranchRec(nextNodeInBranch, nestedSrc,
      nextNodeInBranch.children, lookup);

    // replace only trunk node (map) or add a new trunk (concat).
    retVal = lookup.has(nextNodeInBranch.id)
      ? retVal.map(q => q.id != nextNodeInBranch.id ? q : nextNodeInBranch)
      : retVal.concat([nextNodeInBranch]);

    lookup.set(nextNodeInBranch.id, nextNodeInBranch);
  }
  // Don't update non-essential but already
  // existing nodes (they're in the lookup).
  retVal = retVal.concat(newBranch
    .filter(q => !lookup.has(q.id)).map(q => {
      lookup.set(q.id, q);
      return q;
    }));
  return retVal;
}

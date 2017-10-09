import { Injectable, Input, Output, EventEmitter} from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ITreeNode, NodeType } from '../backend/entities/tree-node';
import { IImageMeta } from '../backend/entities/image-meta';

import metaFromNode from '../backend/metaFromNode';
import populateChildren from '../backend/populateChildren';
import populateBranchByTerminalNodeId from '../backend/populateBranchByTerminalNodeId';

enum TrackingStatus { PENDING, SUCCESS, FAIL };

import { IPageRange } from '../util/page-range';
import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

import { IImageMetaEditor } from './image-meta-editor';
import { ImageMetaEditorImpl } from './image-meta-editor-impl';
import { HttpSettingsService } from './http-settings.service';

@Injectable()
export class BrowserService implements IBusyIndicatorHolder {
  newRoots: EventEmitter<void> = new EventEmitter<void>();

  routeBrowseId: EventEmitter<any> = new EventEmitter<any>();
  routeSelections: EventEmitter<any> = new EventEmitter<any>();

  rootNodes: Array<ITreeNode> = null;
  rootNodesChanged: EventEmitter<Array<ITreeNode>> = new EventEmitter<Array<ITreeNode>>();

  treePaneSelection: ITreeNode = null;
  treePaneSelectionChanged: EventEmitter<ITreeNode> = new EventEmitter<ITreeNode>();

  busyIndicator: Promise<any> = Promise.resolve(1);

  private _id2Node: Map<number, ITreeNode> = new Map<number, ITreeNode>();
  private _isNumberRe: RegExp = new RegExp("^\\d+$");

  private _imageMetaEditor: BehaviorSubject<IImageMetaEditor>;

  constructor(private _http: Http, private _httpSettings: HttpSettingsService)
  {
    this._imageMetaEditor = new BehaviorSubject<IImageMetaEditor>(null);
    this.newRoots.subscribe(() => this.requestNodes(null, true));
    this.treePaneSelectionChanged.subscribe((node: ITreeNode) =>
      this.handleSelectedNodeChanged(node));
    this.routeBrowseId.subscribe(idParam => this.handleRouteBrowseId(idParam));
    this.routeSelections.subscribe(pageRangeParam =>
      this.handleRouteSelections(pageRangeParam));
    this.newRoots.emit();
  }

  get imageMetaEditor(): Observable<IImageMetaEditor> {
    return this._imageMetaEditor.filter(e => e ? true : false);
  }

  private handleRouteBrowseId(idParam: any) {
    if (!this._isNumberRe.test(idParam)) {
      return;
    }

    const id: number = parseInt(idParam);
    if (this._id2Node.has(id)) {
      this.expandBranch(this._id2Node.get(id));
    } else {
      setBusyIndicator(this, populateBranchByTerminalNodeId(this._http, id))
        .subscribe((branchRoot: ITreeNode) => {
          this.mergeBranch(branchRoot);
          this.expandBranch(this._id2Node.get(id));
        });
    }
  }

  private handleRouteSelections(pageRangeParam: any) {
    setBusyIndicator(this, this.imageMetaEditor).subscribe((editor: IImageMetaEditor) => {
      if (!pageRangeParam) {
        return;
      }

      let pageRange: IPageRange = { page: 0, count: 10 };

      if (pageRangeParam.page && this._isNumberRe.test(pageRangeParam.page)) {
        pageRange.page = parseInt(pageRangeParam.page);
      }

      if (pageRangeParam.count && this._isNumberRe.test(pageRangeParam.count)) {
        pageRange.count = parseInt(pageRangeParam.count);
      }
      
      editor.paginatorLink(pageRange);
    });
  }

  private handleSelectedNodeChanged(node: ITreeNode) {
    if (node.type === NodeType.Image) {
      const o = metaFromNode(this._http, this._httpSettings.DefReqOpts, node);
      setBusyIndicator(this, o).subscribe((imageMeta: IImageMeta) => {
        const nv = new ImageMetaEditorImpl(this._http, this._httpSettings, imageMeta);
        this._imageMetaEditor.next(nv);
      });
    } else {
      this._imageMetaEditor.next(null);
    }
    if (node.type === NodeType.Zip || node.type === NodeType.Folder) {
      this.requestNodes(node, false);
    }
  }

  private expandBranch(terminalNode: ITreeNode) {
    let cur = terminalNode;
    while (cur) {
      cur.isExpanded = true;
      cur = cur.parent;
    }
    this.treePaneSelection = terminalNode;
    this.treePaneSelectionChanged.emit(this.treePaneSelection);
  }

  requestNodes(parent: ITreeNode, forceRefresh: boolean) {
    const curChildren = parent ? parent.children : this.rootNodes;
    if (!curChildren || forceRefresh) {
      setBusyIndicator(this, populateChildren(this._http, parent))
        .subscribe(children => {
          children = this.mergeNewChildrenSet(curChildren, children);
          if (parent) {
            parent.children = children;
          } else {
            this.rootNodes = children;
            this.rootNodesChanged.emit(this.rootNodes);
          }
        });
    }
  }

  private mergeNewChildrenSet(oldCh: Array<ITreeNode>, ch: Array<ITreeNode>)
    : Array<ITreeNode>
  {
    ch = ch.filter(n => !this._id2Node.has(n.id));
    const newCh = (oldCh ? oldCh.concat(ch) : ch);
    for (const n of newCh) {
      this._id2Node.set(n.id, n);
    }
    return newCh;
  }

  /**
  * This function merges eagerly received branch to a lazily initiated tree.
  * Needed for eages context when user explicitly request exact node by its id.
  * This node may be absent from a tree because it's initiated lazily ad may
  * miss lots of branches.
  *
  * @param newBranchRoot new branch eagerly received from the server.
  * it should have caterpillar tree structure.
  */
  private mergeBranch(newBranchRoot: ITreeNode) {
    let lookup = new Map<number, ITreeNode>();
    makeSliceToMerge(this.rootNodes, [newBranchRoot], lookup);
    let newNodes = mergeBranchRec(null, this.rootNodes, [newBranchRoot], lookup);
    let newId2Node = new Map<number, ITreeNode>(this._id2Node);
    lookup.forEach((v, k) => newId2Node.set(k, v));
    this.rootNodes = newNodes;
    this.rootNodesChanged.emit(this.rootNodes);
    this._id2Node = newId2Node;
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
          this.newRoots.emit();
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
* Builds a set of nodes that should be kept intact during mergeBranch procedure
* Basically, it's all the nodes that already exist in the tree,
* but nave intersection with the branch.
*
* @param src of the nodes that already exist in one level of hiererchy
* @param newBranch branch we're merging with
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

import { Injectable, Input, Output, EventEmitter} from '@angular/core';
import { Http, Response } from '@angular/http';
import { ITreeNode, NodeType } from './tree-node';
import { IImageMeta } from './image-meta';
import { ImageMetadataService } from './image-metadata.service';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import "rxjs/add/observable/of";
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

enum TrackingStatus { PENDING, SUCCESS, FAIL };

@Injectable()
export class EmeraldBackendStorageService {
  newRoots: EventEmitter<void> = new EventEmitter<void>();
  browseSlashId: EventEmitter<string> = new EventEmitter<string>();

  Nodes: Array<ITreeNode> = null;
  NodesChanged: EventEmitter<Array<ITreeNode>> = new EventEmitter<Array<ITreeNode>>();

  SelectedNode: ITreeNode = null;
  SelectedNodeChanged: EventEmitter<ITreeNode> = new EventEmitter<ITreeNode>();

  SelectedImageMeta: IImageMeta = null;
  SelectedImageMetaChanged: EventEmitter<IImageMeta> = new EventEmitter<IImageMeta>();

  PendingPromise: Promise<any> = Promise.resolve(1);

  private _id2Node: Map<number, ITreeNode> = new Map<number, ITreeNode>();
  private _isNumberRe: RegExp = new RegExp("^\\d+$");

  constructor(private _http: Http,
              private _imageMetadataService: ImageMetadataService)
  {
    this.newRoots.subscribe(() => this.requestNodes(null, true));
    this.SelectedNodeChanged.subscribe((node: ITreeNode) =>
      this.handleSelectedNodeChanged(node));
    this.browseSlashId.subscribe(id => this.handleBrowseSlashId(id));
    this.newRoots.emit();
  }

  private handleSelectedNodeChanged(node: ITreeNode) {
    if (node.type === NodeType.Image) {
      this._imageMetadataService.getMeta(node).subscribe((imageMeta: IImageMeta) => {
        this.SelectedImageMeta = imageMeta;
        this.SelectedImageMetaChanged.emit(this.SelectedImageMeta);
      });
    } else {
      this.SelectedImageMeta = null;
      this.SelectedImageMetaChanged.emit(this.SelectedImageMeta);
    }
  }

  private handleBrowseSlashId(idStr: string) {
    if (!this._isNumberRe.test(idStr))
      return;

    const id: number = parseInt(idStr);
    if (this._id2Node.has(id)) {
      const terminalNode = this._id2Node.get(id);
      this.expandBranch(terminalNode);
    } else {
      let branchObservable = this.populateBranchByTerminalNodeId(id);
      this.PendingPromise = this.PendingPromise.then(() => branchObservable.toPromise());
      const that = this;
      branchObservable.subscribe((branchRoot: ITreeNode) => {
        that.mergeBranch(branchRoot);
        const terminalNode = this._id2Node.get(id);
        that.expandBranch(terminalNode);
      });
    }
  }

  private expandBranch(terminalNode: ITreeNode) {
    let cur = terminalNode;
    while (cur) {
      cur.isExpanded = true;
      cur = cur.parent;
    }
    this.SelectedNode = terminalNode;
    this.SelectedNodeChanged.emit(this.SelectedNode);
  }

  private mergeChildrenSubsets(oldCh: Array<ITreeNode>, ch: Array<ITreeNode>)
    : Array<ITreeNode>
  {
    ch = ch.filter(n => !this._id2Node.has(n.id));
    const newCh = (oldCh ? oldCh.concat(ch) : ch);
    for (const n of newCh) {
      this._id2Node.set(n.id, n);
    }
    return newCh;
  }

  requestNodes(parent: ITreeNode, forceRefresh: boolean) {
    const curChildren = parent ? parent.children : this.Nodes;
    if (!curChildren || forceRefresh) {
      let childrenObservable = this.populateChildren(parent);
      this.PendingPromise = this.PendingPromise.then(() => childrenObservable.toPromise());
      childrenObservable.subscribe(children => {
        children = this.mergeChildrenSubsets(curChildren, children);
        if (parent) {
          parent.children = children;
        } else {
          this.Nodes = children;
          this.NodesChanged.emit(this.Nodes);
        }
      });
    }
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
    EmeraldBackendStorageService.makeSliceToMerge(this.Nodes,
      [newBranchRoot], lookup);
    let newNodes = EmeraldBackendStorageService.mergeBranch0(null, this.Nodes,
      [newBranchRoot], lookup);
    let newId2Node = new Map<number, ITreeNode>(this._id2Node);
    lookup.forEach((v, k) => newId2Node.set(k, v));
    this.Nodes = newNodes;
    this._id2Node = newId2Node;
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
  private static makeSliceToMerge(src: Array<ITreeNode>,
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
      EmeraldBackendStorageService
        .makeSliceToMerge(srcNested, nextNodeInBranch.children, lookup);
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
  private static mergeBranch0(parent: ITreeNode, src: Array<ITreeNode>,
    newBranch: Array<ITreeNode>, lookup: Map<number, ITreeNode>): Array<ITreeNode>
  {
    let retVal : Array<ITreeNode> = src != null ? src : [];
    newBranch.forEach(q => { q.parent = parent });

    // because the branch we're merging with has caterpillar structure,
    // next node in it is the only one having children.
    let nextNodeInBranch : ITreeNode | null =
      newBranch.filter(q => q.children != null).pop();

    if (nextNodeInBranch) {
      // children are being merged by recursive application of the same procedure.
      const existingSrcBranch = lookup.get(nextNodeInBranch.id);
      const nestedSrc = existingSrcBranch ? existingSrcBranch.children : null;

      nextNodeInBranch.children =
        this.mergeBranch0(nextNodeInBranch, nestedSrc,
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

  populateBranchByTerminalNodeId(id: number): Observable<ITreeNode> {
    return this._http.get(`/emerald/storage/populate-branch/${id}`)
      .map((response: Response) =>
        ITreeNode.fromDictRec(response.json(), null));
  }

  /**
   * @param parent parent node (a ITreeNode instance, not id) or null for root
   * @param forceRefresh
   *
   * @returns Array of children
   */
  populateChildren(parent?: ITreeNode): Observable<Array<ITreeNode>>
  {
    return (parent ? this._http.get(`/emerald/storage/populate-children/${parent.id}`)
                   : this._http.get('/emerald/storage/populate-root'))
      .map((response: Response) =>
        (response.json() as any[]).map((ee: any) =>
          ITreeNode.fromDict(ee, parent)));
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

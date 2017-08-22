import { Injectable, Input, Output, EventEmitter} from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

export enum NodeType { Zip, Folder, Image, Other };
export namespace NodeType {
  export function parse(arg: string) {
    switch (arg) {
      case 'Zip':
      return NodeType.Zip;
      case 'Folder':
      return NodeType.Folder;
      case 'Image':
      return NodeType.Image;
      default:
      return NodeType.Other;
    }
  }
}

export interface ITreeNode {
  id: number;
  name: string;
  children: Array<ITreeNode> | null;
  isExpanded: boolean;
  parent: ITreeNode | null;
  type: NodeType;
  aquamarineId: string | null;
  mimeType: string | null;
  contentLength: number | null;
}

export namespace ITreeNode {
  /**
  * Constructs ITreeNode instance from dict object
  * @param arg dict object
  *
  * @param parent ITreeNode instance for parent -
  * it can't be taken from a dict because dicts contains only atomics,
  * BTW there's a cyclic dependency problem
  * _OR_ null if we're conctructing a root node
  *
  * @returns new ITreeNode instance with children == null
  */
  export function fromDict(arg: any, parent: ITreeNode | null) : ITreeNode {
    const retVal : ITreeNode = {
      id: parseInt(arg['id']),
      name: arg['text'] as string,
      children: null,
      isExpanded: false,
      parent: parent,
      type: NodeType.parse(arg['type'] as string),
      aquamarineId: arg['aquamarineId'] as string,
      mimeType: arg['mimeType'] as string,
      contentLength: arg['contentLength'] as number
    }
    return retVal
  }

  /**
  * The recursive variant of the fromDict, creates all children
  * from nested dicts and sets their parent fields.
  *
  * @param arg dict object
  * @param parent ITreeNode instance for root node's parent children
  * parents will be initialized recursively.
  *
  * @returns new ITreeNode instance
  */
  export function fromDictRec(arg: any, parent: ITreeNode | null) : ITreeNode {
    let retVal = fromDict(arg, parent);
    const children = arg['children'] as any[] | null;
    if (children)
      retVal.children = children.map(c => fromDictRec(c, retVal));
    return retVal;
  }
}

enum TrackingStatus { PENDING, SUCCESS, FAIL };
namespace TrackingStatus {
  export function parse(arg: string): TrackingStatus {
    switch (arg) {
      case 'PENDING':
      return TrackingStatus.PENDING;
      case 'SUCCESS':
      return TrackingStatus.SUCCESS;
      default:
      return TrackingStatus.FAIL;
    }
  }
}

@Injectable()
export class EmeraldBackendStorageService {
  onNewRoots: EventEmitter<void> = new EventEmitter<void>();
  Nodes: Array<ITreeNode> = null;
  private Id2Node: Map<number, ITreeNode> = new Map<number, ITreeNode>();

  constructor(private http: Http) {
    this.onNewRoots.subscribe(() => this.populateChildren(null, true));
    this.onNewRoots.emit();
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
    let newId2Node = new Map<number, ITreeNode>(this.Id2Node);
    lookup.forEach((v, k) => newId2Node.set(k, v));
    this.Nodes = newNodes;
    this.Id2Node = newId2Node;
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

/**
 * @param id a node
 *
 * @returns node as a promise. If this node is currently absent from the tree,
 * eagerly restore entire tree segment by using the populate-branch server call.
 */
  getNodeById(id : number) : Promise<ITreeNode> {
    if (this.Id2Node.has(id))
      return new Promise<ITreeNode>(resolve => resolve(this.Id2Node.get(id)));
    else {
      const rsp = this.http.get(`/emerald/storage/populate-branch/${id}`);
      return rsp.map((response: Response) => response.json()).toPromise()
        .then((serverAnswer: any) => ITreeNode.fromDictRec(serverAnswer, null))
        .then((n : ITreeNode) => {
          this.mergeBranch(n);
          return this.getNodeById(id);
        });
    }
  }

  /**
   * @param parent parent node (a ITreeNode instance, not id) or null for root
   * @param forceRefresh
   *
   * @returns Array of children
   */
  populateChildren(parent: ITreeNode | null, forceRefresh : boolean = false) :
    Promise< Array<ITreeNode> >
  {
    const children = parent ? parent.children : this.Nodes;
    if (!forceRefresh && children != null)
      return new Promise< Array<ITreeNode> >(resolve => resolve(children));
    else {
      const rsp = parent
        ? this.http.get(`/emerald/storage/populate-children/${parent.id}`)
        : this.http.get('/emerald/storage/populate-root');
      return rsp.map((response: Response) => response.json()).toPromise()
        .then((serverAnswer: any) => {
          let arr = serverAnswer as any[];
          return arr.map((ee:any) => ITreeNode.fromDict(ee, parent));
        })
        .then((ch : Array<ITreeNode>) => ch.filter(n => !this.Id2Node.has(n.id)))
        .then((ch : Array<ITreeNode>) => {
          let oldCh = parent ? parent.children : this.Nodes;
          let newCh = oldCh ? oldCh.concat(ch) : ch;
          ch.forEach(n => this.Id2Node.set(n.id, n))
          if (parent)
            parent.children = newCh;
          else
            this.Nodes = newCh;
          return this.populateChildren(parent, false);
        }).catch(error => {
          new Promise< Array<ITreeNode> >(resolve => undefined);
        });
    }
  }

 /**
  * Uploads a file using POST request. Polls for a server event
  * signalling end of processing. Requests tree root update upon success.
  */
  upload(file: any) {
    let formData = new FormData();
    formData.append('file', file);
    this.http.post('/emerald/input-content/submit-content', formData)
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
    this.http.get(`/emerald/input-content/submit-status/${trackingId}`)
      .subscribe((rsp: Response) =>
    {
      const dict = rsp.json();
      const status = TrackingStatus.parse(dict['status'] as string);
      switch (status) {
        case TrackingStatus.SUCCESS:
          this.onNewRoots.emit();
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

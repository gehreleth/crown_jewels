import { Injectable, Input, Output, EventEmitter} from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

export enum NodeType { Zip, Folder, Image, Other };
export namespace NodeType {
  export function parse(arg: string) {
    switch (arg) {
      case "Zip":
      return NodeType.Zip;
      case "Folder":
      return NodeType.Folder;
      case "Image":
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
    let retVal = fromDict(arg, parent)
    let children = arg['children'] as any[]
    if (children != null) {
      retVal.children = children.map((c) => fromDictRec(c, retVal))
    }
    return retVal
  }
}

enum TrackingStatus { PENDING, SUCCESS, FAIL };
namespace TrackingStatus {
  export function parse(arg: string): TrackingStatus {
    switch (arg) {
      case "PENDING":
      return TrackingStatus.PENDING;
      case "SUCCESS":
      return TrackingStatus.SUCCESS;
      default:
      return TrackingStatus.FAIL;
    }
  }
}

@Injectable()
export class EmeraldBackendStorageService {
  onNewRoots: EventEmitter<void> = new EventEmitter<void>();
  activeNode: Subject<ITreeNode> = new Subject<ITreeNode>();
  Nodes: Array<ITreeNode> = [];

  constructor(private http: Http) {
    this.onNewRoots.subscribe(() => {
      let lookup = new Set<number>(this.Nodes.map((node) => node.id));
      this.populateChildren(null)
        .then((roots: Array<ITreeNode>) =>
        roots.filter(r => {
          console.log(r)
          return !lookup.has(r.id)
        }))
        .then((newNodes) => {
          console.log(newNodes)
          this.Nodes = this.Nodes.concat(newNodes)
      });
    })
    this.onNewRoots.emit()
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
  private mergeBranch(parent: ITreeNode, src: Array<ITreeNode>,
    newBranch: Array<ITreeNode>): Array<ITreeNode>
  {
    let retVal : Array<ITreeNode>;
    let srcIds = new Map<number, ITreeNode>();

    if (src != null) {
      retVal = src;
      src.forEach((q) => srcIds.set(q.id, q))
    } else {
      retVal = []
    }

    newBranch.forEach((q) => { q.parent = parent })
    let nextNodeInBranch : ITreeNode | null = null
    newBranch
      .filter((q) => q.children != null)
      .forEach((q => { nextNodeInBranch = q }))

    if (nextNodeInBranch != null) {
      let existingSrcBranch = srcIds.get(nextNodeInBranch.id)

      let nestedSrc : Array<ITreeNode> =
        existingSrcBranch != null ? existingSrcBranch.children : null

      nextNodeInBranch.children =
        this.mergeBranch(nextNodeInBranch, nestedSrc, nextNodeInBranch.children)

      if (srcIds.has(nextNodeInBranch.id)) {
        retVal = retVal.map((q) => q.id != nextNodeInBranch.id ? q : nextNodeInBranch)
      } else {
        retVal = retVal.concat([nextNodeInBranch])
        srcIds.set(nextNodeInBranch.id, nextNodeInBranch)
      }
    }
    retVal = retVal.concat(newBranch.filter((q) => !srcIds.has(q.id)))
    return retVal
  }

  /**
   * Collects all nodes from the root of a caterpillar tree to the
   * target node with given id
   *
   * @param node root of a caterpillar tree.
   *
   * @param id of the target node
   *
   * @param acc all nodes in the path
   *
   * @returns src collection merged with new nodes
   */
  private tracePathToTargetNode(node: ITreeNode,
    id: number, acc: Array<ITreeNode>) : Array<ITreeNode>
  {
    acc = acc.concat([node])
    if (node.id == id) {
      return acc
    } else {
      let nextStep = node.children.filter((q) => q.children != null || q.id == id)
      if (nextStep.length != 0) {
        return this.tracePathToTargetNode(nextStep[0], id, acc)
      } else {
        throw new Error("Bad branch")
      }
    }
  }

/**
 * @param id of a branch's terminal node
 * @returns tree segment Root Node -> ... Terminal Terminal node
 * with each sibling filled along the way
 */
  populateBranchByTerminalNodeId(id : number) : Promise<ITreeNode> {
    let rsp = this.http.get("/emerald/storage/populate-branch/" + id);
    return rsp.map((response: Response) =>
    JSON.parse(response.text())).toPromise()
      .then((serverAnswer: any) => ITreeNode.fromDictRec(serverAnswer, null));
  }

  /**
   * @param parent parent node (a ITreeNode instance, not id) or null for root
   * @returns Array of children
   */
  populateChildren(parent: ITreeNode | null) : Promise< Array<ITreeNode> > {
    let rsp = parent != null
      ? this.http.get("/emerald/storage/populate-children/" + parent.id)
      : this.http.get("/emerald/storage/populate-root");
    return rsp.map((response: Response) =>
    JSON.parse(response.text())).toPromise()
      .then((serverAnswer: any) => {
        let arr = serverAnswer as any[]
        return arr.map((ee:any) => ITreeNode.fromDict(ee, parent))
      })
  }

  upload(file: any) {
    let formData = new FormData();
    formData.append('file', file);
    this.http.post('/emerald/storage/submit-content', formData)
    .subscribe((rsp: Response) => {
      let dict = rsp.json()
      let submitAccepted = dict['success'] as boolean
      if (submitAccepted) {
        let trackingId = dict['trackingId'] as number
        this.trackBatchExecution(trackingId)
      }
    });
  }

  private trackBatchExecution(trackingId: number) {
    this.http.get('/emerald/storage/submit-status/' + trackingId)
    .subscribe((rsp: Response) => {
      let dict = rsp.json()
      let status = TrackingStatus.parse(dict["status"] as string)
      switch (status) {
        case TrackingStatus.SUCCESS:
          this.onNewRoots.emit()
          break;
        case TrackingStatus.PENDING:
          setTimeout(() => this.trackBatchExecution(trackingId), 5000)
          break;
        case TrackingStatus.FAIL:
        default:
      }
    });
  }
}

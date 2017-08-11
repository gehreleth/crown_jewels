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
  Nodes: Array<ITreeNode> = null;
  private Id2Node: Map<number, ITreeNode> = new Map<number, ITreeNode>();

  constructor(private http: Http) {
    this.onNewRoots.subscribe(() => this.populateChildren(null))
    this.onNewRoots.emit()
  }

  private mergeBranch(newBranchRoot: ITreeNode) {
    let lookup = new Map<number, ITreeNode>();
    EmeraldBackendStorageService.makeSliceToMerge(this.Nodes,
      [newBranchRoot], lookup);
    let newNodes = EmeraldBackendStorageService.mergeBranch0(null, this.Nodes,
      [newBranchRoot], lookup)
    let newId2Node = EmeraldBackendStorageService.mergeLookups(this.Id2Node, lookup);
    this.Nodes = newNodes
    this.Id2Node = newId2Node
  }

  private static mergeLookups(oldMap: Map<number, ITreeNode>,
    newMap : Map<number, ITreeNode>) : Map<number, ITreeNode>
  {
    let retVal = new Map<number, ITreeNode>(oldMap)
    newMap.forEach((v, k) => retVal.set(k,v))
    return retVal
  }

  private static makeSliceToMerge(src: Array<ITreeNode>,
    newBranch: Array<ITreeNode>, lookup: Map<number, ITreeNode>)
  {
    src.forEach((n) => lookup.set(n.id, n))
    let nextNodeInBranch : ITreeNode | null = null
    newBranch
      .filter(n => n.children != null)
      .forEach(n => { nextNodeInBranch = n })
    if (nextNodeInBranch != null && nextNodeInBranch.children != null) {
      let srcNested : Array<ITreeNode> = [];
      {
        let src0 = lookup.get(nextNodeInBranch.id)
        if (src0 != null) {
          srcNested = src0.children != null ? src0.children : [];
        }
      }
      EmeraldBackendStorageService
        .makeSliceToMerge(srcNested, nextNodeInBranch.children, lookup)
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
    newBranch.forEach((q) => { q.parent = parent })

    let nextNodeInBranch : ITreeNode | null = null
    newBranch
      .filter((q) => q.children != null)
      .forEach((q => { nextNodeInBranch = q }))

    if (nextNodeInBranch != null) {
      let existingSrcBranch = lookup.get(nextNodeInBranch.id)

      let nestedSrc : Array<ITreeNode> | null =
        existingSrcBranch != null ? existingSrcBranch.children : null

      nextNodeInBranch.children =
        this.mergeBranch0(nextNodeInBranch, nestedSrc,
          nextNodeInBranch.children, lookup)

      if (lookup.has(nextNodeInBranch.id)) {
        retVal = retVal.map((q) =>
          q.id != nextNodeInBranch.id ? q : nextNodeInBranch)
      } else {
        retVal = retVal.concat([nextNodeInBranch])
      }
      lookup.set(nextNodeInBranch.id, nextNodeInBranch)
    }
    retVal = retVal.concat(newBranch
      .filter((q) => !lookup.has(q.id))
      .map((q) => {
        lookup.set(q.id, q)
        return q
      }))
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
  getNodeById(id : number) : Promise<ITreeNode> {
    if (this.Id2Node.has(id)) {
      return new Promise<ITreeNode>((resolve) => resolve(this.Id2Node.get(id)))
    } else {
      let rsp = this.http.get("/emerald/storage/populate-branch/" + id);
      return rsp.map((response: Response) =>
      JSON.parse(response.text())).toPromise()
        .then((serverAnswer: any) => ITreeNode.fromDictRec(serverAnswer, null))
        .then((n : ITreeNode) => {
          this.mergeBranch(n)
          return this.getNodeById(id)
        })
    }
  }

  /**
   * @param parent parent node (a ITreeNode instance, not id) or null for root
   * @returns Array of children
   */
  populateChildren(parent: ITreeNode | null) : Promise< Array<ITreeNode> > {
    let children : Array<ITreeNode> | null =
      parent != null
        ? parent.children
        : this.Nodes;
    if (children != null) {
      return new Promise< Array<ITreeNode> >(resolve => resolve(children))
    } else {
      let rsp = parent != null
        ? this.http.get("/emerald/storage/populate-children/" + parent.id)
        : this.http.get("/emerald/storage/populate-root");
      return rsp.map((response: Response) =>
      JSON.parse(response.text())).toPromise()
        .then((serverAnswer: any) => {
          let arr = serverAnswer as any[]
          return arr.map((ee:any) => ITreeNode.fromDict(ee, parent))
        })
        .then((ch : Array<ITreeNode>) => {
          if (parent != null) {
            parent.children = ch;
          } else {
            this.Nodes = ch;
          }
          ch.forEach(n => this.Id2Node.set(n.id, n))
          return this.populateChildren(parent)
        })
    }
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

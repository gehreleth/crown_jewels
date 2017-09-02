export enum NodeType { Zip, Folder, Image, Other };

export interface ITreeNode {
  id: number;
  name: string;
  children?: Array<ITreeNode>;
  isExpanded: boolean;
  parent?: ITreeNode;
  type: NodeType;
  aquamarineId?: string;
  mimeType?: string;
  contentLength?: number;
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
  export function fromDict(arg: any, parent?: ITreeNode) : ITreeNode {
    const retVal : ITreeNode = {
      id: parseInt(arg['id']),
      name: arg['text'] as string,
      children: null,
      isExpanded: false,
      parent: parent,
      type: NodeType[arg['type'] as string],
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
  export function fromDictRec(arg: any, parent?: ITreeNode) : ITreeNode {
    let retVal = fromDict(arg, parent);
    const children = arg['children'] as any[] | null;
    if (children)
      retVal.children = children.map(c => fromDictRec(c, retVal));
    return retVal;
  }
}

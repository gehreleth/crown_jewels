import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ITreeNode, NodeType} from '../emerald-backend-storage.service'

@Component({
	selector: "tree-view",
	templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css']
})
export class TreeView {
  public nodeType = NodeType;

	@Input() Nodes: Array<ITreeNode>;
	@Input() SelectedNode: ITreeNode;

	@Output() onSelectedChanged: EventEmitter<ITreeNode> = new EventEmitter<ITreeNode>();
	@Output() onRequestNodes: EventEmitter<ITreeNode> = new EventEmitter<ITreeNode>();

	constructor() { }

  isLeaf(node: ITreeNode) : boolean {
    switch(node.type) {
      case NodeType.Zip:
      case NodeType.Folder:
        return false;
      default:
        return true;
    }
  }

	onSelectNode(node: ITreeNode) {
		this.onSelectedChanged.emit(node);
	}

	onExpand(node: ITreeNode) {
		node.isExpanded = !node.isExpanded;
		if (node.isExpanded && (!node.children || node.children.length === 0)) {
			this.onRequestNodes.emit(node);
		}
	}

	onRequestLocal(node: ITreeNode) {
		this.onRequestNodes.emit(node);
	}
}

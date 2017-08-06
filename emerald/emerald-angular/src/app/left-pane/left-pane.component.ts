import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { TreeView } from '../tree-view/tree-view.component';
import { EmeraldBackendStorageService,
   ITreeNode, NodeType } from '../emerald-backend-storage.service'

@Component({
  selector: 'app-left-pane',
  templateUrl: './left-pane.component.html',
  styleUrls: ['./left-pane.component.css']
})
export class LeftPaneComponent implements OnInit {
	Nodes: Array<ITreeNode> = [];
	selectedNode: ITreeNode = null;

  constructor(private storage : EmeraldBackendStorageService) {}

	// initial node request
	ngOnInit() {
    this.storage.onNewRoots.subscribe(() => this.refresh())
    this.storage.onNewRoots.emit()
	}

  private refresh() {
    let lookup = new Set<number>(this.Nodes.map((node) => node.id));
    this.storage.populateChildren(null)
      .then((roots: Array<ITreeNode>) =>
        roots.filter(r => {
                  console.log(r)
                  return !lookup.has(r.id)
                }))
      .then((newNodes) => {
        console.log(newNodes)
        this.Nodes = this.Nodes.concat(newNodes)
      });
  }

	onSelectNode(node: ITreeNode) {
    this.selectedNode = node;
		this.storage.activeNode.next(node);
	}

	onRequest(parent: ITreeNode) {
    this.storage.populateChildren(parent).then(
      (children : Array<ITreeNode>) => { parent.children = children;});
	}
}

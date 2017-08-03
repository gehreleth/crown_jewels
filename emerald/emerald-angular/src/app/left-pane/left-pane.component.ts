import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { TreeView, ITreeNode, NodeType } from '../tree-view/tree-view.component';
import { EmeraldBackendStorageService } from '../emerald-backend-storage.service'

@Component({
  selector: 'app-left-pane',
  templateUrl: './left-pane.component.html',
  styleUrls: ['./left-pane.component.css']
})
export class LeftPaneComponent implements OnInit {
	Nodes: Array<ITreeNode>;
	selectedNode: ITreeNode; // нужен для отображения детальной информации по выбранному узлу.

	//constructor(private treeService: TreeService) {
  constructor(private storage : EmeraldBackendStorageService) {
	}

	// начальное заполнение верхнего уровня иерархии
	ngOnInit() {
		//this.treeService.GetNodes(0).subscribe(
		//	res => this.Nodes = res,
		//	error => console.log(error)
		//);
    const root1 : ITreeNode = { id: 1,
      name: "A.zip",
      children: null,
      isExpanded: false,
      parent: null,
      type: NodeType.Zip
    }
    const child1_1 : ITreeNode = { id: 11,
      name: "Dir A",
      children: null,
      isExpanded: false,
      parent: root1,
      type: NodeType.Folder
    }
    root1.children = [ child1_1 ];
    const child1_1_1 : ITreeNode = { id: 111,
      name: "Image.png",
      children: null,
      isExpanded: false,
      parent: child1_1,
      type: NodeType.Image
    }
    const child1_1_2 : ITreeNode = { id: 112,
      name: "File.doc",
      children: null,
      isExpanded: false,
      parent: child1_1,
      type: NodeType.Other
    }
    child1_1.children = [ child1_1_1, child1_1_2 ]
    const root2 : ITreeNode = { id: 2,
      name: "B",
      children: null,
      isExpanded: false,
      parent: null,
      type: NodeType.Zip
    }
    const child2_1 : ITreeNode = { id: 21,
      name: "Dir B",
      children: null,
      isExpanded: false,
      parent: root2,
      type: NodeType.Folder
    }
    root2.children = [ child2_1 ];
    const child2_1_1 : ITreeNode = { id: 211,
      name: "Image2.png",
      children: null,
      isExpanded: false,
      parent: child2_1,
      type: NodeType.Image
    }
    const child2_1_2 : ITreeNode = { id: 212,
      name: "File2.doc",
      children: null,
      isExpanded: false,
      parent: child2_1,
      type: NodeType.Other
    }
    child2_1.children = [ child2_1_1, child2_1_2 ]
    this.Nodes = [root1, root2]
	}
	// обработка события смены выбранного узла
	onSelectNode(node: ITreeNode) {
		this.selectedNode = node;
	}
	// обработка события вложенных узлов
	onRequest(parent: ITreeNode) {
		//this.treeService.GetNodes(parent.id).subscribe(
		//	res => parent.children = res,
		//	error=> console.log(error));
	}
}

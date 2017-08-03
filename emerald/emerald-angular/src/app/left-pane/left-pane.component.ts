import {Component, OnInit} from '@angular/core';
import {NgClass} from '@angular/common';
import {TreeView, ITreeNode} from '../tree-view/tree-view.component';
//import {TreeService} from '../../services/tree.service';

@Component({
  selector: 'app-left-pane',
  templateUrl: './left-pane.component.html',
  styleUrls: ['./left-pane.component.css']
})
export class LeftPaneComponent implements OnInit {

	Nodes: Array<ITreeNode>;
	selectedNode: ITreeNode; // нужен для отображения детальной информации по выбранному узлу.

	//constructor(private treeService: TreeService) {
  constructor() {
	}

	// начальное заполнение верхнего уровня иерархии
	ngOnInit() {
		//this.treeService.GetNodes(0).subscribe(
		//	res => this.Nodes = res,
		//	error => console.log(error)
		//);
    const root1 : ITreeNode = { id: 1,
      name: "A",
      children: null,
      isExpanded: false,
      badge: 0,
      parent: null,
      isLeaf: false
    }
    const child1_1 : ITreeNode = { id: 11,
      name: "a",
      children: null,
      isExpanded: false,
      badge: 0,
      parent: root1,
      isLeaf: true
    }
    root1.children = [child1_1];
    const root2 : ITreeNode = { id: 2,
      name: "B",
      children: null,
      isExpanded: false,
      badge: 0,
      parent: null,
      isLeaf: false
    }
    const child2_1 : ITreeNode = { id: 21,
      name: "b",
      children: null,
      isExpanded: false,
      badge: 0,
      parent: root2,
      isLeaf: true
    }
    root2.children = [child2_1];
    this.Nodes = [ root1, root2 ];
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

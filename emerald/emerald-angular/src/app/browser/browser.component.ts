import { Component, OnInit, Input, Output, EventEmitter, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmeraldBackendStorageService } from '../emerald-backend-storage.service'
import { ImageMetadataService } from '../image-metadata.service'
import { ITreeNode, NodeType } from '../tree-node'
import { IImageMeta } from '../image-meta'
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})

export class BrowserComponent implements OnInit {
  public nodeType = NodeType;
  @Input() SelectedNode: ITreeNode = null;
  @Output() SelectedNodeChanged = new EventEmitter<ITreeNode>();
  private ImageMeta: IImageMeta = null;
  private busy: Promise<any>;
  private isNumberRe: RegExp = new RegExp("^\\d+$");

  constructor(private _storageService : EmeraldBackendStorageService,
              private _imageMetadataService : ImageMetadataService,
              private _activatedRoute: ActivatedRoute)
  { }

  ngOnInit() {
    this._activatedRoute.params.subscribe(params => {
      let idParam : string = params['id'];
      if (this.isNumberRe.test(idParam)) {
        this.onSelectId(parseInt(idParam));
      }
    });
    const ims = this._imageMetadataService;
    this.SelectedNodeChanged.subscribe(node => {
      if (node && node.type === NodeType.Image) {
        let pr = ims.getMeta(node).toPromise();
        this.busy = pr;
        pr.then((im : IImageMeta) => { this.ImageMeta = im; });
      }
    });
  }

  onSelectId(id: number) {
    let pr = this._storageService.getNodeById(id);
    this.busy = pr;
    pr.then(node => {
      let cur = node;
      while (cur) {
        cur.isExpanded = true;
        cur = cur.parent;
      }
      this.SelectedNode = node;
      this.SelectedNodeChanged.emit(node);
    })
  }

  onRequest(parent: ITreeNode) {
    let pr = this._storageService.populateChildren(parent);
    this.busy = pr;
    pr.then(children => { parent.children = children; });
  }
}

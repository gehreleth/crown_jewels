import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EmeraldBackendStorageService } from '../../emerald-backend-storage.service'
import { ImageMetadataService } from '../../image-metadata.service'
import { ITreeNode, NodeType } from '../../tree-node'
import { IImageMeta } from '../../image-meta'

@Component({
  selector: 'app-browser-common',
  templateUrl: './browser-common.component.html',
  styleUrls: ['./browser-common.component.scss']
})
export class BrowserCommonComponent implements OnInit {
  public nodeType = NodeType;

  @Input() node: ITreeNode;
  @Input() imageMeta: IImageMeta;

  constructor(private _storageService : EmeraldBackendStorageService,
              private _imageMetadataService : ImageMetadataService)
  { }

  ngOnInit() {}
}

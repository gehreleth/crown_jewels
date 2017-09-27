import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { EmeraldBackendStorageService } from '../emerald-backend-storage.service'

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit {
  constructor(private _activatedRoute: ActivatedRoute,
              private _storageService : EmeraldBackendStorageService)
  { }

  ngOnInit() {
    this._activatedRoute.params.subscribe((params: Params) =>
      this._storageService.browseSlashId.emit(params['id']));
  }
}

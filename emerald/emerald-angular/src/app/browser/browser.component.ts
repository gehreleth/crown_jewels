import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BrowserService } from './browser.service'

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit {
  constructor(private _activatedRoute: ActivatedRoute,
              private _context: BrowserService)
  { }

  ngOnInit() {
    this._activatedRoute.params.subscribe((params: Params) =>
      this._context.browseSlashId.emit(params['id']));
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BrowserService } from './browser.service'
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit, OnDestroy {
  private _subscription: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
              private _context: BrowserService)
  { }

  ngOnInit() {
    this._subscription = this._activatedRoute.params.subscribe((params: Params) =>
      this._context.browseSlashId.emit(params['id']));
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}

import { Observable } from 'rxjs/Observable';
import { IBusyIndicatorHolder } from './busy-indicator-holder';
import 'rxjs/add/observable/fromPromise';

export default function setBusyIndicator<Q>(host: IBusyIndicatorHolder,
  arg: Observable<Q>, onCompleteHook?: () => void, logObj?: any): Observable<Q>
{
  let pr = new Promise<Q>((resolve, reject) => {
    let subscription = arg.subscribe(
      (q: Q) => {
        if (logObj) { console.log("SUCCESS", logObj); }
        resolve(q);
      },
      (err: Error) => {
        if (logObj) { console.log("FAIL", logObj); }
        reject(err);
      },
      () => {
        if (onCompleteHook) {
          onCompleteHook();
        }
        subscription.unsubscribe();
      }
    );
  });
  host.busyIndicator = host.busyIndicator.then(() => pr);
  return Observable.fromPromise(pr);
}

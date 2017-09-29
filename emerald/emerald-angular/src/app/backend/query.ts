import { Observable } from 'rxjs/Observable';

export interface IQuery<E> {
  (): Observable<E>;
}

import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

enum Status { SUCCESS, FAIL }

export class Upload {
  constructor(public readonly status: Status,
    public readonly message: string,
    public readonly timestamp: Date)
  {}
}

@Injectable()
export class EmeraldBackendStorageService {

  constructor(private http: Http) { }

  submit(fileToUpload: any): Promise<Upload> {
    let input = new FormData();
    input.append("file", fileToUpload);
    return this.http.post("/emerald/storage/submit-content", input)
      .map((response: Response) => JSON.parse(response.text()))
      .toPromise().then((serverAnswer: any) => {
        if (serverAnswer['success']) {
          return this.subscribeSubmitStatusTracker(serverAnswer['trackingId'] as number);
        } else {
          throw new Error('POST request failed');
        }
      }).catch((err) => {
        return new Upload(Status.FAIL, err, new Date())
      });
  }

  private subscribeSubmitStatusTracker(trackingId: number) : Promise<Upload>  {
    return this.http.get("/emerald/storage/submit-status/" + trackingId)
      .map((response: Response) => JSON.parse(response.text()))
      .toPromise().then((serverAnswer: any) => {
        if (serverAnswer['status'] == 'PENDING') {
          return new Promise<Upload>((resolve) => {
            setTimeout(() => resolve(this.subscribeSubmitStatusTracker(trackingId)), 5000);
          });
        } else if (serverAnswer['status'] == 'SUCCESS') {
          let ts = serverAnswer['timestamp'] as number;
          return new Upload(Status.SUCCESS, null, new Date(ts));
        } else {
          throw new Error('Server can\'t process uploaded file');
        }
      }).catch((err) => {
        return new Upload(Status.FAIL, err, new Date())
      })
  }
}

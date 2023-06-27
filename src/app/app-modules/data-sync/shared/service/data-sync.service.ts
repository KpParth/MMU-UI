import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, Response } from '@angular/http';

import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { environment } from 'environments/environment';

@Injectable()
export class DataSyncService {

  constructor(private http: Http) { }

  getDataSYNCGroup() {
    return this.http.get(environment.getDataSYNCGroupUrl)
      .map((res: Response) => res.json());
  }

  dataSyncLogin(userName: string, password: string, doLogout : any) {
    return this.http.post(environment.syncLoginUrl, { userName, password, doLogout})
      .map(res => res.json());
  }

  userlogoutPreviousSession(userName: string) {
    console.log("environment.userlogoutPreviousSessionUrl", environment.userlogoutPreviousSessionUrl)
    return this.http.post(environment.userlogoutPreviousSessionUrl, { userName: userName })
    .map(res => res.json());
  }

  syncUploadData(groupID) {
    let req = {
      groupID: groupID,
      user: localStorage.getItem('userName'),
      vanID: JSON.parse(localStorage.getItem('serviceLineDetails')).vanID
    }
    console.log(req, 'reqobj');

    return this.http.post(environment.syncDataUploadUrl, req)
      .map(res => res.json());
  }

  syncDownloadData(reqObj) {
    return this.http.post(environment.syncDataDownloadUrl, reqObj)
      .map(res => res.json());
  }

  syncDownloadDataProgress() {
    return this.http.get(environment.syncDownloadProgressUrl)
      .map(res => res.json());
  }

  getVanDetailsForMasterDownload() {
    return this.http.get(environment.getVanDetailsForMasterDownloadUrl)
      .map(res => res.json());
  }
  checkBenIDAvailability() {
    return this.http.get(environment.getBenIDs)
    .map(res => res.json());
  }
  generateBenIDs(reqObj) {
    return this.http.post(environment.generateBenID, reqObj)
    .map(res => res.json());
  }
  inventorySyncDownloadData(vanID) {
    return this.http.post(environment.getInventorySyncData, vanID)
    .map(res => res.json());

  }
}

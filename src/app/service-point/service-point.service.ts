import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';
import { environment } from 'environments/environment';

@Injectable()
export class ServicePointService {

  constructor(
    private http: Http,
    private router: Router) { }

  getServicePoints(userId: string, serviceProviderId: string) {
    return this.http.post(environment.servicePointUrl, { userID: userId, providerServiceMapID: serviceProviderId })
      .map(res => res.json())
      .catch(err => {
        return Observable.throw(err);
      });
  }

  getMMUDemographics() {
    const spID = localStorage.getItem('servicePointID');
    const spPSMID = localStorage.getItem('providerServiceID');

    return this.http.post(environment.demographicsCurrentMasterUrl, {spID: spID, spPSMID: spPSMID})
      .map(res => res.json())
      .catch( err => {
        return Observable.throw(err);
      })
  }

}
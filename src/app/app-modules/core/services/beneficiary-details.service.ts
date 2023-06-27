import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { environment } from 'environments/environment';

import { Observable, BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class BeneficiaryDetailsService {

  beneficiaryDetails = new BehaviorSubject<any>(null);
  beneficiaryDetails$ = this.beneficiaryDetails.asObservable();

  HRPPositive: any="";
 
  HRPPositiveFlag = new BehaviorSubject(this.HRPPositive);
  HRPPositiveFlag$ = this.HRPPositiveFlag.asObservable();

  constructor(private http: Http) { }

  getBeneficiaryDetails(beneficiaryRegID: string, benFlowID: string) {
    this.http.post(environment.getBeneficiaryDetail, { beneficiaryRegID: beneficiaryRegID, benFlowID: benFlowID })
      .subscribe(res => {
        if (res.json().data) {
          this.beneficiaryDetails.next(res.json().data);
        }
      }, err => {
        this.beneficiaryDetails.next(null);
      });
  }

  getBeneficiaryImage(beneficiaryRegID: string) {
    return this.http.post(environment.getBeneficiaryImage, { beneficiaryRegID: beneficiaryRegID })
      .map(res => res.json().data);
  }

  reset() {
    this.beneficiaryDetails.next(null);
  }

  // getCheck() {
  //   return this.http.get('http://localhost:3000/profile')
  //   .map(res => res.json());
  // }

  setHRPPositive() {
    this.HRPPositive = 1;
    this.HRPPositiveFlag.next(1);
  }
 
  resetHRPPositive()
  {
    this.HRPPositive = 0;
    this.HRPPositiveFlag.next(0);
  }

}

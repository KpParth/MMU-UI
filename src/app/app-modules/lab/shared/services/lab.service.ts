import { Observable } from 'rxjs/Observable';
import { Http, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { shareReplay } from 'rxjs/operators';
@Injectable()
export class LabService {

  constructor(private http: Http) { }

  getLabWorklist() {
    let vanID = JSON.parse(localStorage.getItem('serviceLineDetails')).vanID;
    let fetchUrl = localStorage.getItem('providerServiceID') + `/${localStorage.getItem('serviceID')}/${vanID}`;
    return this.http.get(environment.labWorklist + fetchUrl).map((res) => res.json());
  }

  getEcgAbnormalities() {
    return this.http.get(environment.getEcgAbnormalitiesMasterUrl).map((res) => res.json());
  }

  saveLabWork(techForm) {
    return this.http.post(environment.labSaveWork, techForm).map((res) => res.json()).pipe(shareReplay(1))
  }
  
  saveFile(file) {
    return this.http.post(environment.saveFile, file).map((res) => res.json())
  }

  viewFileContent(viewFileIndex) {
    let option = new RequestOptions({ responseType: ResponseContentType.Blob});
    return this.http.post(environment.viewFileData, viewFileIndex, option).map((res) =>  <Blob>res.blob());
  }
}

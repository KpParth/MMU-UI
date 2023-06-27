import { Component, OnInit, Input, Inject, Injector } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MD_DIALOG_DATA } from '@angular/material';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-case-sheet',
  templateUrl: './case-sheet.component.html',
  styleUrls: ['./case-sheet.component.css']
})
export class CaseSheetComponent implements OnInit {

  QC: boolean = false;
  General: boolean = false;
  NCDScreening: boolean = false;
  CancerScreening: boolean = false;

  preview: any;
  previous: any;
  serviceType: any
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(private route: ActivatedRoute,
  public httpServiceService: HttpServiceService,
  private injector: Injector) { }

  ngOnInit() {
    this.fetchLanguageResponse();
    this.caseSheetCategory();
     this.serviceType = this.route.snapshot.params['serviceType']
    let input = this.injector.get(MD_DIALOG_DATA, null);
    if (input) {
      this.previous = input.previous
      this.serviceType = input.serviceType
    }

  }

  ngOnDestroy() {
    // localStorage.removeItem('caseSheetVisitCategory');
    // localStorage.removeItem('previousCaseSheetVisitCategory')
  }

  caseSheetCategory() {
    let dataStore = this.route.snapshot.params['printablePage'] || 'previous';
    let type;
    if (this.previous) {
      if (dataStore == 'previous') {
        type = localStorage.getItem('previousCaseSheetVisitCategory');
      }
    } else {
      if (dataStore == 'current') {
        type = localStorage.getItem('caseSheetVisitCategory');
      }
      if (dataStore == 'previous') {
        type = localStorage.getItem('previousCaseSheetVisitCategory');
      }
    }



    if (type) {
      switch (type) {
        case 'Cancer Screening':
          this.CancerScreening = true;
          break;

        case 'General OPD (QC)':
        case 'General OPD':
        case 'NCD care':
        case 'PNC':
        case 'ANC':
        case 'COVID-19 Screening':  
        case 'NCD screening':
          this.General = true;
          break;

        default:
          this.QC = false;
          // this.NCDScreening = false;
          this.CancerScreening = false;
          this.General = false;
          break;
      }

    }
  }

  // AV40085804 13/10/2021 Integrating Multilingual Functionality -----Start-----
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.httpServiceService);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  // -----End------
}

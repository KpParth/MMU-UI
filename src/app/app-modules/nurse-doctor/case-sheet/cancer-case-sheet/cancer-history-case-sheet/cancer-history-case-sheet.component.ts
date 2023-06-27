import { Component, OnInit, Input } from '@angular/core';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'cancer-history-case-sheet',
  templateUrl: './cancer-history-case-sheet.component.html',
  styleUrls: ['./cancer-history-case-sheet.component.css']
})
export class CancerHistoryCaseSheetComponent implements OnInit {
  @Input('data')
  casesheetData: any;
  @Input('previous')
  previous:any;
  familyDiseaseHistory: any;
  patientPersonalHistory: any;
  patientObstetricHistory: any;
  beneficiaryDetails: any;

  blankRows = [1, 2, 3, 4]
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(public httpServiceService: HttpServiceService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
  }
  // ngDoCheck() {
  //   this.assignSelectedLanguage();
  // }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.currentLanguageSet = getLanguageJson.currentLanguageObject;
    }
  ngOnChanges() {
    if (this.casesheetData) {

      if (this.casesheetData.BeneficiaryData)
        this.beneficiaryDetails = this.casesheetData.BeneficiaryData;

      if (this.casesheetData.nurseData && this.casesheetData.nurseData.familyDiseaseHistory)
        this.familyDiseaseHistory = this.casesheetData.nurseData.familyDiseaseHistory;

      if (this.casesheetData.nurseData && this.casesheetData.nurseData.benPersonalDietHistory)
        this.patientPersonalHistory = Object.assign({}, this.casesheetData.nurseData.benPersonalDietHistory);

      if (this.casesheetData.nurseData && this.casesheetData.nurseData.patientPersonalHistory)
        this.patientPersonalHistory = Object.assign(this.patientPersonalHistory, this.casesheetData.nurseData.patientPersonalHistory);

      if (this.casesheetData.nurseData && this.casesheetData.nurseData.patientObstetricHistory)
        this.patientObstetricHistory = this.casesheetData.nurseData.patientObstetricHistory;
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

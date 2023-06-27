import { Component, OnInit, Input } from '@angular/core';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-pnc-case-sheet',
  templateUrl: './pnc-case-sheet.component.html',
  styleUrls: ['./pnc-case-sheet.component.css']
})
export class PncCaseSheetComponent implements OnInit {
  @Input('previous')
  previous:any;
  @Input('data')
  caseSheetData: any;
  pNCCaseSheetData: any
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(public httpServiceService: HttpServiceService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
  }

  ngOnChanges() {
    if (this.caseSheetData && this.caseSheetData.nurseData && this.caseSheetData.nurseData.pnc)
      this.pNCCaseSheetData = this.caseSheetData.nurseData.pnc.PNCCareDetail;
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

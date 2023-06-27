import { Component, OnInit, Input } from '@angular/core';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-anc-case-sheet',
  templateUrl: './anc-case-sheet.component.html',
  styleUrls: ['./anc-case-sheet.component.css']
})
export class AncCaseSheetComponent implements OnInit {
  @Input('data')
  caseSheetData: any;
  @Input('previous')
  previous:any;
  aNCDetailsAndFormula: any;
  aNCImmunization: any;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(public httpServiceService: HttpServiceService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
  }

  ngOnChanges() {
    if (this.caseSheetData && this.caseSheetData.nurseData && this.caseSheetData.nurseData.anc) {
      this.aNCDetailsAndFormula = this.caseSheetData.nurseData.anc.ANCCareDetail;
      this.aNCImmunization = this.caseSheetData.nurseData.anc.ANCWomenVaccineDetails;
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

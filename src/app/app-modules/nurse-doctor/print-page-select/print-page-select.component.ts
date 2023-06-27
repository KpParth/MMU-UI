import { Component, OnInit, Inject, DoCheck } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';


@Component({
  selector: 'case-sheet-print-page-select',
  templateUrl: './print-page-select.component.html',
  styleUrls: ['./print-page-select.component.css']
})
export class PrintPageSelectComponent implements OnInit, DoCheck {

  printPagePreviewSelect = {
    caseSheetANC: true,
    caseSheetPNC: true,
    caseSheetHistory: true,
    caseSheetExamination: true,
    caseSheetCovidVaccinationDetails: true
  }

  visitCategory:any;
  currentLanguageSet: any;

  constructor(
    public dialogRef: MdDialogRef<PrintPageSelectComponent>,
    @Inject(MD_DIALOG_DATA) public data: any,
    private httpServices: HttpServiceService) { }

  ngOnInit() {
    this.assignSelectedLanguage();
    if (this.data) {
      this.visitCategory = this.data.visitCategory;
      this.printPagePreviewSelect.caseSheetANC = this.data.printPagePreviewSelect.caseSheetANC;
      this.printPagePreviewSelect.caseSheetPNC = this.data.printPagePreviewSelect.caseSheetPNC;
      this.printPagePreviewSelect.caseSheetHistory = this.data.printPagePreviewSelect.caseSheetHistory;
      this.printPagePreviewSelect.caseSheetExamination = this.data.printPagePreviewSelect.caseSheetExamination;
      this.printPagePreviewSelect.caseSheetCovidVaccinationDetails = this.data.printPagePreviewSelect.caseSheetCovidVaccinationDetails;
    }
  }
  /*
   * JA354063 - Multilingual Changes added on 13/10/21
   */
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServices);
    getLanguageJson.setLanguage();
    this.currentLanguageSet = getLanguageJson.currentLanguageObject;
  }
  // Ends

}

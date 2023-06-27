import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { DoctorService } from '../../shared/services/doctor.service';
import { PrintPageSelectComponent } from '../../print-page-select/print-page-select.component';
import { BeneficiaryDetailsService } from '../../../core/services/beneficiary-details.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-cancer-case-sheet',
  templateUrl: './cancer-case-sheet.component.html',
  styleUrls: ['./cancer-case-sheet.component.css']
})
export class CancerCaseSheetComponent implements OnInit {

  @Input('previous')
  previous: any;

   @Input('serviceType')
  serviceType: any;

  printPagePreviewSelect = {
    caseSheetHistory: true,
    caseSheetExamination: true,
    caseSheetCovidVaccinationDetails: true
  }

  visitCategory: string;
  hideBack: Boolean = false;
  getCaseSheetDataVisit: any;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  
  constructor(
    private doctorService: DoctorService,
    private dialog: MdDialog,
    private location: Location,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private httpServiceService:HttpServiceService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
    let dataStore = this.route.snapshot.params['printablePage'] || 'previous';
    let caseSheetRequest;
    if (dataStore == 'current') {
      caseSheetRequest = {
        "VisitCategory": localStorage.getItem('caseSheetVisitCategory'),
        "benFlowID": localStorage.getItem('caseSheetBenFlowID'),
        "benVisitID": localStorage.getItem('caseSheetVisitID'),
        "beneficiaryRegID": localStorage.getItem('caseSheetBeneficiaryRegID'),
        "visitCode": localStorage.getItem('visitCode')
      }
      this.getCaseSheetDataVisit = {
        benVisitID: localStorage.getItem('caseSheetVisitID'),
        benRegID: localStorage.getItem('caseSheetBeneficiaryRegID'),
        benFlowID: localStorage.getItem('caseSheetBenFlowID')
      }
      this.visitCategory = localStorage.getItem('caseSheetVisitCategory');
      this.getCurrentRole();
      this.getCaseSheetData(caseSheetRequest);
    }
    if (dataStore == 'previous') {
      this.hideBack = true;
      caseSheetRequest = {
        "VisitCategory": localStorage.getItem('previousCaseSheetVisitCategory'),
        "benFlowID": localStorage.getItem('previousCaseSheetBenFlowID'),
        "beneficiaryRegID": localStorage.getItem('previousCaseSheetBeneficiaryRegID'),
        "visitCode": localStorage.getItem('previousCaseSheetVisitCode')
      }
      this.getCaseSheetDataVisit = {
        benVisitID: localStorage.getItem('previousCaseSheetVisitID'),
        benRegID: localStorage.getItem('previousCaseSheetBeneficiaryRegID'),
        benFlowID: localStorage.getItem('previousCaseSheetBenFlowID'),
      }
      this.visitCategory = localStorage.getItem('previousCaseSheetVisitCategory');
      this.getCurrentRole();
      this.getCaseSheetData(caseSheetRequest);
    }
  }
  // ngDoCheck() {
  //   this.assignSelectedLanguage();
  // }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.currentLanguageSet = getLanguageJson.currentLanguageObject;
    }
  ngOnDestroy() {
    if (this.caseSheetSubs)
      this.caseSheetSubs.unsubscribe();

    // localStorage.removeItem('currentRole');
  }



  oncologistRemarks: any;
  getCurrentRole() {
    let currentRole = localStorage.getItem('currentRole');
    if (currentRole && currentRole === 'Oncologist') {
      this.oncologistRemarks = true;
    }
  }

  caseSheetData: any;
  caseSheetDiagnosisData: any;
  caseSheetSubs: any;
 
  getCaseSheetData(caseSheetRequest) {
    if (this.serviceType == 'TM') {
      this.getTMCasesheetData(caseSheetRequest)
    }
    if (this.serviceType == 'MMU') {
      this.getMMUCasesheetData(caseSheetRequest);
    }

  }
  getMMUCasesheetData(caseSheetRequest) {
    this.caseSheetSubs = this.doctorService.getMMUCasesheetData(caseSheetRequest)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data) {
          this.caseSheetData = res.data;
          console.log('caseSheetData', JSON.stringify(this.caseSheetData, null, 4));
        }
      });
  }
  getTMCasesheetData(caseSheetRequest) {
    this.caseSheetSubs = this.doctorService.getTMCasesheetData(caseSheetRequest)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data) {
          this.caseSheetData = res.data;
          console.log('caseSheetData', JSON.stringify(this.caseSheetData, null, 4));
        }
      });
  }

  getOncologistRemarks() {
    let value = undefined;
    if (this.caseSheetDiagnosisData && this.caseSheetDiagnosisData.provisionalDiagnosisOncologist) {
      value = this.caseSheetDiagnosisData.provisionalDiagnosisOncologist;
    }

    this.confirmationService
      .editRemarks(
        this.currentLanguageSet.casesheet.oncologistObservation,
        value
      )
      .subscribe(result => {
        if (result) {
          if (!this.caseSheetDiagnosisData) {
            this.caseSheetDiagnosisData = {};
          }
          result = result.slice(0, result.lastIndexOf('.'));
          this.caseSheetDiagnosisData.provisionalDiagnosisOncologist = result;
          this.saveOncologistRemarks(result);
        }
      });
  }

  saveOncologistRemarks(result) {
    this.doctorService.postOncologistRemarksforCancerCaseSheet(result,
      this.getCaseSheetDataVisit.benVisitID,
      this.getCaseSheetDataVisit.benRegID)
      .subscribe((res) => {
        if (res.statusCode == 500 || res.statusCode == 5000) {
          this.confirmationService.alert(res.errorMessage, 'error');
        } else if (res.statusCode == 200) {
          if (this.caseSheetData && this.caseSheetData.doctorData) {
            this.caseSheetData = {
              ...this.caseSheetData,
              doctorData: {
                ...this.caseSheetData.doctorData,
                diagnosis: {
                  ...this.caseSheetData.doctorData.diagnosis,
                  provisionalDiagnosisOncologist: result
                }
              }
            }
          }
          this.confirmationService.alert(res.data.response, 'success');
        }
      })
  }

  selectPrintPage() {
    let mdDialogRef: MdDialogRef<PrintPageSelectComponent> = this.dialog.open(PrintPageSelectComponent, {
      width: '420px',
      disableClose: false,
      data: { printPagePreviewSelect: this.printPagePreviewSelect, visitCategory: this.visitCategory }
    });

    mdDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.printPagePreviewSelect.caseSheetExamination = result.caseSheetExamination;
        this.printPagePreviewSelect.caseSheetHistory = result.caseSheetHistory;
        this.printPagePreviewSelect.caseSheetCovidVaccinationDetails = result.caseSheetCovidVaccinationDetails;

      }
    });
  }

  printPage() {
    window.print();
  }

  goToTop() {
    window.scrollTo(0, 0);
  }

  goBack() {
    this.location.back();
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

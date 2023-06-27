import { Component, OnInit, Input } from '@angular/core';
import { DoctorService } from '../../shared/services/doctor.service';
import { MdDialogRef, MdDialog } from '@angular/material';
import { Location } from '@angular/common';
import { PrintPageSelectComponent } from '../../print-page-select/print-page-select.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescribeTmMedicineComponent } from '../prescribe-tm-medicine/prescribe-tm-medicine.component';
import { NurseService } from '../../shared/services';
import { ConfirmationService } from 'app/app-modules/core/services';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-general-case-sheet',
  templateUrl: './general-case-sheet.component.html',
  styleUrls: ['./general-case-sheet.component.css']
})
export class GeneralCaseSheetComponent implements OnInit {
  @Input('previous')
  previous: any;

  @Input('serviceType')
  serviceType: any;

  caseSheetData: any;
  visitCategory: any;
  hideBack: boolean = false;

  printPagePreviewSelect = {
    caseSheetANC: true,
    caseSheetPNC: true,
    caseSheetHistory: true,
    caseSheetExamination: true,
    caseSheetCovidVaccinationDetails: true
  }
  enablePrescriptionButton: boolean=false;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    private location: Location,
    private dialog: MdDialog,
    public httpServiceService: HttpServiceService,
    private doctorService: DoctorService,
    private route: ActivatedRoute,
    private nurseService:NurseService,
    private router: Router,
    private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
    this.dataStore = this.route.snapshot.params['printablePage'] || 'previous';
     let caseSheetRequest;
    if (localStorage.getItem('caseSheetTMFlag') == "true" || parseInt(localStorage.getItem('specialistFlag')) == 200) {
      if(localStorage.getItem('caseSheetTMFlag') == "true"){
      this.enablePrescriptionButton=true;
      }
      this.visitCategory = localStorage.getItem('caseSheetVisitCategory');

      caseSheetRequest = {
        "VisitCategory": localStorage.getItem('caseSheetVisitCategory'),
        "benFlowID": localStorage.getItem('caseSheetBenFlowID'),
        "benVisitID": localStorage.getItem('caseSheetVisitID'),
        "beneficiaryRegID": localStorage.getItem('caseSheetBeneficiaryRegID'),
        "visitCode": localStorage.getItem('caseSheetVisitCode')
        // "Auth":localStorage.getItem('serverKey')
        // "isCaseSheetdownloaded": localStorage.getItem('isCaseSheetdownloaded') == "true" ? true : false
      }
      this.getTMReferredCasesheetData(caseSheetRequest);
    }

    else {
      if (this.dataStore == 'current') {
        this.visitCategory = localStorage.getItem('caseSheetVisitCategory');
        caseSheetRequest = {
          "VisitCategory": localStorage.getItem('caseSheetVisitCategory'),
          "benFlowID": localStorage.getItem('caseSheetBenFlowID'),
          "benVisitID": localStorage.getItem('caseSheetVisitID'),
          "beneficiaryRegID": localStorage.getItem('caseSheetBeneficiaryRegID'),
          "visitCode": localStorage.getItem('visitCode')
        }
        this.getCasesheetData(caseSheetRequest);
      }
      if (this.dataStore == 'previous') {
        this.hideBack = true;

        this.visitCategory = localStorage.getItem('previousCaseSheetVisitCategory');
        caseSheetRequest = {
          "VisitCategory": localStorage.getItem('previousCaseSheetVisitCategory'),
          "benFlowID": localStorage.getItem('previousCaseSheetBenFlowID'),
          "beneficiaryRegID": localStorage.getItem('previousCaseSheetBeneficiaryRegID'),
          "visitCode": localStorage.getItem('previousCaseSheetVisitCode')
        }
        this.getCasesheetData(caseSheetRequest);
      }
     }
  }

  dataStore: any;
  ngOnDestroy() {
    if (this.casesheetSubs)
      this.casesheetSubs.unsubscribe();
  }

  casesheetSubs: any;
  hideSelectQC: boolean = false;

  getTMReferredCasesheetData(caseSheetRequest) {
    this.casesheetSubs = this.nurseService.getTMReferredCasesheetData(caseSheetRequest)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data) {
          this.caseSheetData = res.data;

        }
        else {
          this.confirmationService.alertError(res.errorMessage, 'error').subscribe(res => {
            if (res) {
              this.goBack();
            }
          });
        
        }
      }, err => {
      
        this.confirmationService.alertError('Error in fetching TM Casesheet', 'error').subscribe(res => {
          if (res) {
            this.goBack();
          }
        });
      });
  }

  getCasesheetData(caseSheetRequest) {
    if (this.visitCategory == 'General OPD (QC)' || this.previous == true) {
      this.hideSelectQC = true;
    }
    if (this.serviceType == 'TM') {
      this.getTMCasesheetData(caseSheetRequest)
    }
    if (this.serviceType == 'MMU') {
      this.getMMUCasesheetData(caseSheetRequest);
    }

  }
  getMMUCasesheetData(caseSheetRequest) {
    this.casesheetSubs = this.doctorService.getMMUCasesheetData(caseSheetRequest)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data) {
          this.caseSheetData = res.data;
          console.log('caseSheetData', JSON.stringify(this.caseSheetData, null, 4));
        }
      });
  }
  getTMCasesheetData(caseSheetRequest) {
    this.casesheetSubs = this.doctorService.getTMCasesheetData(caseSheetRequest)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data) {
          this.caseSheetData = res.data;
          console.log('caseSheetData', JSON.stringify(this.caseSheetData, null, 4));
        }
      });
  }

  selectPrintPage() {
    let mdDialogRef: MdDialogRef<PrintPageSelectComponent> = this.dialog.open(PrintPageSelectComponent, {
      width: '420px',
      disableClose: false,
      data: { printPagePreviewSelect: this.printPagePreviewSelect, visitCategory: this.visitCategory }
    });

    mdDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.printPagePreviewSelect.caseSheetANC = result.caseSheetANC;
        this.printPagePreviewSelect.caseSheetPNC = result.caseSheetPNC;
        this.printPagePreviewSelect.caseSheetExamination = result.caseSheetExamination;
        this.printPagePreviewSelect.caseSheetHistory = result.caseSheetHistory;
        this.printPagePreviewSelect.caseSheetCovidVaccinationDetails = result.caseSheetCovidVaccinationDetails;
      }
    });
  }

  downloadCasesheet() {
    window.print();
  }

  goBack() {
   
    this.location.back();
 

  }

  goBackVisitDet() {
    this.confirmationService.alert('Error in fetching TM Casesheet', 'error');
    this.location.back();
 

  }


  goToTop() {
    window.scrollTo(0, 0);
  }
  prescribeTMMedicine() {
     if (this.caseSheetData !== undefined && this.caseSheetData !== null && this.caseSheetData.doctorData.prescription.length > 0) {
      let dialogRef = this.dialog.open(PrescribeTmMedicineComponent, {
        data: {
          'height':'560px',
          'weight':'680px',
          'disableClose': true,
          'tmPrescribedDrugs': this.caseSheetData.doctorData.prescription
        }
      })
      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          this.doctorService.prescribedDrugData = result.prescribedDrugs;
        } else {
          console.log("No prescribed drugs");
        }
      })
    } else {
      this.confirmationService.alert('There is no prescribed drugs from TM specialist');
      console.log('There is no prescribed drugs from TM specialist');
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

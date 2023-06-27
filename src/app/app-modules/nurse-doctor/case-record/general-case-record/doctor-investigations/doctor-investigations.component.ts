import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

import { MasterdataService, DoctorService, NurseService } from '../../../shared/services';
import { MasterDataService } from 'app/app-modules/lab/shared/services';
import { IdrsscoreService } from 'app/app-modules/nurse-doctor/shared/services/idrsscore.service';
import { environment } from 'environments/environment';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-investigations',
  templateUrl: './doctor-investigations.component.html',
  styleUrls: ['./doctor-investigations.component.css']
})
export class DoctorInvestigationsComponent implements OnInit {

  @Input('generalDoctorInvestigationForm')
  generalDoctorInvestigationForm: FormGroup

  @Input('caseRecordMode')
  caseRecordMode: string;

  @Input('visitCategory')
  visit: string;

  chiefComplaintMaster: any;
  nonRadiologyMaster: any;
  radiologyMaster: any;
  beneficiaryRegID: string;
  visitID: string;
  visitCategory: string;

  previousLabTestList: any;
  diabetesSelected: any;
  VisualAcuityMandatory: boolean = false;
  RBSTestDoneInVitals: boolean = false;
  VisualAcuityTestDone: boolean = false;
  diastolicBpValue: any;
  systolicBpValue: any;
  RBSTestScore: number;
  rbsPresent: boolean = false;
  visualAcuityPresent: boolean = false;
  RBSAndHeamoglobinSelected: boolean = false;
  confirmedDiabeticValue: any;
  hypertensionSelected: any;
  current_language_set: any;
  rbsTestResultCurrent: any;
  diabestesSuspectedSubscription: Subscription;
  hyperSuspectedSubscription: Subscription;
  diabetesConfirmedSubscription: Subscription;
  systolicSubscription: Subscription;
  diastolicSubscription: Subscription;
  rbsTestResultSubscription: Subscription;
  rbsSelectedInInvestigation: boolean = false;
  hemoglobbinSelected: boolean;
  RBSTestScoreInVitals: number;
  

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private masterdataService: MasterdataService,
    private idrsScoreService: IdrsscoreService,
    private httpServiceService:HttpServiceService,
    private nurseService:NurseService) { }

  ngOnInit() {
    this.getDoctorMasterData();
    this.getNurseMasterData();
    this.idrsScoreService.clearDiabetesSelected();   
    this.idrsScoreService.clearSystolicBp();
    this.idrsScoreService.clearDiastolicBp();
    this.rbsSelectedInInvestigation = false;
    //this.idrsScoreService.clearSystolicBpForFlag();
    //this.idrsScoreService.clearDiastolicBpForFlag();
    this.idrsScoreService.clearHypertensionSelected(); 
    this.idrsScoreService.clearConfirmedDiabeticSelected();
    this.nurseService.clearRbsInVitals();
    this.diabestesSuspectedSubscription = this.idrsScoreService.diabetesSelectedFlag$.subscribe(response => this.diabetesSelected = response);
    
    this.hyperSuspectedSubscription = this.idrsScoreService.hypertensionSelectedFlag$.subscribe(response => {this.hypertensionSelected = response;
      this.changeOfConfirmedHypertension(this.hypertensionSelected);
    });
    this.diabetesConfirmedSubscription = this.idrsScoreService.confirmedDiabeticSelectedFlag$.subscribe(response => {
      this.confirmedDiabeticValue = response;
      this.changeOfConfirmedDiabetes(this.confirmedDiabeticValue);
     });
   this.systolicSubscription = this.idrsScoreService.systolicBpValue$.subscribe(response => {
      this.systolicBpValue = response
      this.changeOfSystolicBp();
      console.log("score", this.RBSTestScore);
     });
    this.diastolicSubscription = this.idrsScoreService.diastolicBpValue$.subscribe(response => {
      this.diastolicBpValue = response
       this.changeOdDiastolicBp(this.diastolicBpValue);
    });
    /* RBS value from vitals */
    this.rbsTestResultSubscription = this.nurseService.rbsTestResultCurrent$.subscribe(response => {
      if(response !== undefined && response !== null) {
        // this.RBSTestScore = response;
        this.RBSTestScoreInVitals = response;
        this.RBSTestDoneInVitals = true;
        this.checkRBSScore();
        this.rbsTestResultCurrent = response;
      } else {
        // this.RBSTestScore = response;
        this.RBSTestScoreInVitals = response;
        this.RBSTestDoneInVitals = false;
        this.rbsTestResultCurrent = null;
        this.checkRBSScore();
      }
    });
    this.checkForDiabetesSuspected();
  
  }
  checkForDiabetesSuspected() {
    if ((this.diabetesSelected === 1 && this.RBSTestScoreInVitals === null)) {
      this.RBSTestDoneInVitals = false;
    }
  }
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
    }
  ngOnDestroy() {
    if (this.nurseMasterDataSubscription)
      this.nurseMasterDataSubscription.unsubscribe();
    if (this.doctorMasterDataSubscription)
      this.doctorMasterDataSubscription.unsubscribe();
    if (this.investigationSubscription)
      this.investigationSubscription.unsubscribe();
    if (this.diabestesSuspectedSubscription)
      this.diabestesSuspectedSubscription.unsubscribe();
    if (this.hyperSuspectedSubscription)
      this.hyperSuspectedSubscription.unsubscribe();
    if (this.systolicSubscription)
      this.systolicSubscription.unsubscribe();
    if (this.diastolicSubscription)
      this.diastolicSubscription.unsubscribe();
    if (this.rbsTestResultSubscription)
      this.rbsTestResultSubscription.unsubscribe();
  }

  investigationSubscription: any;
  getInvestigationDetails(beneficiaryRegID, visitID, visitCategory) {
    this.investigationSubscription = this.doctorService.getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data && res.data.investigation) {
          console.log(res, 'investigations')
          this.patchInvestigationDetails(res.data.investigation, res.data.diagnosis);
          this.checkTestScore(res.data.LabReport);
        }
      })
  }

  patchInvestigationDetails(investigation, diagnosis) {
    let labTest = [];
    let radiologyTest = [];
    let externalInvestigation = "";

    if (investigation.laboratoryList) {
      this.previousLabTestList = investigation.laboratoryList;

      investigation.laboratoryList.map(item => {
        let temp = this.nonRadiologyMaster.filter(element => {
          return element.procedureID == item.procedureID
        });
        if (temp.length > 0)
          labTest.push(temp[0])
      })

      investigation.laboratoryList.map(item => {
        let temp = this.radiologyMaster.filter(element => {
          return element.procedureID == item.procedureID
        });
        if (temp.length > 0)
          radiologyTest.push(temp[0])

        //checking RBS test is prescribed or not
       if ((item.procedureName).toLowerCase() == (environment.RBSTest).toLowerCase()) {
          this.rbsSelectedInInvestigation = true;
          this.nurseService.setRbsSelectedInInvestigation(true);
        }
        if ((item.procedureName).toLowerCase() == (environment.haemoglobinTest).toLowerCase()) {
          this.hemoglobbinSelected = true;
        }
        if ((item.procedureName).toLowerCase() == (environment.visualAcuityTest).toLowerCase()) {
          this.VisualAcuityTestDone = true;
        }
      })
    }

    if (diagnosis && diagnosis.externalInvestigation) {
      externalInvestigation = diagnosis.externalInvestigation;
    }

    this.generalDoctorInvestigationForm.patchValue({ labTest, radiologyTest, externalInvestigations: externalInvestigation });
  }

  nurseMasterDataSubscription: any;
  getNurseMasterData() {
    this.nurseMasterDataSubscription = this.masterdataService.nurseMasterData$
      .subscribe(masterData => {
        if (masterData && masterData.procedures) {
          this.nonRadiologyMaster = masterData.procedures.filter(item => {
            return item.procedureType == 'Laboratory';
          })
          this.radiologyMaster = masterData.procedures.filter(item => {
            return item.procedureType == 'Radiology';
          })
          // checking RBS and Visual acuity is present or not.
          this.nonRadiologyMaster.forEach(element => {
            if ((element.procedureName).toLowerCase() == (environment.RBSTest).toLowerCase()) {
              this.rbsPresent = true;
              this.idrsScoreService.rBSPresentInMaster();
            }
            if ((element.procedureName).toLowerCase() == (environment.visualAcuityTest).toLowerCase()) {
              this.visualAcuityPresent = true;
              this.idrsScoreService.visualAcuityPresentInMaster();
            }
            if ((element.procedureName).toLowerCase() == (environment.haemoglobinTest).toLowerCase()) {
              this.idrsScoreService.haemoglobinPresentInMaster();
            }
          });

          if (this.caseRecordMode == 'view') {
            this.beneficiaryRegID = localStorage.getItem('beneficiaryRegID');
            this.visitID = localStorage.getItem('visitID');
            this.visitCategory = localStorage.getItem('visitCategory');
            this.getInvestigationDetails(this.beneficiaryRegID, this.visitID, this.visitCategory);
          }
        }
      });
  }

  doctorMasterDataSubscription: any;
  getDoctorMasterData() {
    this.doctorMasterDataSubscription = this.masterdataService.doctorMasterData$.subscribe(masterData => {
      if (masterData) {
        console.log('doctor master', masterData);
      }
    });
  }

  canDisable(test) {
    if(((this.rbsTestResultCurrent !=null && this.rbsTestResultCurrent !=undefined)|| 
    this.nurseService.rbsTestResultFromDoctorFetch !=null) && ((test.procedureName).toLowerCase() == (environment.RBSTest).toLowerCase()))
      {
       // test.checked=true;
        return true;
      }
      // else if(((this.rbsTestResultCurrent == null || this.rbsTestResultCurrent == undefined) &&  
      // this.nurseService.rbsTestResultFromDoctorFetch ==null) && test.procedureName == environment.RBSTest)
      // {
      //   test.checked=false;
      // }
    if (this.previousLabTestList) {
      let temp = this.previousLabTestList.filter(item => {
        return item.procedureID == test.procedureID;
      })
        
      if (temp.length > 0 )
        test.disabled = true;
      else
        test.disabled = false;
      
      return temp.length > 0;
    }
  }
  checkTestScore(labreports) {

    labreports.forEach(element => {
      if ((element.procedureName).toLowerCase() == (environment.RBSTest).toLowerCase()) {
        this.RBSTestScore = element.componentList[0].testResultValue
      }
    });

    // if (this.RBSTestScore > 200 || this.systolicBpValue >= 140 || this.diastolicBpValue >= 90) {
   this.checkRBSScore();

  }
  checkRBSScore() {
    if ((this.RBSTestScore > 200) || this.RBSTestScoreInVitals > 200 || (this.hypertensionSelected === 0 && this.systolicBpValue >= 140) || (this.hypertensionSelected === 0 && this.diastolicBpValue >= 90)) {
      this.VisualAcuityMandatory = true;
      this.idrsScoreService.setVisualAcuityTestMandatoryFlag();
      this.idrsScoreService.setTMCSuggested();
    } else {
      this.VisualAcuityMandatory = false;
      this.idrsScoreService.clearVisualAcuityTestMandatoryFlag();
      this.idrsScoreService.clearTMCSuggested();
    }
  }
  checkTestName(event) {
    console.log("testName", event);
    this.VisualAcuityTestDone = false;
    let item = event.value;
    let oneSelected = 0;
    this.rbsSelectedInInvestigation =false;
    this.hemoglobbinSelected = false;
    this.nurseService.setRbsSelectedInInvestigation(false);
    item.forEach(element => {
      if ((element.procedureName).toLowerCase() == (environment.RBSTest).toLowerCase()) {
        this.rbsSelectedInInvestigation =true;
        this.nurseService.setRbsSelectedInInvestigation(true);
        oneSelected++;
      }
      if ((element.procedureName).toLowerCase() == (environment.visualAcuityTest).toLowerCase()) {
        this.VisualAcuityTestDone = true;
      }
      if ((element.procedureName).toLowerCase() == (environment.haemoglobinTest).toLowerCase()) {
        oneSelected++;
        this.hemoglobbinSelected = true;
      }
    });
  }
  changeOfSystolicBp() {
    if ((this.RBSTestScore > 200) || this.RBSTestScoreInVitals > 200 || (this.hypertensionSelected === 0 && this.systolicBpValue >= 140) || (this.hypertensionSelected === 0 && this.diastolicBpValue >= 90)) {
      this.VisualAcuityMandatory = true;
      this.idrsScoreService.setVisualAcuityTestMandatoryFlag();
      this.idrsScoreService.setTMCSuggested();
    } else {
      this.VisualAcuityMandatory = false;
      this.idrsScoreService.clearVisualAcuityTestMandatoryFlag();
      this.idrsScoreService.clearTMCSuggested();
    }
  }
  changeOdDiastolicBp(diastolicBp) {
    if ((this.RBSTestScore > 200) || this.RBSTestScoreInVitals > 200 || (this.hypertensionSelected === 0 && this.systolicBpValue >= 140) || (this.hypertensionSelected === 0 && diastolicBp >= 90)) {
      this.VisualAcuityMandatory = true;
      this.idrsScoreService.setVisualAcuityTestMandatoryFlag();
      this.idrsScoreService.setTMCSuggested();

    } else {
      this.VisualAcuityMandatory = false;
      this.idrsScoreService.clearVisualAcuityTestMandatoryFlag();
      this.idrsScoreService.clearTMCSuggested();
    }
  }

  changeOfConfirmedDiabetes(confirmedDiabeticVal) {
    if ((this.RBSTestScore > 200) || this.RBSTestScoreInVitals > 200 || (this.hypertensionSelected === 0 && this.systolicBpValue >= 140) || (this.hypertensionSelected === 0 && this.diastolicBpValue >= 90)) {
      this.VisualAcuityMandatory = true;
      this.idrsScoreService.setVisualAcuityTestMandatoryFlag();
      this.idrsScoreService.setTMCSuggested();
    } else {
      this.VisualAcuityMandatory = false;
      this.idrsScoreService.clearVisualAcuityTestMandatoryFlag();
      this.idrsScoreService.clearTMCSuggested();
    }
  }

  changeOfConfirmedHypertension(confirmedHypertensionVal) {
    if ((this.RBSTestScore > 200)|| this.RBSTestScoreInVitals > 200 || (confirmedHypertensionVal === 0 && this.systolicBpValue >= 140) || (confirmedHypertensionVal === 0 && this.diastolicBpValue >= 90)) {
      this.VisualAcuityMandatory = true;
      this.idrsScoreService.setVisualAcuityTestMandatoryFlag();
      this.idrsScoreService.setTMCSuggested();

    } else {
      this.VisualAcuityMandatory = false;
      this.idrsScoreService.clearVisualAcuityTestMandatoryFlag();
      this.idrsScoreService.clearTMCSuggested();
    }
  }
}

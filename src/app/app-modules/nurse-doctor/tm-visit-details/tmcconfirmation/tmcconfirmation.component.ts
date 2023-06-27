import { Component, Input, OnInit, Injector } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'app/app-modules/core/services';
import { NurseService, DoctorService } from '../../shared/services';
import { MasterdataService } from '../../shared/services/masterdata.service';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { DataSyncService } from '../../../data-sync/shared/service/data-sync.service';
import { DataSyncLoginComponent } from '../../../core/components/data-sync-login/data-sync-login.component';
import { IdrsscoreService } from '../../shared/services/idrsscore.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';


@Component({
  selector: 'app-tmcconfirmation',
  templateUrl: './tmcconfirmation.component.html',
  styleUrls: ['./tmcconfirmation.component.css']
})
export class TmcconfirmationComponent implements OnInit {

  @Input('mode')
  mode: String;

  @Input('tmcConfirmationFormsGroup')
  tmcConfirmationFormsGroup: FormGroup;

  @Input('patientVisitDetailsForm')
  patientVisitDetailsForm: FormGroup;

  additionalServices: any;
  higherHealthcareCenter: any;
  visitCategory: any;
  visitCategoryList: any;
  previousServiceList: any;
  selectValueService: any;
  beneficiaryData: any;
  userName: string;
  password: string;

  isDiabetic: any = false;
  beneficiaryRegID: string;
  visitID: string;
  referSubscription: any;
  defaultCentre: any;
  prescribedDrugDataFromCaseSheet: any;

  dynamictype = "password";
  dialogRef: any;
  data: any;
  casesheetSubs: any;
  caseSheetData: any;
  disableNoOnSuccessOfYes: any;
  showRadio: boolean = false;
  confirmedDisease: any;
  currentLanguageSet: any;

  constructor(private masterdataService: MasterdataService,
    private confirmationService: ConfirmationService,
    private router: Router,

    private nurseService: NurseService,
    private doctorService: DoctorService,
    private injector: Injector,
    private dataSyncService: DataSyncService,
    private dialog: MdDialog,
    private idrsScoreService: IdrsscoreService,
    private httpServices: HttpServiceService) { }

  ngOnInit() {
    this.assignSelectedLanguage();
    //this.visitCategory = localStorage.getItem("visiCategoryANC");
    this.visitCategory = this.patientVisitDetailsForm.controls["visitCategory"].value;
    this.getVisitReasonAndCategory();
    sessionStorage.removeItem("tmCaseSheet");
    // this.checkDiabetes();
    // this.checkHypertensionAndDiabetics()
    if (this.tmcConfirmationFormsGroup.value.tmcConfirmed){
      this.showRadio = true;
      if(this.idrsScoreService.isHypertensionConfirmed){
        this.tmcConfirmationFormsGroup.patchValue({ 'isHypertensionConfirmed': true });
      }else{
        this.tmcConfirmationFormsGroup.patchValue({ 'isHypertensionConfirmed': false });
      }
      if(this.idrsScoreService.isDiabeticsConfirmed){
        this.tmcConfirmationFormsGroup.patchValue({ 'isDiabetic': true });
      }else{
        this.tmcConfirmationFormsGroup.patchValue({ 'isDiabetic': false });
      }
    }
      
    else
      this.showRadio = false;
    if (this.doctorService.prescribedDrugData) {
      this.prescribedDrugDataFromCaseSheet = this.doctorService.prescribedDrugData;
    }
    if (localStorage.getItem('disableNoOnSuccessOfYes') === "true") {
      this.disableNoOnSuccessOfYes = true;
    } else {
      this.disableNoOnSuccessOfYes = false;
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
  ngOnDestroy() {
    if (this.visitDetailMasterDataSubscription)
      this.visitDetailMasterDataSubscription.unsubscribe();
    // sessionStorage.removeItem("tmCaseSheet");
  }
  getReferDetails() {
    this.beneficiaryRegID = localStorage.getItem('beneficiaryRegID');
    this.visitID = localStorage.getItem('visitID');
    //this.visitCategory = localStorage.getItem('visitCategory');
    this.referSubscription = this.doctorService.getCaseRecordAndReferDetails(this.beneficiaryRegID, this.visitID, this.visitCategory)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data && res.data.Refer) {
          let referedToInstitute = this.higherHealthcareCenter.filter(item => {
            return item.institutionID == res.data.Refer.referredToInstituteID;
          });
          if (referedToInstitute.length > 0) {
            res.data.Refer.referredToInstituteName = referedToInstitute[0];
            this.tmcConfirmationFormsGroup.patchValue({ 'refrredToAdditionalServiceList': res.data.Refer.referredToInstituteName });
            this.defaultCentre = referedToInstitute[0].institutionName;
            console.log("form", this.tmcConfirmationFormsGroup);
          }
        }
      })
  }
  checkDiabetes() {
    let obj = {
      "benRegID": localStorage.getItem('beneficiaryRegID')
    }
    this.nurseService.getPreviousVisitData(obj)
      .subscribe((res: any) => {
        if (res.statusCode == 200 && res.data != null) {
          console.log("visit", res);
          //if(res.data.isDiabetic)
          this.tmcConfirmationFormsGroup.patchValue({ 'isDiabetic': res.data.isDiabetic });
          console.log("diabet", this.tmcConfirmationFormsGroup);
        }
      });
  }
  resetAdditionalServiceList(tmcConfirmed) {
    if (tmcConfirmed.value) {
      this.idrsScoreService.setTMCSubmit(true);
      this.showRadio = true;
      //this.tmcConfirmationFormsGroup.patchValue({ refrredToAdditionalServiceList: null });
      this.tmcConfirmationFormsGroup.controls["refrredToAdditionalServiceList"].setErrors(null);
    }
    else {
      this.idrsScoreService.setTMCSubmit(false);
      this.showRadio = false;
      //this.tmcConfirmationFormsGroup.patchValue({ refrredToAdditionalServiceList: null });
      this.tmcConfirmationFormsGroup.controls["refrredToAdditionalServiceList"].setValidators(Validators.required);
    }
  }
  visitDetailMasterDataSubscription: any;
  getVisitReasonAndCategory() {
    this.masterdataService.getVisitDetailMasterData();
    this.visitDetailMasterDataSubscription = this.masterdataService.visitDetailMasterData$.subscribe(
      visitDetails => {
        if (visitDetails) {
          this.visitCategoryList = visitDetails.visitCategories;
          console.log("Visit Details Master Data", visitDetails);
          if (this.visitCategory) {
            this.getDoctorMasterData(this.visitCategory);
          }
        }
      }
    );
  }
  getVisitCategoryID(visitCategory: string) {
    if (visitCategory && this.visitCategoryList) {
      let temp = this.visitCategoryList.filter(category => {
        return category.visitCategory == visitCategory;
      });
      if (temp.length > 0) {
        localStorage.setItem('caseSheetVisitCategoryID', temp[0].visitCategoryID)
        return temp[0].visitCategoryID;
      }
    }
    return null;
  }
  getDoctorMasterData(visitCategory: string) {
    let visitID = this.getVisitCategoryID(this.visitCategory);
    let serviceProviderID = localStorage.getItem("providerServiceID");
    if (visitID) {
      this.masterdataService.getDoctorMasterDataForNurse(visitID, serviceProviderID)
        .subscribe((res) => {
          if (res.statusCode == 200 && res.data != null) {
            //this.additionalServices = res.data.additionalServices;
            this.higherHealthcareCenter = res.data.higherHealthCare;
            this.getReferDetails();
          }
        });
    }
  }
  // public additionalservices(selected: any): void {
  //   if (selected != null && selected.length > 0) {
  //     this.selectValueService = selected.length;
  //   }
  // }
  public higherhealthcarecenter(selected: any): void {
    console.log("form", this.tmcConfirmationFormsGroup);
    if (selected != null && selected.institutionName) {
      this.selectValueService = true;
    }
  }
  dataSync: boolean = false;
  viewAndPrintCaseSheet() {
    // this.confirmedDisease = res.data.nurseData.idrs.idrsDetail.confirmedDisease;
    this.onceAuthorizeViewTMCS();
    // this.openDialog();


  }
  onceAuthorizeViewTMCS() {
    this.beneficiaryData = JSON.parse(localStorage.getItem("beneficiaryData"))
    this.setCasesheetData(this.beneficiaryData);
    let caseSheetRequest;
    if (localStorage.getItem('caseSheetTMFlag') == "true" || parseInt(localStorage.getItem('specialistFlag')) == 200) {
      this.visitCategory = localStorage.getItem('caseSheetVisitCategory');
      caseSheetRequest = {
        "VisitCategory": localStorage.getItem('caseSheetVisitCategory'),
        "benFlowID": localStorage.getItem('caseSheetBenFlowID'),
        "benVisitID": localStorage.getItem('caseSheetVisitID'),
        "beneficiaryRegID": localStorage.getItem('caseSheetBeneficiaryRegID'),
        "visitCode": localStorage.getItem('caseSheetVisitCode')
        // "Auth": localStorage.getItem('serverKey')
        // "isCaseSheetdownloaded": localStorage.getItem('isCaseSheetdownloaded') == "true" ? true : false
      }
      this.getTMReferredCasesheetData(caseSheetRequest);
    }

  }

  getTMReferredCasesheetData(caseSheetRequest) {

    this.casesheetSubs = this.nurseService.getTMReferredCasesheetData(caseSheetRequest)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data) {
          this.idrsScoreService.setTMCSubmit(false);
          localStorage.setItem('disableNoOnSuccessOfYes', "true");
          sessionStorage.setItem("tmCaseSheet","true");
          this.disableNoOnSuccessOfYes = localStorage.getItem('disableNoOnSuccessOfYes');
          //checking hypertension in confirmed diseases
        
            this.checkHypertensionAndDiabetics(res.data.nurseData.idrs.IDRSDetail.confirmedDisease);
          
          
          // this.checkHypertensionAndDiabetics("test,Hypertension");
          this.confirmationService.confirm("info", this.currentLanguageSet.alerts.info.consulation).subscribe(res => {
            if (res) {
              this.routeToCaseSheet();
            }
          });
          this.caseSheetData = res.data;

        } else if (res.statusCode === 5003) {
          this.openDialog();
        }
        else {
          this.confirmationService.alert(res.errorMessage, 'error');
          this.idrsScoreService.setTMCSubmit(true);
        }
      }, (err) => {
        console.log(err, 'error');
        this.idrsScoreService.setTMCSubmit(true);
        this.confirmationService.alert(this.currentLanguageSet.errorInfetchingTMCasesheet, 'error');
      })
  }

  // marking Yes and NO for hypertension confiramtion 
  checkHypertensionAndDiabetics(confirmedDisease: any) {
    var strHypertension = "Hypertension";
    var strDiabetics = "Diabetes";
    if (confirmedDisease !== undefined && confirmedDisease !== null  && confirmedDisease.includes(strHypertension)){
      this.tmcConfirmationFormsGroup.patchValue({ 'isHypertensionConfirmed': true });
      this.idrsScoreService.isHypertensionConfirmed = true;
    }      
    else{
      this.tmcConfirmationFormsGroup.patchValue({ 'isHypertensionConfirmed': false });
      this.idrsScoreService.isHypertensionConfirmed = false;
    }
    if (confirmedDisease !== undefined && confirmedDisease !== null  && confirmedDisease.includes(strDiabetics)){
      this.tmcConfirmationFormsGroup.patchValue({ 'isDiabetic': true });
      this.idrsScoreService.isDiabeticsConfirmed = true;
    }      
    else{
      this.tmcConfirmationFormsGroup.patchValue({ 'isDiabetic': false });
      this.idrsScoreService.isDiabeticsConfirmed = false;
    }

  }
  setCasesheetData(beneficiary) {
    localStorage.setItem("caseSheetBenFlowID", beneficiary.benFlowID);
    localStorage.setItem("caseSheetVisitCategory", beneficiary.VisitCategory);
    localStorage.setItem("caseSheetBeneficiaryRegID", beneficiary.beneficiaryRegID);
    localStorage.setItem("caseSheetVisitID", beneficiary.benVisitID);
    localStorage.setItem("caseSheetVisitCode", beneficiary.visitCode);
    localStorage.setItem("caseSheetTMFlag", "true");

  }
  routeToCaseSheet() {
    this.router.navigate(["/common/print/" + 'MMU' + '/' + 'current']);
  }
  loginDialogRef: MdDialogRef<DataSyncLoginComponent>;
  openDialog() {
    this.loginDialogRef = this.dialog.open(DataSyncLoginComponent, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: 'fit-screen',
      backdropClass: 'backdrop',
      position: { top: "20px" },
      data: {
        provideAuthorizationToViewTmCS: true
      }

    })
    this.loginDialogRef.afterClosed().subscribe((result) => {
      if (result && sessionStorage.getItem('authorizeToViewTMcasesheet') === 'Authorized') {
        console.log(result, 'authorized');
        this.onceAuthorizeViewTMCS();
      }
    })
  }

}

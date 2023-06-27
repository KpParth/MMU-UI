import { Component, OnInit, Input, DoCheck } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

import {
  MasterdataService,
  DoctorService,
  NurseService,
} from "../../shared/services";
import { DatePipe } from "@angular/common";
import { IdrsscoreService } from "../../shared/services/idrsscore.service";
import { ConfirmationService } from "app/app-modules/core/services";
import { PreviousDetailsComponent } from "app/app-modules/core/components/previous-details/previous-details.component";
import { MdDialog } from "@angular/material";
import { SetLanguageComponent } from "app/app-modules/core/components/set-language.component";
import { HttpServiceService } from "app/app-modules/core/services/http-service.service";

@Component({
  selector: "app-general-refer",
  templateUrl: "./general-refer.component.html",
  styleUrls: ["./general-refer.component.css"],
  providers: [DatePipe],
})
export class GeneralReferComponent implements OnInit, DoCheck {
  @Input("referForm")
  referForm: FormGroup;

  @Input("referMode")
  referMode: String;

  revisitDate: any;
  tomorrow: any;
  maxSchedulerDate: any;
  today: any;
  higherHealthcareCenter: any;
  additionalServices: any;
  beneficiaryRegID: any;
  visitID: any;
  visitCategory: any;

  previousServiceList: any;
  referralReason: any;
  selectValue: any;
  selectValueService: any;
  healthCareReferred: boolean = false;
  showMsg: any = 0;
  tmcSuggested: any = 0;
  instituteFlag: boolean = false;
  hypertensionSelected: any = 0;
  confirmedDiabeticValue: any;
  currentLanguageSet: any;
  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    public datepipe: DatePipe,
    private masterdataService: MasterdataService,
    private idrsScoreService: IdrsscoreService,
    private nurseService: NurseService,
    private dialog: MdDialog,
    private confirmationService: ConfirmationService,
    private httpServices: HttpServiceService
  ) {}

  ngOnInit() {
    this.assignSelectedLanguage();
    this.visitCategory = localStorage.getItem("visitCategory");
    this.getDoctorMasterData();

    // this.idrsScoreService.clearHypertensionSelected();
    // this.idrsScoreService.clearConfirmedDiabeticSelected();
    // this.idrsScoreService.hypertensionSelectedFlag$.subscribe(response => this.hypertensionSelected = response);
    // this.idrsScoreService.confirmedDiabeticSelectedFlag$.subscribe(response => {
    //   this.confirmedDiabeticValue = response;
    //  });
    this.idrsScoreService.IDRSSuspectedFlag$.subscribe((response) => {
      this.showMsg = response;
      if (this.showMsg > 0) sessionStorage.setItem("suspectFlag", "true");
      else sessionStorage.setItem("suspectFlag", "false");
    });
    this.idrsScoreService.tmcSuggestedFlag$.subscribe(
      (response) => (this.tmcSuggested = response)
    );
    this.idrsScoreService.referralSuggestedFlag$.subscribe((response) => {
      this.showMsg = response;
      if (this.showMsg > 0) sessionStorage.setItem("suspectFlag", "true");
      else sessionStorage.setItem("suspectFlag", "false");
    });
    this.today = new Date();
    let d = new Date();
    let checkdate = new Date();
    d.setDate(d.getDate() + 1);
    checkdate.setMonth(this.today.getMonth() + 3);
    this.maxSchedulerDate = checkdate;
    this.tomorrow = d;
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
  ngOnChanges() {}

  ngOnDestroy() {
    if (this.doctorMasterDataSubscription)
      this.doctorMasterDataSubscription.unsubscribe();
    if (this.referSubscription) this.referSubscription.unsubscribe();

    this.idrsScoreService.clearSuspectedArrayFlag();
    this.idrsScoreService.clearTMCSuggested();
    this.idrsScoreService.clearReferralSuggested();
  }

  doctorMasterDataSubscription: any;
  getDoctorMasterData() {
    this.doctorMasterDataSubscription =
      this.masterdataService.doctorMasterData$.subscribe((masterData) => {
        if (masterData) {
          this.higherHealthcareCenter = masterData.higherHealthCare;
          if (this.higherHealthcareCenter.length == 0) {
            this.instituteFlag = false;
            sessionStorage.setItem("instFlag", "false");
          } else {
            this.instituteFlag = true;
            sessionStorage.setItem("instFlag", "true");
          }
          this.additionalServices = masterData.additionalServices;
          console.log(masterData.revisitDate);
          console.log("hi");
          this.revisitDate = masterData.revisitDate;

          if (this.referMode == "view") {
            this.beneficiaryRegID = localStorage.getItem("beneficiaryRegID");
            this.visitID = localStorage.getItem("visitID");
            this.visitCategory = localStorage.getItem("visitCategory");
            this.getReferDetails(
              this.beneficiaryRegID,
              this.visitID,
              this.visitCategory
            );
          }
        }
      });
  }

  referSubscription: any;
  getReferDetails(beneficiaryRegID, visitID, visitCategory) {
    this.referSubscription = this.doctorService
      .getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
      .subscribe((res) => {
        if (res && res.statusCode == 200 && res.data && res.data.Refer) {
          this.patchReferDetails(res.data.Refer);
        }
      });
  }

  patchReferDetails(referDetails) {
    this.revisitDate = referDetails.revisitDate;
    this.referralReason = referDetails.referralReason;
    this.revisitDate = this.datepipe.transform(this.revisitDate, "yyyy-MM-dd");
    let temp = [];
    if (referDetails.refrredToAdditionalServiceList) {
      this.previousServiceList = referDetails.refrredToAdditionalServiceList;
      referDetails.refrredToAdditionalServiceList.map((item) => {
        let arr = this.additionalServices.filter((element) => {
          return element.serviceName == item.serviceName;
        });
        if (arr.length > 0) temp.push(arr[0]);
      });
    }
    referDetails.refrredToAdditionalServiceList = temp.slice();

    let referedToInstitute = this.higherHealthcareCenter.filter((item) => {
      return item.institutionID == referDetails.referredToInstituteID;
    });
    if (referedToInstitute.length > 0) {
      referDetails.referredToInstituteName = referedToInstitute[0];
    }
    if (referDetails.referralReason != null) {
    }
    console.log("referredDet=" + referDetails);
    console.log("revisitDate" + this.revisitDate);
    referDetails.revisitDate = this.revisitDate;
    referDetails.referralReason = this.referralReason;
    this.referForm.patchValue({ referralReason: referDetails.referralReason });
    this.referForm.patchValue(referDetails);
    if (referDetails.referredToInstituteName != null) {
      this.healthCareReferred = true;
    }
  }
  get RevisitDate() {
    return this.referForm.get("revisitDate");
  }

  get ReferralReason() {
    return this.referForm.get("referralReason");
  }

  checkdate(revisitDate) {
    this.today = new Date();
    let d = new Date();
    let checkdate = new Date();
    d.setDate(d.getDate() + 1);
    checkdate.setMonth(this.today.getMonth() + 3);
    this.maxSchedulerDate = checkdate;
    this.tomorrow = d;
  }

  canDisable(service) {
    if (this.previousServiceList) {
      let temp = this.previousServiceList.filter((item) => {
        return item.serviceID == service.serviceID;
      });

      if (temp.length > 0) service.disabled = true;
      else service.disabled = false;

      return temp.length > 0;
    }
  }
  public additionalservices(selected: any): void {
    if (selected != null && selected.length > 0) {
      this.selectValueService = selected.length;
      console.log(this.selectValueService);
    }

    // should display the selected option.
  }

  public higherhealthcarecenter(selected: any): void {
    if (selected != null && selected.institutionName) {
      this.selectValue = 1;
      this.healthCareReferred = true;
    } // should display the selected option.

    console.log(this.selectValue);
  }

  getPreviousReferralHistory() {
    let benRegID = localStorage.getItem("beneficiaryRegID");
    this.nurseService
      .getPreviousReferredHistory(benRegID, this.visitCategory)
      .subscribe(
        (res) => {
          if (res.statusCode == 200 && res.data != null) {
            if (res.data.data.length > 0) {
              this.viewPreviousData(res.data);
            } else {
              this.confirmationService.alert(
                this.currentLanguageSet.Referdetails.previousReferralhistorynotAvailable
              );
            }
          } else {
            this.confirmationService.alert(
              "Error in fetching previous history",
              "error"
            );
          }
        },
        (err) => {
          this.confirmationService.alert(
            "Error in fetching previous history",
            "error"
          );
        }
      );
  }

  viewPreviousData(data) {
    this.dialog.open(PreviousDetailsComponent, {
      data: { dataList: data, title:  this.currentLanguageSet.previousReferralHistoryDetails},
    });
  }
}

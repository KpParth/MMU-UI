import { Component, OnInit, Input, DoCheck } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { SetLanguageComponent } from "app/app-modules/core/components/set-language.component";
import { HttpServiceService } from "app/app-modules/core/services/http-service.service";
import { MasterdataService, DoctorService } from "../../shared/services";

@Component({
  selector: "app-cancer-refer",
  templateUrl: "./cancer-refer.component.html",
  styleUrls: ["./cancer-refer.component.css"],
})
export class CancerReferComponent implements OnInit, DoCheck {
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
  referralReason: any;
  selectValue: any;
  currentLanguageSet: any;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private masterdataService: MasterdataService,
    private httpServices: HttpServiceService
  ) {}

  ngOnInit() {
    this.assignSelectedLanguage();
    this.getDoctorMasterData();
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
  ngOnDestroy() {
    if (this.doctorMasterDataSubscription)
      this.doctorMasterDataSubscription.unsubscribe();
    if (this.referSubscription) this.referSubscription.unsubscribe();
  }

  doctorMasterDataSubscription: any;
  getDoctorMasterData() {
    this.doctorMasterDataSubscription =
      this.masterdataService.doctorMasterData$.subscribe((masterData) => {
        if (masterData) {
          this.higherHealthcareCenter = masterData.higherHealthCare;
          this.additionalServices = masterData.additionalServices;
          this.referralReason = masterData.referralReason;
          console.log(masterData.revisitDate);
          console.log("hi");
          this.revisitDate = masterData.revisitDate;

          if (this.referMode == "view") {
            let beneficiaryRegID = localStorage.getItem("beneficiaryRegID");
            let visitID = localStorage.getItem("visitID");
            let visitCategory = localStorage.getItem("visitCategory");
            if (localStorage.getItem("doctorFlag") == "9") {
              this.getReferDetails(beneficiaryRegID, visitID, visitCategory);
            }
          }
        }
      });
  }

  referSubscription: any;
  getReferDetails(beneficiaryRegID, visitID, visitCategory) {
    this.referSubscription = this.doctorService
      .getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
      .subscribe((res) => {
        if (res && res.statusCode == 200 && res.data && res.data.diagnosis) {
          console.log("referdetails", res.data.diagnosis);

          this.patchReferDetails(res.data.diagnosis);
        }
      });
  }
  previousServiceList = [];
  patchReferDetails(referDetails) {
    this.revisitDate = referDetails.revisitDate;
    this.referralReason = referDetails.referralReason;
    let temp = [];
    if (referDetails.refrredToAdditionalServiceList) {
      this.previousServiceList = referDetails.refrredToAdditionalServiceList;
      referDetails.refrredToAdditionalServiceList.map((item) => {
        let arr = this.additionalServices.filter((element) => {
          if (element.serviceName == item) {
            temp.push(element.serviceName);
            return true;
          } else {
            return false;
          }
        });
      });
    }
    referDetails.refrredToAdditionalServiceList = temp.slice();

    console.log("referDetails", referDetails);
    let referedToInstitute = this.higherHealthcareCenter.filter((item) => {
      return item.institutionID == referDetails.referredToInstituteID;
    })[0];
    if (referedToInstitute)
      referDetails.referredToInstituteID = referedToInstitute.institutionID;
    if (referDetails.referralReason != null) {
    }

    referDetails.revisitDate = this.revisitDate;
    console.log("referredDet=" + referDetails);
    referDetails.referralReason = this.referralReason;
    this.referForm.patchValue({ referralReason: referDetails.referralReason });
    this.referForm.patchValue(referDetails);
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
        return item == service.serviceName;
      });

      if (temp.length > 0) service.disabled = true;
      else service.disabled = false;

      return temp.length > 0;
    }
  }

  public additionalservices(selected: any): void {
    if(selected !=undefined && selected !=null)
    this.selectValue = selected.length;
    // should display the selected option.
  }

  public higherhealthcarecenter(selected: any): void {
    this.selectValue = selected;
    // should display the selected option.
  }
}

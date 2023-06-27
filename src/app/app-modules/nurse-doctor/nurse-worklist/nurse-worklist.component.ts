import { Component, DoCheck, Input, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ConfirmationService } from "../../core/services/confirmation.service";
import { NurseService } from "../shared/services";
import { CameraService } from "../../core/services/camera.service";
import { BeneficiaryDetailsService } from "../../core/services/beneficiary-details.service";
import { SetLanguageComponent } from "app/app-modules/core/components/set-language.component";
import { HttpServiceService } from "app/app-modules/core/services/http-service.service";

@Component({
  selector: "app-nurse-worklist",
  templateUrl: "./nurse-worklist.component.html",
  styleUrls: ["./nurse-worklist.component.css"],
})
export class NurseWorklistComponent implements OnInit, DoCheck {
  rowsPerPage = 5;
  activePage = 1;
  pagedList = [];
  rotate = true;

  blankTable = [1, 2, 3, 4, 5];
  beneficiaryList: any;
  filteredBeneficiaryList = [];
  filterTerm;
  currentLanguageSet: any;
  currentPage: number;
  constructor(
    private nurseService: NurseService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private cameraService: CameraService,
    private beneficiaryDetailsService: BeneficiaryDetailsService,
    private httpServices: HttpServiceService
  ) {}

  ngOnInit() {
    this.assignSelectedLanguage();
    localStorage.setItem("currentRole", "Nurse");
    this.removeBeneficiaryDataForNurseVisit();
    this.getNurseWorklist();
    this.beneficiaryDetailsService.reset();
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
    localStorage.removeItem("currentRole");
  }

  removeBeneficiaryDataForNurseVisit() {
    localStorage.removeItem("visitCode");
    localStorage.removeItem("beneficiaryGender");
    localStorage.removeItem("benFlowID");
    localStorage.removeItem("visitCategory");
    localStorage.removeItem("beneficiaryRegID");
    localStorage.removeItem("visitID");
    localStorage.removeItem("beneficiaryID");
    localStorage.removeItem("doctorFlag");
    localStorage.removeItem("nurseFlag");
    localStorage.removeItem("pharmacist_flag");
    localStorage.removeItem("caseSheetTMFlag");
  }

  getNurseWorklist() {
    this.nurseService.getNurseWorklist().subscribe(
      (res) => {
        if (res.statusCode == 200 && res.data != null) {
          const benlist = this.loadDataToBenList(res.data);
          this.beneficiaryList = benlist;
          this.filteredBeneficiaryList = benlist;
          this.pageChanged({
            page: this.activePage,
            itemsPerPage: this.rowsPerPage,
          });
          this.filterTerm = null;
          this.currentPage=1;
        } else this.confirmationService.alert(res.errorMessage, "error");
      },
      (err) => {
        this.confirmationService.alert(err, "error");
      }
    );
  }

  loadDataToBenList(data) {
    data.forEach((element) => {
      element.genderName = element.genderName || "Not Available";
      element.age = element.age || "Not Available";
      element.benVisitNo = element.benVisitNo || "Not Available";
      element.districtName = element.districtName || "Not Available";
      element.villageName = element.villageName || "Not Available";
      element.fatherName = element.fatherName || "Not Available";
      element.preferredPhoneNum = element.preferredPhoneNum || "Not Available";
    });
    return data;
  }

  pageChanged(event): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.pagedList = this.filteredBeneficiaryList.slice(startItem, endItem);
  }

  patientImageView(benregID: any) {
    this.beneficiaryDetailsService
      .getBeneficiaryImage(benregID)
      .subscribe((data) => {
        if (data && data.benImage) this.cameraService.viewImage(data.benImage);
        else this.confirmationService.alert(this.currentLanguageSet.alerts.info.imageNotFound);
      });
  }

  loadNursePatientDetails(beneficiary) {
    localStorage.removeItem("visitCategory");

    //for WDF requirment
    // if (beneficiary.nurseFlag == 100) {
    //   this.confirmationService.confirm(`info`, `Please confirm to proceed further`)
    //     .subscribe(result => {
    //       if (result) {
    //         localStorage.setItem('visitCode', beneficiary.visitCode);
    //         localStorage.setItem('beneficiaryGender', beneficiary.genderName);
    //         localStorage.setItem('visitCategory', "NCD screening");
    //         localStorage.setItem('visitID', beneficiary.benVisitID);
    //         localStorage.setItem('nurseFlag', beneficiary.nurseFlag);
    //         localStorage.setItem('beneficiaryRegID', beneficiary.beneficiaryRegID);
    //         localStorage.setItem('benFlowID', beneficiary.benFlowID);
    //         localStorage.setItem('beneficiaryID', beneficiary.beneficiaryID);
    //         this.router.navigate(['/common/attendant/nurse/patient/', beneficiary.beneficiaryRegID]);
    //       }
    //     });
    // } else
    {
      this.confirmationService
        .confirm(`info`, this.currentLanguageSet.alerts.info.confirmtoProceedFurther)
        .subscribe((result) => {
          if (result) {
            localStorage.setItem("beneficiaryGender", beneficiary.genderName);
            localStorage.setItem(
              "beneficiaryRegID",
              beneficiary.beneficiaryRegID
            );
            localStorage.setItem("benFlowID", beneficiary.benFlowID);
            localStorage.setItem("beneficiaryID", beneficiary.beneficiaryID);
            localStorage.setItem("benVisitNo", beneficiary.benVisitNo);
            this.router.navigate([
              "/common/attendant/nurse/patient/",
              beneficiary.beneficiaryRegID,
            ]);
          }
        });
    }
  }

  filterBeneficiaryList(searchTerm: string) {
    if (!searchTerm) this.filteredBeneficiaryList = this.beneficiaryList;
    else {
      this.filteredBeneficiaryList = [];
      this.beneficiaryList.forEach((item) => {
        console.log("item", JSON.stringify(item, null, 4));
        for (let key in item) {
          if (
            key == "beneficiaryID" ||
            key == "benName" ||
            key == "genderName" ||
            key == "fatherName" ||
            key == "districtName" ||
            key == "preferredPhoneNum" ||
            key == "villageName"
          ) {
            let value: string = "" + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredBeneficiaryList.push(item);
              break;
            }
          } else {
            if (key == "benVisitNo") {
              let value: string = "" + item[key];
              if (value == "1") {
                let val = "First visit";
                if (val.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
                  this.filteredBeneficiaryList.push(item);
                  break;
                }
              } else {
                let val = "Revist";
                if (val.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
                  this.filteredBeneficiaryList.push(item);
                  break;
                }
              }
            }
          }
        }
      });
    }
    this.activePage = 1;
    this.pageChanged({
      page: 1,
      itemsPerPage: this.rowsPerPage,
    });
    this.currentPage=1;
  }

  // rebash() {
  //   this.beneficiaryDetailsService.getCheck()
  //   .subscribe(data => {
  //     console.log(data);
  //   })
  // }
}

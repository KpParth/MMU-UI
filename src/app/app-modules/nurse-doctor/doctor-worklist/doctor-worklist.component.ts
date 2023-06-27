import { Component, OnInit, OnDestroy, Input, DoCheck } from "@angular/core";
import { Router } from "@angular/router";
import { MdDialogRef, MdDialog, MdDialogConfig } from "@angular/material";

import { BeneficiaryDetailsService } from "../../core/services/beneficiary-details.service";
import { ConfirmationService } from "../../core/services/confirmation.service";
import { DoctorService, MasterdataService } from "../shared/services";
import { CameraService } from "../../core/services/camera.service";

import { environment } from "environments/environment";

import * as moment from "moment";
import { SetLanguageComponent } from "app/app-modules/core/components/set-language.component";
import { HttpServiceService } from "app/app-modules/core/services/http-service.service";
@Component({
  selector: "app-doctor-worklist",
  templateUrl: "./doctor-worklist.component.html",
  styleUrls: ["./doctor-worklist.component.css"]
})
export class DoctorWorklistComponent implements OnInit, OnDestroy, DoCheck {
  rowsPerPage = 5;
  activePage = 1;
  pagedList = [];
  rotate = true;
  beneficiaryList: any;
  filteredBeneficiaryList = [];
  blankTable = [1, 2, 3, 4, 5];
  filterTerm;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  beneficiaryMetaData: any;
  constructor(
    private dialog: MdDialog,
    private cameraService: CameraService,
    private router: Router,
    private masterdataService: MasterdataService,
    private confirmationService: ConfirmationService,
    private httpServiceService: HttpServiceService,
    private beneficiaryDetailsService: BeneficiaryDetailsService,
    private doctorService: DoctorService
  ) { }

  ngOnInit() {
    localStorage.setItem("currentRole", "Doctor");
    this.fetchLanguageResponse();
    this.removeBeneficiaryDataForDoctorVisit();
    this.loadWorklist();
    this.beneficiaryDetailsService.reset();
    this.masterdataService.reset();
  }

  ngOnDestroy() {
    localStorage.removeItem("currentRole");
  }

  removeBeneficiaryDataForDoctorVisit() {
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
    localStorage.removeItem('caseSheetTMFlag');
  }

  pageChanged(event): void {
    console.log("called", event);
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.pagedList = this.filteredBeneficiaryList.slice(startItem, endItem);
    console.log("list", this.pagedList);
  }

  loadWorklist() {
    this.filterTerm = null;
    this.beneficiaryMetaData = [];
    this.doctorService.getDoctorWorklist().subscribe(
      data => {
        if (data && data.statusCode == 200 && data.data) {
          console.log("doctor worklist", JSON.stringify(data.data, null, 4));
          this.beneficiaryMetaData = data.data;
          data.data.map(item => {
            let temp = this.getVisitStatus(item);
            item.statusMessage = temp.statusMessage;
            item.statusCode = temp.statusCode;
          });
          // this.beneficiaryList = data.data;
          // this.filteredBeneficiaryList = data.data;
          const benlist = this.loadDataToBenList(data.data);
          this.beneficiaryList = benlist;
          this.filteredBeneficiaryList = benlist;
          this.filterTerm = null;
          this.pageChanged({
            page: this.activePage,
            itemsPerPage: this.rowsPerPage
          });
        } else this.confirmationService.alert(data.errorMessage, "error");
      },
      err => {
        this.confirmationService.alert(err, "error");
      }
    );
  }

  loadDataToBenList(data) {
    data.forEach(element => {
      element.genderName = element.genderName || "Not Available";
      element.age = element.age || "Not Available";
      element.statusMessage = element.statusMessage || "Not Available";
      element.VisitCategory = element.VisitCategory || "Not Available";
      element.benVisitNo = element.benVisitNo || "Not Available";
      element.districtName = element.districtName || "Not Available";
      element.villageName = element.villageName || "Not Available";
      element.arrival = false;
      element.preferredPhoneNum = element.preferredPhoneNum || "Not Available";
      element.visitDate = moment(element.visitDate).format("DD-MM-YYYY HH:mm A") || "Not Available";
      element.benVisitDate = moment(element.benVisitDate).format('DD-MM-YYYY HH:mm A ') || 'Not Available';
    });
    return data;
  }

  filterBeneficiaryList(searchTerm: string) {
    if (!searchTerm) this.filteredBeneficiaryList = this.beneficiaryList;
    else {
      this.filteredBeneficiaryList = [];
      this.beneficiaryList.forEach(item => {
        console.log("item", JSON.stringify(item, null, 4));
        for (let key in item) {
          if (
            key == "beneficiaryID" ||
            key == "benName" ||
            key == "genderName" ||
            key == "age" ||
            key == "statusMessage" ||
            key == "VisitCategory" ||
            key == "benVisitNo" ||
            key == "districtName" ||
            key == "preferredPhoneNum" ||
            key == "villageName" ||
            key == "beneficiaryRegID" ||
            key ||
            "visitDate"
          ) {
            let value: string = "" + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredBeneficiaryList.push(item);
              break;
            }
          }
        }
      });
    }
    this.activePage = 1;
    this.pageChanged({
      page: 1,
      itemsPerPage: this.rowsPerPage
    });
  }

  patientImageView(benregID: any) {
    this.beneficiaryDetailsService
      .getBeneficiaryImage(benregID)
      .subscribe(data => {
        if (data && data.benImage) this.cameraService.viewImage(data.benImage);
        else this.confirmationService.alert(this.currentLanguageSet.alerts.info.imageNotFound);
      });
  }

  loadDoctorExaminationPage(beneficiary: any) {
    console.log('beneficiary', JSON.stringify(beneficiary, null, 4));

    localStorage.setItem("visitCode", beneficiary.visitCode);
      if (beneficiary.statusCode == 1) {
        this.routeToWorkArea(beneficiary);
      } else if (beneficiary.statusCode == 2) {
        this.confirmationService.alert(beneficiary.statusMessage)
      } else if (beneficiary.statusCode == 3) {
        this.routeToWorkArea(beneficiary);
      } else if (beneficiary.statusCode == 9 || beneficiary.statusCode == 10) {
        this.viewAndPrintCaseSheet(beneficiary)
      }
  }

  viewAndPrintCaseSheet(beneficiary) {
    this.confirmationService.confirm("info", this.currentLanguageSet.alerts.info.consulation).subscribe(res => {
      if (res) {
        this.routeToCaseSheet(beneficiary)
      }
    });
  }

  routeToCaseSheet(beneficiary) {
    localStorage.setItem("caseSheetBenFlowID", beneficiary.benFlowID);
    localStorage.setItem("caseSheetVisitCategory", beneficiary.VisitCategory);
    localStorage.setItem("caseSheetBeneficiaryRegID", beneficiary.beneficiaryRegID);
    localStorage.setItem("caseSheetVisitID", beneficiary.benVisitID);
     this.router.navigate(["/common/print/"+'MMU'+'/'+ 'current']);
  }

  routeToWorkArea(beneficiary) {
    this.confirmationService.confirm(`info`, this.currentLanguageSet.alerts.info.confirmtoProceedFurther).subscribe(result => {
      if (result) {
        this.updateWorkArea(beneficiary)
      }
    });
  }
  updateWorkArea(beneficiary) {
    const dataSeted = this.setDataForWorkArea(beneficiary);
    if (dataSeted) {
      this.router.navigate(["/common/attendant/doctor/patient/", beneficiary.beneficiaryRegID]);
    }
  }

  setDataForWorkArea(beneficiary) {
    localStorage.setItem("beneficiaryGender", beneficiary.genderName);
    localStorage.setItem("benFlowID", beneficiary.benFlowID);
    localStorage.setItem("visitCategory", beneficiary.VisitCategory);
    localStorage.setItem("beneficiaryRegID", beneficiary.beneficiaryRegID);
    localStorage.setItem("visitID", beneficiary.benVisitID);
    localStorage.setItem("beneficiaryID", beneficiary.beneficiaryID);
    localStorage.setItem("doctorFlag", beneficiary.doctorFlag);
    localStorage.setItem("nurseFlag", beneficiary.nurseFlag);
    localStorage.setItem("pharmacist_flag", beneficiary.pharmacist_flag);

    return true;
  }

  checkDoctorStatusAtTcCancelled(beneficiary) {
    if (beneficiary.doctorFlag == 2 || beneficiary.nurseFlag == 2) {
      this.confirmationService.alert(beneficiary.statusMessage);
    } else if (beneficiary.doctorFlag == 1) {
      this.routeToWorkArea(beneficiary);
    } else if (beneficiary.doctorFlag == 3) {
      this.routeToWorkArea(beneficiary);
    } else if (beneficiary.doctorFlag == 9) {
      this.viewAndPrintCaseSheet(beneficiary);
    }
  }


  getVisitStatus(beneficiaryVisitDetials) {
    const status = {
      statusCode: 0,
      statusMessage: ""
    };
      if (beneficiaryVisitDetials.doctorFlag == 2 || beneficiaryVisitDetials.nurseFlag == 2) {
        status.statusCode = 2;
        status.statusMessage = this.currentLanguageSet.alerts.info.pending;
      } else if (beneficiaryVisitDetials.doctorFlag == 1) {
        status.statusCode = 1;
        status.statusMessage = this.currentLanguageSet.alerts.info.pendingConsult;
      } else if (beneficiaryVisitDetials.doctorFlag == 3) {
        status.statusCode = 3;
        status.statusMessage = this.currentLanguageSet.alerts.info.labtestDone;
      } else if (beneficiaryVisitDetials.specialist_flag == 100) {
        status.statusCode = 10;
        status.statusMessage = this.currentLanguageSet.common.tmReferred;
      }
      else if (beneficiaryVisitDetials.doctorFlag == 9) {
        status.statusCode = 9;
        status.statusMessage = "Consultation Done";
      }
    return status;
  }

  //BU40088124 12/10/2021 Integrating Multilingual Functionality --Start--
  ngDoCheck(){
    this.fetchLanguageResponse();
    if(this.currentLanguageSet !== undefined && this.currentLanguageSet !== null && this.beneficiaryMetaData !== undefined && 
      this.beneficiaryMetaData !== null) {
        this.beneficiaryMetaData.map(item => {
          let temp = this.getVisitStatus(item);
          item.statusMessage = temp.statusMessage;
          item.statusCode = temp.statusCode;
        });
    }
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.httpServiceService);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject; 
  }
  //--End--
}

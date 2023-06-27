import { Component, DoCheck, OnInit } from '@angular/core';
import { ConfirmationService } from 'app/app-modules/core/services/confirmation.service';
import { NurseService } from '../../shared/services';
import * as moment from "moment";
import { Router } from '@angular/router';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-nurse-reffered-worklist',
  templateUrl: './nurse-reffered-worklist.component.html',
  styleUrls: ['./nurse-reffered-worklist.component.css']
})
export class NurseRefferedWorklistComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  currentPage: number;

  constructor(private router: Router,private nurseService: NurseService,
    private confirmationService: ConfirmationService,
    private httpServices: HttpServiceService) { }

  ngOnInit() {
    this.assignSelectedLanguage();
    localStorage.setItem("currentRole", "Doctor");
    sessionStorage.removeItem("tmCaseSheet");
    this.removeBeneficiaryDataForNurseVisit();
    this.loadWorklist();
    // this.beneficiaryDetailsService.reset();
    // this.masterdataService.reset();
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
  beneficiaryList: any;
  filteredBeneficiaryList = [];
  activePage = 1;
  pagedList = [];
  rowsPerPage = 5;
  filterTerm;
  blankTable = [1, 2, 3, 4, 5];

  filterBeneficiaryList(searchTerm: string) {
    if (!searchTerm)
      this.filteredBeneficiaryList = this.beneficiaryList;
    else {
      this.filteredBeneficiaryList = [];
      this.beneficiaryList.forEach((item) => {
        console.log('item', JSON.stringify(item, null, 4))
        for (let key in item) {
          if (key == 'beneficiaryID' || key == 'benName' || key == 'genderName' || key == 'fatherName' || key == 'districtName' || key == 'preferredPhoneNum' || key == 'villageName') {
            let value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredBeneficiaryList.push(item); break;
            }
          } else {
            if (key == 'benVisitNo') {
              let value: string = '' + item[key];
              if (value == '1') {
                let val = 'First visit'
                if (val.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
                  this.filteredBeneficiaryList.push(item); break;
                }
              } else {
                let val = 'Revist'
                if (val.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
                  this.filteredBeneficiaryList.push(item); break;
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
      itemsPerPage: this.rowsPerPage
    });
    this.currentPage=1;
  }
  pageChanged(event): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.pagedList = this.filteredBeneficiaryList.slice(startItem, endItem);
  }
  loadWorklist() {
    localStorage.removeItem('disableNoOnSuccessOfYes');
    this.filterTerm = null;
    this.nurseService.getNurseWorklistTMreferred()
      .subscribe((res) => {
        if (res.statusCode == 200 && res.data != null) {
          const benlist = this.loadDataToBenList(res.data);
          this.beneficiaryList = benlist;
          this.filteredBeneficiaryList = benlist;
          this.filteredBeneficiaryList = this.filteredBeneficiaryList.filter(visitCategory => visitCategory.VisitCategory === "NCD screening");         
          this.pageChanged({
            page: this.activePage,
            itemsPerPage: this.rowsPerPage
          });
          this.filterTerm = null;
          this.currentPage=1;
        } else {
          this.confirmationService.alert(res.errorMessage, 'error');
        }
      }, err => {
        this.confirmationService.alert(err, 'error');
      });
      console.log('filtered Beneficiary List', JSON.stringify(this.filteredBeneficiaryList));
  }

  loadDataToBenList(data) {
    data.forEach(element => {
      element.benFlowID= element.benFlowID || "Not Available";
      element.beneficiaryRegID= element.beneficiaryRegID || "Not Available";
      element.benVisitID= element.benVisitID || "Not Available";
      element.visitCode= element.visitCode || "Not Available";
      element.VisitReason= element.VisitReason || "Not Available";
      element.VisitCategory= element.VisitCategory || "Not Available";
      element.benVisitNo= element.benVisitNo || "Not Available";
      element.nurseFlag= element.nurseFlag || "Not Available";
      element.doctorFlag= element.doctorFlag || "Not Available";
      element.pharmacist_flag= element.pharmacist_flag || "Not Available";
      element.lab_technician_flag= element.lab_technician_flag || "Not Available";
      element.radiologist_flag= element.radiologist_flag || "Not Available";
      element.oncologist_flag= element.oncologist_flag || "Not Available";
      element.specialist_flag= element.specialist_flag || "Not Available"; 
      element.agentId=element.agentId || "Not Available";
      element.visitDate= moment(element.visitDate).format("DD-MM-YYYY HH:mm A") || "Not Available";
      element.modified_date= moment(element.modified_date).format("DD-MM-YYYY HH:mm A") || "Not Available";
      element.benName= element.benName || "Not Available";
      element.deleted= element.deleted || "Not Available";
      element.age=element.age || "Not Available";
      element.ben_age_val= element.ben_age_val || "Not Available";
      element.dOB= moment(element.dOB).format("DD-MM-YYYY HH:mm A") || "Not Available";
      element.genderID= element.genderID || "Not Available";
      element.genderName= element.genderName || "Not Available";
      element.preferredPhoneNum= element.preferredPhoneNum || "Not Available";
      element.fatherName= element.fatherName || "Not Available";
      element.districtName= element.districtName || "Not Available";
      element.servicePointName= element.servicePointName || "Not Available";
      element.registrationDate= moment(element.registrationDate).format("DD-MM-YYYY HH:mm A") || "Not Available";
      element.benVisitDate= moment(element.benVisitDate).format("DD-MM-YYYY HH:mm A") || "Not Available";
      element.consultationDate= moment(element.consultationDate).format("DD-MM-YYYY HH:mm A") || "Not Available";
      element.servicePointID= element.servicePointID || "Not Available";
      element.districtID= element.districtID || "Not Available";
      element.villageID= element.villageID || "Not Available";
      element.vanID= element.vanID || "Not Available";
      element.providerServiceMapId= element.providerServiceMapId || "Not Available";
      element.villageName= element.villageName || "Not Available";
      element.beneficiaryID= element.beneficiaryID || "Not Available";
      element.labIteration= element.labIteration || "Not Available";
      element.processed= element.processed || "Not Available";
      element.benArrivedFlag= element.benArrivedFlag || "Not Available";
      element.tCSpecialistUserID= element.tCSpecialistUserID || "Not Available";
      element.isTMVisitDone= element.isTMVisitDone || "Not Available";
    });
    return data;
  }


  loadNursePatientDetails(beneficiary: any) {
    console.log('beneficiary', JSON.stringify(beneficiary, null, 4));
    localStorage.setItem("visitCode", beneficiary.visitCode);
    localStorage.setItem('visitID', beneficiary.benVisitID);
    if(beneficiary.specialist_flag==100){
      this.confirmationService.confirm(`info`, this.currentLanguageSet.alerts.info.confirmtoProceedFurther)
        .subscribe(result => {
          if (result) {
            localStorage.setItem('beneficiaryGender', beneficiary.genderName);
            localStorage.setItem('beneficiaryRegID', beneficiary.beneficiaryRegID);
            localStorage.setItem('benFlowID', beneficiary.benFlowID);
            localStorage.setItem('beneficiaryID', beneficiary.beneficiaryID);
            localStorage.setItem('specialist_flag', beneficiary.specialist_flag);
            localStorage.setItem('beneficiaryData', JSON.stringify(beneficiary));
            this.router.navigate(['/common/attendant/nurse/patient/', beneficiary.beneficiaryRegID]);
          }
        });
      }
      else if (beneficiary.specialist_flag==200) {
        sessionStorage.setItem("tmCaseSheet","true");
        this.viewAndPrintCaseSheet(beneficiary)
      }
  }

  removeBeneficiaryDataForNurseVisit() {
    localStorage.removeItem('visitCode');
    localStorage.removeItem('beneficiaryGender');
    localStorage.removeItem('benFlowID');
    localStorage.removeItem('visitCategory');
    localStorage.removeItem('beneficiaryRegID');
    localStorage.removeItem('visitID');
    localStorage.removeItem('beneficiaryID');
    localStorage.removeItem('doctorFlag');
    localStorage.removeItem('nurseFlag');
    localStorage.removeItem('pharmacist_flag');
    localStorage.removeItem('specialistFlag');
    localStorage.removeItem('visitCat');   
    localStorage.removeItem('caseSheetTMFlag'); 
  }
  
  visitCategory: any;
  viewAndPrintCaseSheet(beneficiaryData) {
  this.setCasesheetData(beneficiaryData);
  let caseSheetRequest;
  if (localStorage.getItem('caseSheetTMFlag') == "true" || parseInt(localStorage.getItem('specialistFlag')) == 200) {
    this.visitCategory = localStorage.getItem('caseSheetVisitCategory');
    caseSheetRequest = {
      "VisitCategory": localStorage.getItem('caseSheetVisitCategory'),
      "benFlowID": localStorage.getItem('caseSheetBenFlowID'),
      "benVisitID": localStorage.getItem('caseSheetVisitID'),
      "beneficiaryRegID": localStorage.getItem('caseSheetBeneficiaryRegID'),
      "visitCode": localStorage.getItem('caseSheetVisitCode')
      // "isCaseSheetdownloaded": localStorage.getItem('isCaseSheetdownloaded') == "true" ? true : false
    }
    this.getTMReferredCasesheetData(caseSheetRequest);
  } 
}
casesheetSubs: any;
caseSheetData: any;
getTMReferredCasesheetData(caseSheetRequest) {
 
  this.casesheetSubs = this.nurseService.getTMReferredCasesheetData(caseSheetRequest)
    .subscribe(res => {
      if (res && res.statusCode == 200 && res.data) {
        this.confirmationService.confirm("info", this.currentLanguageSet.alerts.info.consulation).subscribe(res => {
          if (res) {     
    
            this.routeToCaseSheet();
          }
        });
        this.caseSheetData = res.data;

      }
      else {
        this.confirmationService.alert(res.errorMessage, 'error');        
      }
    }, (err) => { 
      console.log(err, 'error');     
      this.confirmationService.alert('Error in fetching TM Casesheet', 'error');
    })
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
   this.router.navigate(["/common/print/"+'MMU'+'/'+ 'current']);
}
}

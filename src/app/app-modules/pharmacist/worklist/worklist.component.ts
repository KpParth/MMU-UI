import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { BeneficiaryDetailsService } from '../../core/services/beneficiary-details.service';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { PharmacistService } from '../shared/services/pharmacist.service';
import { CameraService } from '../../core/services/camera.service';
import { InventoryService } from '../../core/services/inventory.service';

import * as moment from 'moment';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
  styleUrls: ['./worklist.component.css']
})
export class WorklistComponent implements OnInit, OnDestroy {
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
  
  constructor(
    private router: Router,
    private httpServiceService: HttpServiceService,
    private confirmationService: ConfirmationService,
    private beneficiaryDetailsService: BeneficiaryDetailsService,
    private pharmacistService: PharmacistService,
    private cameraService: CameraService,
    private inventoryService: InventoryService
  ) { }

  ngOnInit() {
    this.fetchLanguageResponse();
    localStorage.setItem('currentRole', 'Pharmacist');
    this.removeBeneficiaryDataForVisit();
    this.loadPharmaWorklist();
    this.beneficiaryDetailsService.reset();
  }

  removeBeneficiaryDataForVisit() {
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
    localStorage.removeItem('caseSheetTMFlag');
  }

  ngOnDestroy() {
    localStorage.removeItem('currentRole');
  }

  loadPharmaWorklist() {
    this.pharmacistService.getPharmacistWorklist()
      .subscribe(data => {
        if (data && data.statusCode == 200 && data.data) {
          console.log("pharmacist worklist", data.data);

          const benlist = this.loadDataToBenList(data.data);
          this.beneficiaryList = benlist;
          this.filteredBeneficiaryList = benlist;
          this.pageChanged({
            page: this.activePage,
            itemsPerPage: this.rowsPerPage
          });
          this.filterTerm = null;
          console.log('this.filteredBeneficiaryList', this.filteredBeneficiaryList)
        } else {
          this.confirmationService.alert(data.errorMessage, 'error');
        }
      }, err => {
        this.confirmationService.alert(err, 'error');
      });
  }
  pageChanged(event): void {
    console.log('called', event)
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.pagedList = this.filteredBeneficiaryList.slice(startItem, endItem);
    console.log('list', this.pagedList)

  }
  loadDataToBenList(data) {
    data.forEach(element => {
      element.genderName = element.genderName || 'Not Available'
      element.age = element.age || 'Not Available'
      element.statusMessage = element.statusMessage || 'Not Available'
      element.VisitCategory = element.VisitCategory || 'Not Available'
      element.benVisitNo = element.benVisitNo || 'Not Available'
      element.districtName = element.districtName || 'Not Available'
      element.villageName = element.villageName || 'Not Available'
      element.preferredPhoneNum = element.preferredPhoneNum || 'Not Available'
      element.visitDate = moment(element.visitDate).format('DD-MM-YYYY HH:mm A ') || 'Not Available'
      element.benVisitDate = moment(element.benVisitDate).format('DD-MM-YYYY HH:mm A ') || 'Not Available';
    })
    return data;
  }


  filterBeneficiaryList(searchTerm: string) {
    if (!searchTerm)
      this.filteredBeneficiaryList = this.beneficiaryList;
    else {
      this.filteredBeneficiaryList = [];
      this.beneficiaryList.forEach((item) => {
        for (let key in item) {
          if (key == 'beneficiaryID' || key == 'benName' || key == 'genderName' || key == 'age' || key == 'VisitCategory' || key == 'benVisitNo' || key == 'districtName' || key == 'preferredPhoneNum' || key == 'villageName' || key == 'beneficiaryRegID' || key || 'visitDate') {

            let value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredBeneficiaryList.push(item); break;
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
    if (benregID && benregID != null && benregID != '' && benregID != undefined) {
      this.beneficiaryDetailsService.getBeneficiaryImage(benregID)
        .subscribe(data => {
          if (data && data.benImage) {
            this.cameraService.viewImage(data.benImage);
          } else {
            this.confirmationService.alert(this.currentLanguageSet.alerts.info.imageNotFound);
          }
        });
    }
  }

  loadPharmaPage(beneficiary: any) {
    console.log(beneficiary)
    this.confirmationService.confirm(`info`, this.currentLanguageSet.alerts.info.confirmtoProceedFurther).subscribe(result => {
    if (result) {
    this.inventoryService.moveToInventory(
      beneficiary.beneficiaryID,
      beneficiary.visitCode,
      beneficiary.benFlowID,
      sessionStorage.getItem('setLanguage') !== undefined ? sessionStorage.getItem('setLanguage') : 'English',
      beneficiary.beneficiaryRegID);
    }
    });
    // this.confirmationService.confirm(`info`, `Currently pharma not available`).subscribe(result => {
    //   if (result) {
    //     localStorage.setItem('visitID', beneficiary.benVisitID);
    //     localStorage.setItem('beneficiaryRegID', beneficiary.beneficiaryRegID);
    //     localStorage.setItem('beneficiaryID', beneficiary.beneficiaryID);
    //     localStorage.setItem('visitCategory', beneficiary.VisitCategory);
    //     // this.router.navigate(['/pharmacist/patient/', beneficiary.beneficiaryRegID]);
    //   }
    // });
  }

  //AN40085822 13/10/2021 Integrating Multilingual Functionality --Start--
  ngDoCheck(){
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.httpServiceService);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject; 
  }
  //--End--
}


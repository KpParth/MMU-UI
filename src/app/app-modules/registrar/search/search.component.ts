import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Params, RouterModule, Routes, Router, ActivatedRoute } from '@angular/router'

import { SearchDialogComponent } from '../search-dialog/search-dialog.component';

import { ConfirmationService } from '../../core/services/confirmation.service';
import { CameraService } from '../../core/services/camera.service';
import { BeneficiaryDetailsService } from '../../core/services/beneficiary-details.service';
import { RegistrarService } from '../shared/services/registrar.service';
import * as moment from 'moment';
import { log } from 'util';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  rowsPerPage = 5;
  activePage = 1;
  pagedList = [];
  rotate = true;
  beneficiaryList: any;
  filteredBeneficiaryList = [];
  quicksearchTerm: string;
  advanceSearchTerm: any;
  blankTable = [1, 2, 3, 4, 5];
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  searchPattern: string;
  
  // searchType: string;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dialog: MdDialog,
    private httpServiceService: HttpServiceService,
    private confirmationService: ConfirmationService,
    private registrarService: RegistrarService,
    private cameraService: CameraService,
    private router: Router,
    private route: ActivatedRoute,
    private beneficiaryDetailsService: BeneficiaryDetailsService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
    this.searchPattern="/^[a-zA-Z0-9](.|@|-)*$/;"
    // this.searchType = 'ID';
  }
  AfterViewChecked() {
    this.changeDetectorRef.detectChanges();

  }


  // quickSearch(searchTerm?: string) {
  //   //this.quicksearchTerm = '';

  //   if (searchTerm == undefined || searchTerm.trim() == '' || searchTerm.trim().length <= 0) {
  //     this.confirmationService.alert("Please enter beneficiary ID, name or phone number first", 'warn');
  //   } else {
  //     if (searchTerm.trim().length < 2) {
  //       this.confirmationService.alert("Minimum 2 character is required to search beneficiary", 'warn');
  //     }
  //     else {
  //       this.registrarService.quickSearch(Object.assign({}, { 'benID': searchTerm.trim() }))
  //         .subscribe(beneficiaryList => {
  //           if (!beneficiaryList || beneficiaryList.length <= 0) {
  //             this.beneficiaryList = [];
  //             this.filteredBeneficiaryList = [];
  //             this.confirmationService.alert("Beneficiary not found", 'error');
  //           } else {
  //             this.beneficiaryList = beneficiaryList;
  //             this.filteredBeneficiaryList = this.beneficiaryList;

  //           }
  //           console.log(JSON.stringify(beneficiaryList, null, 4));
  //         }, error => {
  //           this.confirmationService.alert(error);
  //         });
  //     }
  //   }
  // }

  identityQuickSearch(searchTerm?: string) {
    const searchObject = {
      "beneficiaryRegID": null,
      "beneficiaryID": null,
      "phoneNo": null
    }

    //this.quicksearchTerm = '';

    if (searchTerm == undefined || searchTerm.trim() == '' || searchTerm.trim().length <= 0) {
      this.confirmationService.alert(this.currentLanguageSet.alerts.info.pleaseenterBeneficiaryID, 'info');
    } else {
      if (searchTerm.trim().length === 10 || searchTerm.trim().length === 12) {
        if (searchTerm.trim().length === 10) {
          searchObject["phoneNo"] = searchTerm;
        } else if (searchTerm.trim().length === 12) {
          searchObject["beneficiaryID"] = searchTerm;
        }
        this.registrarService.identityQuickSearch(searchObject)
          .subscribe(beneficiaryList => {
            if (!beneficiaryList || beneficiaryList.length <= 0) {
              this.beneficiaryList = [];
              this.filteredBeneficiaryList = [];
              this.pagedList = [];
              this.confirmationService.alert(this.currentLanguageSet.alerts.info.beneficiarynotfound, 'info');
            } else {
              this.beneficiaryList = this.searchRestruct(beneficiaryList, searchObject);
              this.filteredBeneficiaryList = this.beneficiaryList;
              this.pageChanged({
                page: this.activePage,
                itemsPerPage: this.rowsPerPage
              });
            }
            console.log('hi', JSON.stringify(beneficiaryList, null, 4));
          }, error => {
            this.confirmationService.alert(error, 'error');
          });
      } else {
        this.confirmationService.alert(this.currentLanguageSet.alerts.info.phoneDetails, 'info');
      }
    }
  }


  /**
   * ReStruct the response object of Identity Search to be as per search table requirements
   */
  searchRestruct(benList, benObject) {
    const requiredBenData = [];
    benList.forEach((element, i) => {
      requiredBenData.push({
        beneficiaryID: element.beneficiaryID,
        beneficiaryRegID: element.beneficiaryRegID,
        benName: `${element.firstName} ${element.lastName || ''}`,
        genderName: `${element.m_gender.genderName || 'Not Available'}`,
        fatherName: `${element.fatherName || 'Not Available'}`,
        districtName: `${element.i_bendemographics.districtName || 'Not Available'}`,
        villageName: `${element.i_bendemographics.districtBranchName || 'Not Available'}`,
        phoneNo: this.getCorrectPhoneNo(element.benPhoneMaps, benObject),
        age: (moment(element.dOB).fromNow(true) == 'a few seconds') ? 'Not Available' : moment(element.dOB).fromNow(true),
        registeredOn: moment(element.createdDate).format('DD-MM-YYYY'),
        benObject: element
      })

    })
    console.log(JSON.stringify(requiredBenData, null, 4), 'yoooo!')

    return requiredBenData;

  }

  pageChanged(event): void {
    console.log('called', event)
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.pagedList = this.filteredBeneficiaryList.slice(startItem, endItem);
    console.log('list', this.pagedList)

  }

  getCorrectPhoneNo(phoneMaps, benObject) {
    let phone;
    if (benObject && !benObject && !benObject.phoneNo) {
      return phoneMaps[0].phoneNo;
    } else if (benObject && !benObject && !benObject.phoneNo && !phoneMaps.length) {
      return phoneMaps[0].phoneNo || 'Not Available';
    } else if (benObject && benObject.phoneNo && phoneMaps.length > 0) {
      phoneMaps.forEach(elem => {
        if (elem.phoneNo == benObject.phoneNo) {
          phone = elem.phoneNo;
        }
      })
      if (phone) {
        return phone;

      } else if (phoneMaps.length > 0) {
        return phoneMaps[0].phoneNo;
      } else {
        return 'Not Available'
      }

    } else if (phoneMaps.length > 0) {
      return phoneMaps[0].phoneNo;
    } else {
      return 'Not Available';
    }
    //     `${element.benPhoneMaps.length > 0 && element.benPhoneMaps[0].phoneNo || 'Not Available'}` ,
    // return 1
  }

  filterBeneficiaryList(searchTerm?: string) {
    if (!searchTerm)
      this.filteredBeneficiaryList = this.beneficiaryList;
    else {
      this.filteredBeneficiaryList = [];
      this.beneficiaryList.forEach((item) => {
        for (let key in item) {
          if (key != 'benObject') {
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

  patientRevisited(benObject: any) {

    if (benObject && benObject.m_gender && benObject.m_gender.genderName && benObject.dOB) {
      let action = false;
      console.log(JSON.stringify(benObject, null, 4), 'benObject');
       let vanID = JSON.parse(localStorage.getItem('serviceLineDetails')).vanID;
      benObject['providerServiceMapId'] = localStorage.getItem('providerServiceID');
      benObject['vanID'] = vanID;

      this.confirmationService.confirm(`info`, this.currentLanguageSet.alerts.info.confirmSubmitBeneficiary)
        .subscribe(result => {
          if (result) this.sendToNurseWindow(result, benObject);
        });
    } else if (!benObject.m_gender.genderName && !benObject.dOB) {
      this.confirmationService.alert(this.currentLanguageSet.alerts.info.genderAndAgeDetails, 'info');
    } else if (!benObject.m_gender.genderName) {
      this.confirmationService.alert(this.currentLanguageSet.alerts.info.noGenderDetails, 'info');
    } else if (!benObject.dOB) {
      this.confirmationService.alert(this.currentLanguageSet.alerts.info.noAgeDetailsAvail, 'info');
    }
  }

  editPatientInfo(beneficiary: any) {
    this.confirmationService.confirm(`info`, this.currentLanguageSet.alerts.info.editDetails)
      .subscribe(result => {
        if (result) {
          this.registrarService.saveBeneficiaryEditDataASobservable(beneficiary.benObject);
          this.router.navigate(['/registrar/search/' + beneficiary.beneficiaryID]);
        }
      });
  }

  sendToNurseWindow(userResponse: boolean, benObject: any) {
    if (userResponse) {
      // let regIdObject = { beneficiaryRegID: "" };
      // regIdObject.beneficiaryRegID = benregID;

      this.registrarService.identityPatientRevisit(benObject)
        .subscribe(result => {
          if (result.data)
            this.confirmationService.alert(result.data.response, "success");
          else
            this.confirmationService.alert(result.status, "warn");
        }, error => {
          this.confirmationService.alert(error, 'error');
        });
    }
  }

  patientImageView(benregID: any) {
    if (benregID && benregID != null && benregID != '' && benregID != undefined) {
      this.beneficiaryDetailsService.getBeneficiaryImage(benregID)
        .subscribe(data => {
          if (data && data.benImage)
            this.cameraService.viewImage(data.benImage);
          else
            this.confirmationService.alert(this.currentLanguageSet.alerts.info.imageNotFound);
        });
    }
  }

  openSearchDialog() {
    let mdDialogRef: MdDialogRef<SearchDialogComponent> = this.dialog.open(SearchDialogComponent, {
      width: '60%',
      disableClose: false
    });

    mdDialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('something fishy happening here', result);
        this.advanceSearchTerm = result;
        this.registrarService.advanceSearchIdentity(this.advanceSearchTerm)
          .subscribe(beneficiaryList => {
            if (!beneficiaryList || beneficiaryList.length <= 0) {
              this.beneficiaryList = [];
              this.filteredBeneficiaryList = [];
              this.quicksearchTerm = null;
              this.confirmationService.alert(this.currentLanguageSet.alerts.info.beneficiarynotfound, 'info');
            } else {
              this.beneficiaryList = this.searchRestruct(beneficiaryList, {});
              this.filteredBeneficiaryList = this.beneficiaryList;
              this.activePage = 1;
              this.pageChanged({
                page: this.activePage,
                itemsPerPage: this.rowsPerPage
              });
            }
            console.log(JSON.stringify(beneficiaryList, null, 4));
          }, error => {
            this.confirmationService.alert(error, 'error');
          });
      }
    });
  }
  navigateTORegistrar() {
    let link = '/registrar/registration';
    let currentRoute = this.router.routerState.snapshot.url;
    console.log('currentRoute',currentRoute);
    if(currentRoute != link){
      console.log('log in');
      if(this.beneficiaryList == undefined){
        this.router.navigate([link])
      }else if(this.beneficiaryList != undefined){
        if(this.beneficiaryList.length == 0){
          this.router.navigate([link])
        }else {
          this.confirmationService.confirm(`info`, `Do you really want to navigate? Any searched data would be lost`, 'Yes', 'No').subscribe((result) => {
            if (result) {
              this.router.navigate([link])
            }
          });
        }
      }

    }
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


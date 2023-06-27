import { Component, OnInit, ViewChild, AfterViewChecked, Input, ChangeDetectorRef, OnDestroy, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { DataSyncService } from './../shared/service/data-sync.service'
import { Observable } from 'rxjs/Rx';
import { DataSyncUtils } from '../shared/utility/data-sync-utility';
import { CanComponentDeactivate } from '../../core/services/can-deactivate-guard.service';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-workarea',
  templateUrl: './workarea.component.html',
  styleUrls: ['./workarea.component.css']
})
export class WorkareaComponent implements OnInit, CanComponentDeactivate, DoCheck {

  generateBenIDForm: FormGroup;
  current_language_set: any;

  constructor(
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private dataSyncService: DataSyncService,
    private fb: FormBuilder,
    private httpServiceService: HttpServiceService
  ) { }

  syncTableGroupList = [];
  benID_Count: any;
  
  ngOnInit() {
    this.assignSelectedLanguage();
    if (localStorage.getItem('serverKey') != null || localStorage.getItem('serverKey') != undefined) {
      this.getDataSYNCGroup();
    } else {
      this.router.navigate(['datasync/sync-login'])
    }
    this.generateBenIDForm = new DataSyncUtils(this.fb).createBenIDForm();
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
    localStorage.removeItem('serverKey')
  }

  getDataSYNCGroup() {
    this.dataSyncService.getDataSYNCGroup().subscribe((res) => {
      if (res.statusCode == 200) {
        this.syncTableGroupList = this.createSyncActivity(res.data);
        console.log('syncTableGroupList', this.syncTableGroupList);
      }
    })
  }

  createSyncActivity(data) {
    data.forEach(element => {
      element.syncTableGroupName = element.syncTableGroupName
      element.syncTableGroupID = element.syncTableGroupID
      element.processed = element.processed
      element.benDetailSynced = false
      element.visitSynced = false
    });
    return data;
  }

  checkSelectedGroup(syncTableGroup) {
    console.log(syncTableGroup, 'syncTableGroup');

    if (syncTableGroup.processed == 'N') {
      if (syncTableGroup.syncTableGroupID == 1) {
        this.syncUploadData(syncTableGroup);
      } else if (syncTableGroup.syncTableGroupID == 2) {
        if (syncTableGroup.benDetailSynced == false && syncTableGroup.visitSynced == false) {
          this.confirmationService.alert('SYNC Beneficiary Details first')
        } else {
          this.syncUploadData(syncTableGroup);
        }
      } else {
        if (syncTableGroup.benDetailSynced == false && syncTableGroup.visitSynced == false) {
          this.confirmationService.alert('SYNC Beneficiary Details and Beneficiary Visit first')
        } else if (syncTableGroup.benDetailSynced == true && syncTableGroup.visitSynced == false) {
          this.confirmationService.alert('SYNC Beneficiary Visit first')
        } else {
          this.syncUploadData(syncTableGroup);
        }
      }
    } else {
      this.confirmationService.alert('Data already synced')
    }

  }

  syncUploadData(syncTableGroup) {
    this.confirmationService.confirm('info', 'Confirm to upload data').subscribe((result) => {
      if (result) {
        this.dataSyncService.syncUploadData(syncTableGroup.syncTableGroupID).subscribe((res) => {
          console.log(res);
          if (res.statusCode == 200) {
            const syncTableGroups = this.syncTableGroupList;
            this.syncTableGroupList = [];
            this.syncTableGroupList = this.modifySYNCEDGroup(syncTableGroups, syncTableGroup);
            console.log(this.syncTableGroupList, 'this.syncTableGroupList');
            this.confirmationService.alert(res.data.response, 'success');
          } else {
            this.confirmationService.alert(res.errorMessage, "error")
          }
        }, err => {
          this.confirmationService.alert(err, 'error');
        });
      }
    })
  }

  modifySYNCEDGroup(syncTableGroups, syncTableGroup) {
    console.log('syncTableGroup', syncTableGroup);
    syncTableGroups.forEach(element => {
      element.syncTableGroupName = element.syncTableGroupName
      element.syncTableGroupID = element.syncTableGroupID
      if (element.syncTableGroupID == syncTableGroup.syncTableGroupID) {
        element.processed = 'D'
      }
      if (syncTableGroup.syncTableGroupID == 1) {
        element.benDetailSynced = true
        element.visitSynced = false
      }
      if (syncTableGroup.syncTableGroupID == 2) {
        element.benDetailSynced = true
        element.visitSynced = true
      }
    });
    return syncTableGroups;
  }


  showProgressBar = false;
  progressValue = 0;
  failedMasterList: any;
  intervalref: any;

  syncDownloadData() {
    this.failedMasterList = undefined;
    this.progressValue = 0;
    this.confirmationService.confirm('info', 'Confirm to download data').subscribe((result) => {
      if (result) {
        let vanID = JSON.parse(localStorage.getItem('serviceLineDetails')).vanID;
        let reqObj = {
          "vanID": vanID,
          "providerServiceMapID": localStorage.getItem('dataSyncProviderServiceMapID')
        }
        this.dataSyncService.syncDownloadData(reqObj).subscribe((res) => {
          if (res.statusCode == 200) {
            this.showProgressBar = true;
            this.intervalref = setInterval(() => {
              this.syncDownloadProgressStatus();
            }, 2000);
          } else {
            this.confirmationService.alert(res.errorMessage, 'error')
          }
        });
      }
    });
  }

  syncDownloadProgressStatus() {
    this.dataSyncService.syncDownloadDataProgress()
      .subscribe(res => {
        if (res.statusCode == 200 && res.data) {
          this.progressValue = res.data.percentage;

          if (this.progressValue >= 100) {
            this.failedMasterList = res.data.failedMasters.split("|");
            if (this.failedMasterList !=undefined && this.failedMasterList !=null && 
              this.failedMasterList.length >0 && this.failedMasterList[this.failedMasterList.length - 1].trim() == "")
              this.failedMasterList.pop();
            this.showProgressBar = false;
            clearInterval(this.intervalref);
            this.confirmationService.alert("Master download finished");
          }
        }
      });
  }

  canDeactivate() {
    if (this.showProgressBar) {
      this.confirmationService.alert("Download in progress");
      return false;
    } else {
      return true;
    }
  }
  checkBenIDAvailability() {
    this.dataSyncService.checkBenIDAvailability().subscribe((benIDResponse) => {
      if (benIDResponse) {
        this.benID_Count = benIDResponse.data.response;
      } else {
        this.confirmationService.alert("No benID available. Generate benIDs");
      }
    })
  }
  get benIDsRange() {
    return this.generateBenIDForm.controls['benID_Range'].value
  }
  generateBenID(benID) {
    let vanID = JSON.parse(localStorage.getItem('serviceLineDetails')).vanID;
    if (this.benID_Count > 5000) {
      this.confirmationService.alert("Couldn't able to generate benIDs, count should be less than 5000");
    } else {
      let reqObj = {
        "vanID": vanID,
        "benIDRequired": parseInt(benID)
       }
      this.dataSyncService.generateBenIDs(reqObj).subscribe((res) => {
        if (res) {
          this.checkBenIDAvailability();
          this.generateBenIDForm.controls['benID_Range'].reset();
        }
      })
    }
  }
  inventoryFailedMasterList: any;
  inventorySyncDataDownload() {
    this.inventoryFailedMasterList = undefined;
    this.progressValue = 0;
    this.confirmationService.confirm('info', 'Confirm to download data').subscribe((result) => {
      if (result) {
        let vanID = { 
           vanID: JSON.parse(localStorage.getItem('serviceLineDetails')).vanID 
        }
        this.dataSyncService.inventorySyncDownloadData(vanID).subscribe((res) => {
          if (res.statusCode == 200) {
           console.log('Downloaded response');
          } else {
            this.confirmationService.alert(res.errorMessage, 'error')
          }
        });
      }
    });
  }
}


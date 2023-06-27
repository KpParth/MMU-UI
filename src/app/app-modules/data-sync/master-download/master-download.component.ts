import { Component, OnInit, ChangeDetectorRef, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { DataSyncService } from './../shared/service/data-sync.service'
import { Observable } from 'rxjs/Rx';

import { MdDialog, MdDialogRef, MD_DIALOG_DATA, MdDialogConfig } from '@angular/material';


@Component({
  selector: 'app-master-download',
  templateUrl: './master-download.component.html',
  styleUrls: ['./master-download.component.css']
})
export class MasterDownloadComponent implements OnInit {

  constructor(
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    public dialogRef: MdDialogRef<MasterDownloadComponent>,
    private confirmationService: ConfirmationService,
    private dataSyncService: DataSyncService
  ) { }

  ngOnInit() {
    this.getVanDetails();
  }

  showProgressBar = false;
  progressValue = 0;
  failedMasterList: any;
  intervalref: any;
  vanID: any;
  vehicalNo: any;

  showVanDetails: boolean;

  getVanDetails() {
    this.dataSyncService.getVanDetailsForMasterDownload()
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data) {
          if (res.data.vanID && res.data.vehicalNo) {
            this.showVanDetails = true;
          } else {
            this.showVanDetails = false;
          }
          this.vanID = res.data.vanID;
          this.vehicalNo = res.data.vehicalNo;
        } else {
          this.showVanDetails = false;
        }
      }, error => {
        this.showVanDetails = false;
      });
  }

  syncDownloadData() {
    this.failedMasterList = undefined;
    this.progressValue = 0;
    this.confirmationService.confirm('info', 'Confirm to download data').subscribe((result) => {
      if (result) {
        let reqObj = {
          "vanID": this.vanID,
          "providerServiceMapID": localStorage.getItem('dataSyncProviderServiceMapID')
        }
        this.dataSyncService.syncDownloadData(reqObj).subscribe((res) => {
          if (res && res.statusCode == 200) {
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
        } else {
          this.showProgressBar = false;
          clearInterval(this.intervalref);
          this.confirmationService.alert(res.errorMessage, 'error');
        }
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

}

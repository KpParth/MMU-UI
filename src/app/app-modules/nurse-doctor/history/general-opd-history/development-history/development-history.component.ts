import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { MasterdataService, NurseService, DoctorService } from '../../../shared/services';
import { PreviousDetailsComponent } from '../../../../core/components/previous-details/previous-details.component';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'general-development-history',
  templateUrl: './development-history.component.html',
  styleUrls: ['./development-history.component.css']
})
export class DevelopmentHistoryComponent implements OnInit {

  @Input('developmentHistory')
  developmentHistoryForm: FormGroup;

  @Input('visitCategory')
  visitType: any;

  @Input('mode')
  mode: string;

  masterData: any;
  currentLanguageSet: any;

  constructor(
    private fb: FormBuilder,
    private masterdataService: MasterdataService,
    private nurseService: NurseService,
    private doctorService: DoctorService,
    private dialog: MdDialog,
    private confirmationService: ConfirmationService,
    public httpServiceService: HttpServiceService) { }

  ngOnInit() {
    this.assignSelectedLanguage();
    this.getMasterData();
  }

  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.currentLanguageSet = getLanguageJson.currentLanguageObject;
    }

  ngOnDestroy() {
    if (this.nurseMasterDataSubscription)
      this.nurseMasterDataSubscription.unsubscribe();

    if (this.generalHistorySubscription)
      this.generalHistorySubscription.unsubscribe();
  }

  nurseMasterDataSubscription: any;
  getMasterData() {
    this.nurseMasterDataSubscription = this.masterdataService.nurseMasterData$.subscribe(masterData => {
      if (masterData) {
        this.masterData = masterData;
        console.log('this.masterData ', this.masterData);
        if (this.mode == 'view') {
          let visitID = localStorage.getItem('visitID');
          let benRegID = localStorage.getItem('beneficiaryRegID')
          this.getGeneralHistory(benRegID, visitID);
        }
      }
    })
  }

  developmentHistoryData: any;
  generalHistorySubscription: any;
  getGeneralHistory(benRegID, visitID) {
    this.generalHistorySubscription = this.doctorService.getGeneralHistoryDetails(benRegID, visitID).subscribe(history => {
      if (history != null && history.statusCode == 200 && history.data != null && history.data.DevelopmentHistory) {
        this.developmentHistoryData = history.data.DevelopmentHistory;
        console.log('history.data DEVELOPMWENTAL', this.developmentHistoryData);
        this.developmentHistoryForm.patchValue(this.developmentHistoryData);
      }
    })
  }

  getPreviousDevelopmentalHistory() {
    let benRegID = localStorage.getItem('beneficiaryRegID');
    console.log('here checkig', this.visitType);

    this.nurseService.getPreviousDevelopmentalHistory(benRegID, this.visitType)
      .subscribe(data => {
        if (data != null && data.data != null) {
          if (data.data.data.length > 0) {
            this.viewPreviousData(data.data);
          } else {
            this.confirmationService.alert(this.currentLanguageSet.historyData.ancHistory.previousHistoryDetails.pastHistoryalert);
          }
        } else {
          this.confirmationService.alert(this.currentLanguageSet.alerts.info.errorFetchingHistory, 'error');
        }
      }, err => {
        this.confirmationService.alert(this.currentLanguageSet.alerts.info.errorFetchingHistory, 'error');
      })
  }

  viewPreviousData(data) {
    this.dialog.open(PreviousDetailsComponent, {
      data: { 'dataList': data, title:  this.currentLanguageSet.historyData.Perinatalhistorydetails.developmentalhistorydetails }
    });
  }


}

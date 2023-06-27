import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { MasterdataService, NurseService, DoctorService } from '../../../shared/services';
import { PreviousDetailsComponent } from '../../../../core/components/previous-details/previous-details.component';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';

@Component({
  selector: 'general-perinatal-history',
  templateUrl: './perinatal-history.component.html',
  styleUrls: ['./perinatal-history.component.css']
})
export class PerinatalHistoryComponent implements OnInit {

  @Input('perinatalHistory')
  perinatalHistoryForm: FormGroup;

  @Input('visitCategory')
  visitType: any;

  @Input('mode')
  mode: string;

  masterData: any;
  selectDeliveryTypes: any;
  currentLanguageSet: any;
  constructor(
    private fb: FormBuilder,
    private masterdataService: MasterdataService,
    private nurseService: NurseService,
    private doctorService: DoctorService,
    private dialog: MdDialog,
    private confirmationService: ConfirmationService,
    public httpServiceService: HttpServiceService
  ) { }

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
        this.selectDeliveryTypes = this.masterData.deliveryTypes;
        if (this.mode == 'view') {
          let visitID = localStorage.getItem('visitID');
          let benRegID = localStorage.getItem('beneficiaryRegID')
          this.getGeneralHistory(benRegID, visitID);
        }
      }
    })
  }

  perinatalHistoryData: any;
  generalHistorySubscription: any;
  getGeneralHistory(benRegID, visitID) {
    this.generalHistorySubscription = this.doctorService.getGeneralHistoryDetails(benRegID, visitID).subscribe(history => {
      if (history != null && history.statusCode == 200 && history.data != null && history.data.PerinatalHistory != null) {
        this.perinatalHistoryData = history.data.PerinatalHistory

        if (this.perinatalHistoryData.deliveryPlaceID)
          this.perinatalHistoryData.placeOfDelivery = this.masterData.deliveryPlaces.filter(item => {
            return item.deliveryPlaceID == this.perinatalHistoryData.deliveryPlaceID;
          })[0];

        if (this.perinatalHistoryData.deliveryTypeID)
          this.perinatalHistoryData.typeOfDelivery = this.masterData.deliveryTypes.filter(item => {
            return item.deliveryTypeID == this.perinatalHistoryData.deliveryTypeID;
          })[0];

        if (this.perinatalHistoryData.complicationID)
          this.perinatalHistoryData.complicationAtBirth = this.masterData.deliveryComplicationTypes.filter(item => {
            return item.complicationID == this.perinatalHistoryData.complicationID;
          })[0];

        this.perinatalHistoryForm.patchValue(this.perinatalHistoryData);
      }
    })
  }

  checkWeight(birthWeight_kg) {
    if (this.birthWeight_kg >= 6)
      this.confirmationService.alert(this.currentLanguageSet.alerts.info.recheckValue);
  }

  get birthWeight_kg() {
    return this.perinatalHistoryForm.controls['birthWeight_kg'].value;
  }

  get placeOfDelivery() {
    return this.perinatalHistoryForm.controls['placeOfDelivery'].value;
  }

  get complicationAtBirth() {
    return this.perinatalHistoryForm.controls['complicationAtBirth'].value;
  }

  resetOtherPlaceOfDelivery() {

    if (this.placeOfDelivery.deliveryPlace == 'Home-Supervised' || this.placeOfDelivery.deliveryPlace == 'Home-Unsupervised') {
      let tempDeliveryTypes = this.masterData.deliveryTypes.filter(item => {
        console.log('item', item);

        return item.deliveryType != "Assisted Delivery" && item.deliveryType != "Cesarean Section (LSCS)";
      })
      this.selectDeliveryTypes = tempDeliveryTypes;
    } else {
      this.selectDeliveryTypes = this.masterData.deliveryTypes;
    }
    this.perinatalHistoryForm.patchValue({ otherPlaceOfDelivery: null });
  }

  resetOtherComplicationAtBirth() {
    this.perinatalHistoryForm.patchValue({ otherComplicationAtBirth: null });
  }


  getPreviousPerinatalHistory() {
    let benRegID = localStorage.getItem('beneficiaryRegID');
    console.log('here checkig', this.visitType);

    this.nurseService.getPreviousPerinatalHistory(benRegID, this.visitType)
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
      data: { 'dataList': data, title: this.currentLanguageSet.historyData.Perinatalhistorydetails.developmentalhistorydetails }
    });
  }

}

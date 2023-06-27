import { Component, OnInit, Inject, Input } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { RegistrarService } from '../../shared/services/registrar.service';
import { ConfirmationService } from 'app/app-modules/core/services';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-register-edit-location',
  templateUrl: './register-edit-location.component.html',
  styleUrls: ['./register-edit-location.component.css']
})
export class RegisterEditLocationComponent implements OnInit {
  statesList: any;
  districtList: any;
  subDistrictList: any;
  villageList: any;
  demographicsMaster: any;
  editDetails: any;
 
 
  /* @Input('demographicEditDetailsForm')*/
  demographicEditDetailsForm: FormGroup;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  

  constructor(public dialogRef: MdDialogRef<RegisterEditLocationComponent>,
    @Inject(MD_DIALOG_DATA) public input: any,
    private registrarService: RegistrarService,
    private confirmationService: ConfirmationService,
    private httpServiceService: HttpServiceService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.fetchLanguageResponse();
    this.demographicEditDetailsForm = new FormGroup({

      stateID: new FormControl(''),
      stateName: new FormControl(''),
      districtID: new FormControl(''),
      districtName: new FormControl(''),
      blockID: new FormControl(''),
      blockName: new FormControl(''),
      villageID: new FormControl(''),
      villageName: new FormControl('')


    })
    this.configState();

    this.loadState();
    //this.statesList = this.input.dataList.data;

  }
  configState() {
    this.demographicsMaster = Object.assign({},
      JSON.parse(localStorage.getItem('location')),
      { servicePointID: localStorage.getItem('servicePointID') },
      { servicePointName: localStorage.getItem('servicePointName') });
  }
  loadState() {

    this.statesList = this.demographicsMaster.stateMaster;
    this.demographicEditDetailsForm.patchValue({
      stateID: this.demographicsMaster.otherLoc.stateID,
      stateName: this.demographicsMaster.otherLoc.stateName
    })
    this.emptyState();


  }
  emptyState() {
    this.demographicEditDetailsForm.patchValue({
      stateID: null,
      stateName: null
    })

  }

  onStateChange() {
    this.updateStateName();

    this.registrarService.getDistrictList(this.demographicEditDetailsForm.value.stateID)
      .subscribe((res) => {
        if (res && res.statusCode === 200) {
          this.districtList = res.data;
          console.log(this.districtList);
          this.emptyDistrict();
          //this.emptySubDistrict();
          // this.emptyVillage();
        } else {
          this.confirmationService.alert(this.currentLanguageSet.alerts.info.issuesInFetchingDemographics, 'error');
        }

      })

  }

  onDistrictChange() {
    this.updateDistrictName();
    this.registrarService.getSubDistrictList(this.demographicEditDetailsForm.value.districtID)
      .subscribe((res) => {
        if (res && res.statusCode === 200) {
          this.subDistrictList = res.data;
          this.emptySubDistrict();
          //this.emptyVillage();
        } else {
          this.confirmationService.alert(this.currentLanguageSet.alerts.info.issuesInFetchingDemographics, 'error');
        }

      })

  }
  onSubDistrictChange() {
    this.updateSubDistrictName();

    this.registrarService.getVillageList(this.demographicEditDetailsForm.value.blockID)
      .subscribe((res) => {
        if (res && res.statusCode === 200) {
          this.villageList = res.data;
         

          this.emptyVillage();
        } else {
          this.confirmationService.alert(this.currentLanguageSet.alerts.info.issuesInFetchingLocationDetails, 'error');
        }

      })

  }
  onVillageChange() {
    this.updateVillageName();
  }
  updateSubDistrictName() {
    this.subDistrictList.forEach((subDistrict) => {
      if (subDistrict.blockID === this.demographicEditDetailsForm.value.blockID) {
        this.demographicEditDetailsForm.patchValue({
          blockName: subDistrict.blockName
        })
      }
    });

  }
  updateVillageName() {
    this.villageList.forEach((village) => {
      if (village.districtBranchID === this.demographicEditDetailsForm.value.villageID) {
        this.demographicEditDetailsForm.patchValue({
          villageName: village.villageName
        })
      }
    });

  }
  updateDistrictName() {
    this.districtList.forEach((district) => {
      if (district.districtID === this.demographicEditDetailsForm.value.districtID) {
        this.demographicEditDetailsForm.patchValue({
          districtName: district.districtName
        })
      }
    });

  }
  updateStateName() {
    this.statesList.forEach((state) => {
      if (state.stateID === this.demographicEditDetailsForm.value.stateID) {
        this.demographicEditDetailsForm.patchValue({
          stateName: state.stateName
        })
      }

    })

  }
  emptyVillage() {
    this.demographicEditDetailsForm.patchValue({
      villageID: null,
      villageName: null
    })
  }

  emptySubDistrict() {
    this.demographicEditDetailsForm.patchValue({
      blockID: null,
      blockName: null
    })

  }

  emptyDistrict() {
    this.demographicEditDetailsForm.patchValue({
      districtID: null,
      districtName: null
    })
  }

  closeDialog() {
    this.dialogRef.close();
  }
  onSubmitEditLocation() {

    console.log(this.demographicEditDetailsForm.value.stateID);
    console.log(this.demographicEditDetailsForm.value.villageID);
    let selectedState=[{'stateID': this.demographicEditDetailsForm.value.stateID, 'stateName': this.demographicEditDetailsForm.value.stateName }]
    let selectedVillage = [{'villageID': this.demographicEditDetailsForm.value.villageID, 'villageName': this.demographicEditDetailsForm.value.villageName }]
     let selectedDistrict=[{'districtID':this.demographicEditDetailsForm.value.districtID, 'districtName': this.demographicEditDetailsForm.value.districtName}]
     let selectedBlock=[{'blockID':this.demographicEditDetailsForm.value.blockID, 'blockName': this.demographicEditDetailsForm.value.blockName}]
    this.editDetails = Object.assign({ "selectedState": selectedState }, { "selectedDistrict": selectedDistrict}, { "selectedBlock":selectedBlock }, { "selectedVillage": selectedVillage }, { 'villageList': this.villageList });
    console.log("Edit DEtails" + this.editDetails);

    // this.dialogRef.close({event:'close',data:this.demographicEditDetailsForm.value.stateID});
    this.dialogRef.close({ event: 'close', data: this.editDetails });


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

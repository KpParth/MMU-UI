import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

import { MasterdataService, DoctorService } from '../../../../shared/services';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'app/app-modules/core/services/confirmation.service';
import { GeneralUtils } from 'app/app-modules/nurse-doctor/shared/utility';

@Component({
  selector: 'app-ncd-care-diagnosis',
  templateUrl: './ncd-care-diagnosis.component.html',
  styleUrls: ['./ncd-care-diagnosis.component.css']
})
export class NcdCareDiagnosisComponent implements OnInit {
  utils = new GeneralUtils(this.fb);

  @Input('generalDiagnosisForm')
  generalDiagnosisForm: FormGroup;

  @Input('caseRecordMode')
  caseRecordMode: string;

  ncdCareConditions: any;
  ncdCareTypes: any;
  isNcdScreeningConditionOther: boolean=false;
  temp:any=[];
  current_language_set: any;
  attendantType: any;
  enableNCDCondition: boolean = false;
  constructor(
    private fb: FormBuilder,
    private masterdataService: MasterdataService,
    private doctorService: DoctorService,
    private httpServiceService:HttpServiceService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.getDoctorMasterData();
    this.attendantType = this.route.snapshot.params['attendant'];
    if(this.attendantType == "doctor"){
      this.enableNCDCondition= true;
    }
  }
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
    }

  getDoctorMasterData() {
    this.masterdataService.doctorMasterData$.subscribe(masterData => {
      if (masterData) {
        if(masterData.ncdCareConditions)
        this.ncdCareConditions = masterData.ncdCareConditions.slice();
        if(masterData.ncdCareTypes)
        this.ncdCareTypes = masterData.ncdCareTypes.slice();

        if (this.caseRecordMode == 'view') {
          let beneficiaryRegID = localStorage.getItem('beneficiaryRegID');
          let visitID = localStorage.getItem('visitID');
          let visitCategory = localStorage.getItem('visitCategory');
          this.getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory);
        }
      }
    })
  }

  // diagnosisSubscription: any;
  // getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory) {
  //   this.diagnosisSubscription = this.doctorService.getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
  //     .subscribe(res => {
  //       if (res && res.statusCode == 200 && res.data && res.data.diagnosis) {
  //         this.patchDiagnosisDetails(res.data.diagnosis);
  //       }
  //     })
  // }
  diagnosisSubscription: any;
  getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory) {
    this.diagnosisSubscription = this.doctorService.getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data && res.data.diagnosis) {
          this.patchDiagnosisDetails(res.data.diagnosis);
        }
      })
  }
  // getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory) {
  //   this.diagnosisSubscription = this.doctorService.getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
  //     .subscribe(res => {
  //       if (res && res.statusCode == 200 && res.data && res.data.diagnosis) {
  //         this.generalDiagnosisForm.patchValue(res.data.diagnosis);
  //         if (res.data.diagnosis.provisionalDiagnosisList){
  //               this.patchDiagnosisDetails(res.data.diagnosis.provisionalDiagnosisList);
  //       }
          
  //       }
  //     });
  // }

  // patchDiagnosisDetails(diagnosis) {
  //   console.log('diagnosis',diagnosis);
    
  //   // let ncdScreeningCondition = this.ncdCareConditions.filter(item => {
  //   //   console.log('item',item);
  //   //   return item.screeningCondition == diagnosis.ncdScreeningCondition
  //   // });
  //   // if (ncdScreeningCondition.length > 0)
  //   //   diagnosis.ncdScreeningCondition = ncdScreeningCondition[0];
  //   if(diagnosis!=undefined && diagnosis.ncdScreeningConditionArray !=undefined && diagnosis.ncdScreeningConditionArray !=null)
  //   {
  //     this.temp=diagnosis.ncdScreeningConditionArray;
  //   }
  //   if(diagnosis!=undefined && diagnosis.ncdScreeningConditionOther !=undefined && diagnosis.ncdScreeningConditionOther !=null)
  //   {
  //     this.isNcdScreeningConditionOther=true;
  //   }

  //   let ncdCareType = this.ncdCareTypes.filter(item => {
  //     return item.ncdCareType == diagnosis.ncdCareType
  //   });
  //   if (ncdCareType.length > 0)
  //     diagnosis.ncdCareType = ncdCareType[0];

  //   this.generalDiagnosisForm.patchValue(diagnosis);
  // }

  // patchDiagnosisDetails(provisionalDiagnosis) {
  //   let savedDiagnosisData = provisionalDiagnosis;
  //   let diagnosisArrayList = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
  //   console.log("from diagnosis" + provisionalDiagnosis[0].term );
  //   if(provisionalDiagnosis[0].term != "" && provisionalDiagnosis[0].conceptID != "")
  //   {
  //     console.log("from diagnosis second" + provisionalDiagnosis[0].term );
      
  //     for (let i = 0; i < savedDiagnosisData.length; i++) {

  //       diagnosisArrayList.at(i).patchValue({
  //         "viewProvisionalDiagnosisProvided": savedDiagnosisData[i].term,
  //         "term": savedDiagnosisData[i].term,
  //         "conceptID": savedDiagnosisData[i].conceptID
  //       });
  //       (<FormGroup>diagnosisArrayList.at(i)).controls['viewProvisionalDiagnosisProvided'].disable();
  //       if (diagnosisArrayList.length < savedDiagnosisData.length)
  //         this.addDiagnosis();
  //     }
  //   }
  // }

  patchDiagnosisDetails(diagnosis) {
    this.generalDiagnosisForm.patchValue(diagnosis)
    let generalArray = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;

    
    let previousArray = diagnosis.provisionalDiagnosisList;
    var j = 0
    if(previousArray !=undefined && previousArray.length>0){
    previousArray.forEach(i => {
      generalArray.at(j).patchValue({
        "conceptID": i.conceptID,
        "term": i.term,
        "provisionalDiagnosis": i.term
      });
      (<FormGroup>generalArray.at(j)).controls['provisionalDiagnosis'].disable();
      if (generalArray.length < previousArray.length) {
        this.addDiagnosis();
      }
      j++;
    });
  }
  }

  // addDiagnosis() {
  //   let diagnosisArrayList = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
  //   if (diagnosisArrayList.length <= 29) {
  //     diagnosisArrayList.push(this.utils.initProvisionalDiagnosisList());
  //   } else {
  //     this.confirmationService.alert(this.current_language_set.alerts.info.maxDiagnosis);
  //   }
  // }
  // removeDiagnosisFromList(index, diagnosisListForm?: FormGroup) {
  //   let diagnosisListArray = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
  //   if (diagnosisListArray.at(index).valid) {
  //     this.confirmationService.confirm(`warn`, this.current_language_set.alerts.info.warn).subscribe(result => {
  //       if (result) {
  //         let diagnosisListArray = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
  //         if (diagnosisListArray.length > 1) {
  //           diagnosisListArray.removeAt(index);
  //         }
  //         else {
  //           diagnosisListForm.reset();
  //           diagnosisListForm.controls['viewProvisionalDiagnosisProvided'].enable();
  //         }
  //         this.generalDiagnosisForm.markAsDirty();
  //       }
  //     });
  //   } else {
  //     if (diagnosisListArray.length > 1) {
  //       diagnosisListArray.removeAt(index);
  //     }
  //     else {
  //       diagnosisListForm.reset();
  //       diagnosisListForm.controls['viewProvisionalDiagnosisProvided'].enable();
  //     }
  //   }

  // }

  // checkProvisionalDiagnosisValidity(provisionalDiagnosis) {
  //   let temp = provisionalDiagnosis.value;
  //   if (temp.term && temp.conceptID) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }
  addDiagnosis() {

    let diagnosisListForm = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
    if (diagnosisListForm.length < 30) {
      diagnosisListForm.push(this.utils.initProvisionalDiagnosisList());
    }
    else {
      this.confirmationService.alert(this.current_language_set.alerts.info.maxDiagnosis);
    }
  }


  deleteDiagnosis(index, diagnosisList?: FormArray) {
    let diagnosisListForm = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
    if (!diagnosisListForm.at(index).invalid) {
      this.confirmationService.confirm(`warn`, this.current_language_set.alerts.info.warn).subscribe(result => {
        if (result) {
          let diagnosisListForm = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
          if (diagnosisListForm.length > 1) {
            diagnosisListForm.removeAt(index);
          }
          else {
            diagnosisListForm.removeAt(index);
            diagnosisListForm.push(this.utils.initProvisionalDiagnosisList());
          }
        }
      });
    } else {
      if (diagnosisListForm.length > 1) {
        diagnosisListForm.removeAt(index);
      }
      else {
        diagnosisListForm.removeAt(index);
        diagnosisListForm.push(this.utils.initProvisionalDiagnosisList());
      }
    }
  }

  checkProvisionalDiagnosisValidity(diagnosis) {
    let tempDiagnosis = diagnosis.value
    if (tempDiagnosis.conceptID && tempDiagnosis.term) {
      return false;
    }
    else {
      return true;
    }
  }

  changeNcdScreeningCondition(value,event)
  {
    let flag=false;
    if(value !=undefined && value !=null &&  value.length >0)
    {
    value.forEach(element => {
      if(element == 'Other')
      flag=true;
    });
  }
    if(flag)
    this.isNcdScreeningConditionOther=true;
    else
    {
      this.generalDiagnosisForm.controls['ncdScreeningConditionOther'].patchValue(null);
      this.isNcdScreeningConditionOther=false;
    }
    // console.log(value);
    // if(event.checked)
    // {
    //   this.addToTemp(value);
    //   if(value == "Other")
    //   {
    //     this.isNcdScreeningConditionOther=true;
    //   }
    // }
    // else{
    //   this.removeTemp(value);
    //   if(value == "Other")
    //   {
    //     this.generalDiagnosisForm.controls['ncdScreeningConditionOther'].patchValue(null);
    //     this.isNcdScreeningConditionOther=false;
    //   }
    // }
    this.temp=value;
    this.generalDiagnosisForm.controls['ncdScreeningConditionArray'].patchValue(value);
  }
}

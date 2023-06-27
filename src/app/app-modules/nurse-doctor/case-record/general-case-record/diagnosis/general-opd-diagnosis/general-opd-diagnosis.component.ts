import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ConfirmationService } from '../../../../../core/services/confirmation.service'
import { MasterdataService, NurseService, DoctorService } from '../../../../shared/services';
import { GeneralUtils } from '../../../../shared/utility/general-utility';
import { Item } from 'md2';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-general-opd-diagnosis',
  templateUrl: './general-opd-diagnosis.component.html',
  styleUrls: ['./general-opd-diagnosis.component.css']
})
export class GeneralOpdDiagnosisComponent implements OnInit {

  @Input('generalDiagnosisForm')
  generalDiagnosisForm: FormGroup;

  @Input('caseRecordMode')
  caseRecordMode: string;
  utils = new GeneralUtils(this.fb);
  diagnosisSubscription: any;
  current_language_set: any;
  constructor(
    private fb: FormBuilder,
    private nurseService: NurseService,
    private doctorService: DoctorService,
    private masterdataService: MasterdataService,
    private confirmationService: ConfirmationService,
    private httpServiceService:HttpServiceService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.caseRecordMode == 'view') {
      let beneficiaryRegID = localStorage.getItem('beneficiaryRegID');
      let visitID = localStorage.getItem('visitID');
      let visitCategory = localStorage.getItem('visitCategory');
      this.getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory);
    }
    // if(this.generalDiagnosisForm.controls['specialistDiagnosis'] !=undefined)
    // this.generalDiagnosisForm.controls['specialistDiagnosis'].disable();
    //   this.specialist = false;
  }
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
    }

  getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory) {
    this.diagnosisSubscription = this.doctorService.getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data && res.data.diagnosis) {
          this.patchDiagnosisDetails(res.data.diagnosis);
        }
      })
  }

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
}


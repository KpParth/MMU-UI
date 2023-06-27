import { Component, OnInit, Input } from '@angular/core';
import { GeneralUtils } from 'app/app-modules/nurse-doctor/shared/utility';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { DoctorService, NurseService } from 'app/app-modules/nurse-doctor/shared/services';
import { ConfirmationService } from 'app/app-modules/core/services/confirmation.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-ncd-screening-diagnosis',
  templateUrl: './ncd-screening-diagnosis.component.html',
  styleUrls: ['./ncd-screening-diagnosis.component.css']
})
export class NcdScreeningDiagnosisComponent implements OnInit {

  utils = new GeneralUtils(this.fb);

  @Input('generalDiagnosisForm')
  generalDiagnosisForm: FormGroup;

  @Input('caseRecordMode')
  caseRecordMode: string;

  diagnosisSubscription: any;
  designation: string;
  specialist: boolean;
  doctorDiagnosis: any;
  current_language_set: any;
  enableProvisionalDiag: boolean;
  constructor(private fb: FormBuilder,private doctorService: DoctorService,
    private confirmationService: ConfirmationService,
    private httpServiceService:HttpServiceService,
    private nurseService: NurseService) { }

  ngOnInit() {
  console.log("caseRecordMode",this.caseRecordMode);
  console.log("doctorDiagnosis",this.doctorDiagnosis);
  // if(this.generalDiagnosisForm.controls['specialistDiagnosis'] !=undefined)
  // this.generalDiagnosisForm.controls['specialistDiagnosis'].disable();
  // this.specialist = false;
    // this.designation = localStorage.getItem("designation");
    // if (this.designation == "TC Specialist") {
    //   this.generalDiagnosisForm.controls['specialistDiagnosis'].enable();
    //   this.specialist = true;
    // } else {
    //   this.generalDiagnosisForm.controls['specialistDiagnosis'].disable();
    //   this.specialist = false;
    // }
    // if (this.designation == "TC Specialist") {
    //   this.generalDiagnosisForm.controls['doctorDiagnosis'].disable();
    //   this.specialist = true;
    // } else {
    //   this.generalDiagnosisForm.controls['doctorDiagnosis'].enable();
    //   this.specialist = false;
    // }
    this.nurseService.enableProvisionalDiag$.subscribe(
      (response) => {
        if(response == true) {
          this.enableProvisionalDiag = true;
        } else {
          this.enableProvisionalDiag = false;
        }
      }
    );
   }
   get specialistDaignosis() {
    return this.generalDiagnosisForm.get("instruction");
  }

  get doctorDaignosis() {
    return this.generalDiagnosisForm.get("provisionalDiagnosis");
  }
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
    }
  ngOnChanges() {
    if (this.caseRecordMode == 'view') {
      let beneficiaryRegID = localStorage.getItem('beneficiaryRegID');
      let visitID = localStorage.getItem('visitID');
      let visitCategory = localStorage.getItem('visitCategory');
      this.getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory);
    }
  }

  getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory) {
    this.diagnosisSubscription = this.doctorService.getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data && res.data.diagnosis) {
          this.patchDiagnosisDetails(res.data.diagnosis);
        }
      })
  }

 
  // patchDiagnosisDetails(diagnosis) {
  //   // 
    
  //   // diagnosis.doctorDiagnosis = this.doctorDiagnosis;
  //   // referFormData.revisitDate = referForm.controls["doctorDiagnosis"].value;
  //   console.log("diagnosis",diagnosis.doctorDiagnonsis);
    
  //   this.generalDiagnosisForm.patchValue({'doctorDiagnosis' : diagnosis.doctorDiagnonsis});
  //   // this.generalDiagnosisForm.patchValue({'prescriptionID' : diagnosis.prescriptionID });
  //   this.generalDiagnosisForm.patchValue(diagnosis);

    
  // }

  patchDiagnosisDetails(diagnosis) {
    this.generalDiagnosisForm.patchValue(diagnosis)
    let generalArray = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;

    
    let previousArray = diagnosis.provisionalDiagnosisList;
    var j = 0
    if(previousArray !=undefined && previousArray !=null && previousArray.length>0){
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
      this.current_language_set.alerts.info.maxDiagnosis
    }
  }

  deleteDiagnosis(index, diagnosisList?: FormArray) {
    let diagnosisListForm = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
    if (!diagnosisListForm.at(index).invalid) {
      this.confirmationService .confirm(`warn`, this.current_language_set.alerts.info.warn).subscribe(result => {
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

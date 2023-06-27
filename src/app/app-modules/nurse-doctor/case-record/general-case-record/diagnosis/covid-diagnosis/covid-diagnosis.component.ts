import { Component, OnInit , Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FormBuilder, FormGroup, FormControl, FormArray, NgForm } from '@angular/forms';

import { MasterdataService, NurseService, DoctorService } from '../../../../shared/services';

import { GeneralUtils } from '../../../../shared/utility';

import { ConfirmationService } from "../../../../../core/services/confirmation.service";
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';


@Component({
  selector: 'app-covid-diagnosis',
  templateUrl: './covid-diagnosis.component.html',
  styleUrls: ['./covid-diagnosis.component.css']
})
export class CovidDiagnosisComponent implements OnInit {

  utils = new GeneralUtils(this.fb);

  @Input('generalDiagnosisForm')
  generalDiagnosisForm: FormGroup;

  @Input('caseRecordMode')
  caseRecordMode: string;

  designation: any;
  specialist:boolean;
  doctorDiagnosis: any;
  current_language_set: any;

  constructor(private fb: FormBuilder,

    private nurseService: NurseService,
    private doctorService: DoctorService,
    private masterdataService: MasterdataService,
    private confirmationService: ConfirmationService,
    private httpServiceService:HttpServiceService) { }

  ngOnInit() {
  
    this.designation = localStorage.getItem("designation");
    // if(this.generalDiagnosisForm.controls['specialistDiagnosis'] !=undefined)
    // this.generalDiagnosisForm.controls['specialistDiagnosis'].disable();
    //    this.specialist = false;
    // if (this.designation == "TC Specialist") {
    //   this.generalDiagnosisForm.controls['specialistDiagnosis'].enable();
    //   this.specialist = true;
    // } else {
    //   this.generalDiagnosisForm.controls['specialistDiagnosis'].disable();
    //   this.specialist = false;
    // }
    if (this.designation == "TC Specialist") {
      this.generalDiagnosisForm.controls['doctorDiagnosis'].disable();
      this.specialist = true;
    } else {
      this.generalDiagnosisForm.controls['doctorDiagnosis'].enable();
      this.specialist = false;
    }
   }
   get specialistDaignosis() {
    return this.generalDiagnosisForm.get("specialistDiagnosis");
  }

  get doctorDaignosis() {
    return this.generalDiagnosisForm.get("doctorDiagnosis");
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

  diagnosisSubscription: any;
  getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory) {
    this.diagnosisSubscription = this.doctorService.getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data && res.data.diagnosis) {
          console.log("caserecord",res.data.diagnosis);
          
          this.patchDiagnosisDetails(res.data.diagnosis);
        }
      })
  }
  patchDiagnosisDetails(diagnosis) {
    // 
    
    // diagnosis.doctorDiagnosis = this.doctorDiagnosis;
    // referFormData.revisitDate = referForm.controls["doctorDiagnosis"].value;
    console.log("diagnosis",diagnosis.doctorDiagnonsis);
    
    this.generalDiagnosisForm.patchValue({'doctorDiagnosis' : diagnosis.doctorDiagnonsis});
    // this.generalDiagnosisForm.patchValue({'prescriptionID' : diagnosis.prescriptionID });
    this.generalDiagnosisForm.patchValue(diagnosis);

    
  }

 

}

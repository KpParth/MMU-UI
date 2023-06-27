import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

import { MasterdataService, NurseService, DoctorService } from '../../../../shared/services';
import { BeneficiaryDetailsService } from 'app/app-modules/core/services/beneficiary-details.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-anc-diagnosis',
  templateUrl: './anc-diagnosis.component.html',
  styleUrls: ['./anc-diagnosis.component.css']
})
export class AncDiagnosisComponent implements OnInit {
  masterData: any;
  today: Date;
  beneficiaryRegID: any;
  visitID: any;
  visitCategory: any;

  minimumDeathDate: Date;

  showOtherPregnancyComplication: Boolean = false;
  disableNonePregnancyComplication: Boolean = false;
  showAllPregComplication: Boolean = true;
  showHRP: any;
  complicationPregHRP: string="false";

  @Input('generalDiagnosisForm')
  generalDiagnosisForm: FormGroup;

  @Input('caseRecordMode')
  caseRecordMode: string;
  current_language_set: any;

  constructor(
    private fb: FormBuilder,
    private nurseService: NurseService,
    private doctorService: DoctorService,
    private masterdataService: MasterdataService,
    public beneficiaryDetailsService: BeneficiaryDetailsService,
    private httpServiceService:HttpServiceService) { }

  ngOnInit() {
    this.today = new Date();
    this.minimumDeathDate = new Date(this.today.getTime() - (365 * 24 * 60 * 60 * 1000));
    this.beneficiaryDetailsService.resetHRPPositive();
    this.fetchHPRPositive();
    this.getMasterData();
    this.beneficiaryDetailsService.HRPPositiveFlag$.subscribe(response => {
     
      if(response > 0)
      {
       this.showHRP="true";
      }
    else
    {
     this.showHRP="false";
    } 
     });
     
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
    if (this.nurseMasterDataSubscription)
      this.nurseMasterDataSubscription.unsubscribe();
  }

  nurseMasterDataSubscription: any;
  getMasterData() {
    this.nurseMasterDataSubscription = this.masterdataService.nurseMasterData$.subscribe(masterData => {
      if (masterData)
        this.masterData = masterData;

      if (this.caseRecordMode == 'view') {
        this.beneficiaryRegID = localStorage.getItem('beneficiaryRegID');
        this.visitID = localStorage.getItem('visitID');
        this.visitCategory = localStorage.getItem('visitCategory');
        this.getDiagnosisDetails(this.beneficiaryRegID, this.visitID, this.visitCategory);

      }
    })
  }

  diagnosisSubscription: any;
  getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory) {
    this.diagnosisSubscription = this.doctorService.getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data && res.data.diagnosis) {
          this.patchDiagnosisDetails(res.data.diagnosis);
        }
      })
  }

  patchDiagnosisDetails(diagnosis) {
    if (diagnosis.dateOfDeath)
      diagnosis.dateOfDeath = new Date(diagnosis.dateOfDeath);
    this.generalDiagnosisForm.patchValue(diagnosis);
    this.patchComplicationOfCurrentPregnancyList(diagnosis);
  }
  patchComplicationOfCurrentPregnancyList(diagnosis) {
    let tempComplicationList = [];
    diagnosis.complicationOfCurrentPregnancyList.map((complaintType) => {
      if(this.masterData !=undefined && this.masterData.pregComplicationTypes !=undefined )
      {
        let tempComplication = this.masterData.pregComplicationTypes.filter((masterComplication) => {
          return complaintType.pregComplicationType == masterComplication.pregComplicationType
        });
        if (tempComplication.length > 0) {
          tempComplicationList.push(tempComplication[0]);
        }
      }
    })
    diagnosis.complicationOfCurrentPregnancyList = tempComplicationList.slice();

    this.resetOtherPregnancyComplication(tempComplicationList, diagnosis);
    this.generalDiagnosisForm.patchValue(diagnosis);
  }
  get highRiskStatus() {
    return this.generalDiagnosisForm.get('highRiskStatus');
  }

  get highRiskCondition() {
    return this.generalDiagnosisForm.get('highRiskCondition');
  }

  checkWithDeathDetails() {
    this.generalDiagnosisForm.patchValue({
      placeOfDeath: null,
      dateOfDeath: null,
      causeOfDeath: null
    })
  }
  get complicationOfCurrentPregnancyList() {
    return this.generalDiagnosisForm.controls['complicationOfCurrentPregnancyList'].value;
  }

  resetOtherPregnancyComplication(complication, checkNull) {
    let flag = false;
    complication.forEach(element => {
      if (element.pregComplicationType == 'Other') {
        flag = true;
      }
    });
    this.showOtherPregnancyComplication = flag;
    if (complication.length > 1) {
      this.disableNonePregnancyComplication = true;
      this.showAllPregComplication = false;
    }
    else if (complication.length == 1) {
      let disableNone = complication[0].pregComplicationType == 'None' ? false : true;
      this.disableNonePregnancyComplication = disableNone;
      this.showAllPregComplication = false;
    }
    else {
      this.disableNonePregnancyComplication = false;
      this.showAllPregComplication = true;
    }
    if (checkNull == 0) {
      if (!flag) {
        this.generalDiagnosisForm.patchValue({
          'otherCurrPregComplication': null
        })
      }
    } else {
      if (flag) {
        this.generalDiagnosisForm.patchValue({
          'otherCurrPregComplication': checkNull.otherCurrPregComplication
        })
      }
    }

  }
  displayPositive(complicationList)
  {
    if (complicationList.some((item) => item.pregComplicationType == 'Hypothyroidism')) 
    {
      this.complicationPregHRP="true";
     }
   else
   {
    this.complicationPregHRP="false";
  }
  }

  HRPSubscription: any;
  fetchHPRPositive()
  {
    let beneficiaryRegID = localStorage.getItem("beneficiaryRegID");
    let visitCode = localStorage.getItem('visitCode');
    this.HRPSubscription = this.doctorService
    .getHRPDetails(beneficiaryRegID,visitCode)
    .subscribe(res => {
      if (res && res.statusCode == 200 && res.data) {
        if(res.data.isHRP == true)
        {
          this.showHRP="true";
        }
        else
        {
          this.showHRP="false";
        }
      }
    });
  }
}

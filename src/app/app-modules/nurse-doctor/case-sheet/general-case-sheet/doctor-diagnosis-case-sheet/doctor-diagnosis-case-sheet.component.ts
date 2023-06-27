import { Component, OnInit, Input } from '@angular/core';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { MasterdataService, NurseService } from 'app/app-modules/nurse-doctor/shared/services';
import { DoctorService } from 'app/app-modules/nurse-doctor/shared/services/doctor.service';

@Component({
  selector: 'app-doctor-diagnosis-case-sheet',
  templateUrl: './doctor-diagnosis-case-sheet.component.html',
  styleUrls: ['./doctor-diagnosis-case-sheet.component.css']
})
export class DoctorDiagnosisCaseSheetComponent implements OnInit {

  @Input('data')
  casesheetData: any;
  @Input('previous')
  previous: any;
  @Input('printPagePreviewSelect')
  printPagePreviewSelect: any;
  
  date: any;
  blankRows = [1, 2, 3, 4];
  visitCategory: any;

  beneficiaryDetails: any;
  currentVitals: any;
  caseRecords: any;
  ancDetails: any;
  symptomsList:any=[];
  symptomFlag: boolean;
  contactList:any=[];
  contactFlag: boolean;
  travelStatus: any;
  travelFlag: boolean;
  suspectedFlag: boolean;
  suspected: any;
  recFlag: boolean;
  recommendation:any=[];
  temp:any=[];
  recommendationText:string;
  tempComp: string;
  indexComplication: number;
  tempComplication: boolean = false;
  newComp: string;
  idrsDetailsHistory: any =[];
  suspect: any = [];
  suspectt: any = [];
  temp1: any =[];

  severityValue: any;
  cough_pattern_Value: any;
  enableResult:boolean =false;
  severity: any;
  cough_pattern: any;
  cough_severity_score: any;
  record_duration: any;
 
  idrsScore: any;
  enableTCReferredMMUData: boolean=false;
  showHRP: string;
  tmCaseSheet : any;
  imgUrl: string | ArrayBuffer;
  mmuCaseSheetData: any;
  MMUcaseRecords: any;
  ncdScreeningCondition: any;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  covidVaccineDetails: any;
  ageValidationForVaccination="< 12 years";


  constructor(private doctorService: DoctorService,private nurseService: NurseService, public httpServiceService: HttpServiceService,
    private masterdataService: MasterdataService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
    this.visitCategory = localStorage.getItem('caseSheetVisitCategory');
    this.tmCaseSheet = sessionStorage.getItem("tmCaseSheet")
    if(localStorage.getItem('caseSheetTMFlag') == "true" || parseInt(localStorage.getItem('specialistFlag') )== 200)
    {
      let caseSheetRequest = {
        "VisitCategory": localStorage.getItem('caseSheetVisitCategory'),
        "benFlowID": localStorage.getItem('caseSheetBenFlowID'),
        "benVisitID": localStorage.getItem('caseSheetVisitID'),
        "beneficiaryRegID": localStorage.getItem('caseSheetBeneficiaryRegID'),
        "visitCode": localStorage.getItem('caseSheetVisitCode')
       
      }
      this.getMMUCasesheetDataInTCReferred(caseSheetRequest);
      this.enableTCReferredMMUData=true;
    }
    this.fetchHRPPositive();
    this.getAssessmentID();
  }
  getMMUCasesheetDataInTCReferred(caseSheetRequest) {
   this.doctorService.getMMUCasesheetData(caseSheetRequest)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data) {
          this.mmuCaseSheetData = res.data;
          this.MMUcaseRecords = this.mmuCaseSheetData.doctorData;
           let mmuVitalsData=this.mmuCaseSheetData.nurseData.vitals.benPhysicalVitalDetail;
          if(mmuVitalsData.rbsTestResult)
          {
            
            let mmuVitalsRBSValue= {
              "prescriptionID": null,
              "procedureID": null,
              "createdDate": mmuVitalsData.createdDate,
              "procedureName": "RBS Test",
              "procedureType": "Laboratory",
              "componentList": [
                {
                  "testResultValue": mmuVitalsData.rbsTestResult,
                  "remarks": mmuVitalsData.rbsTestRemarks,
                  "fileIDs": [
                    null
                  ],
                  "testResultUnit": "mg/dl",
                  "loincName": null,
                  "testComponentID": null,
                  "componentName": null
                }
              ]
            };
            // this.MMUcaseRecords.LabReport.push(mmuVitalsRBSValue);
            this.MMUcaseRecords.LabReport=[mmuVitalsRBSValue].concat(this.MMUcaseRecords.LabReport);
          }
         
        }
      });
  }

  ngOnChanges() {
    this.ncdScreeningCondition=null;
    if (this.casesheetData) {
      let temp2 = this.casesheetData.nurseData.covidDetails;
      let t = new Date();
      this.date = t.getDate() + "/" + (t.getMonth() + 1) + "/" + t.getFullYear();

      this.beneficiaryDetails = this.casesheetData.BeneficiaryData;
   

      if (this.beneficiaryDetails.serviceDate) {
        let sDate = new Date(this.beneficiaryDetails.serviceDate);
        this.beneficiaryDetails.serviceDate = [
          this.padLeft.apply(sDate.getDate()),
          this.padLeft.apply((sDate.getMonth() + 1)),
          this.padLeft.apply(sDate.getFullYear())].join('/') +
          ' ' +
          [this.padLeft.apply(sDate.getHours()),
          this.padLeft.apply(sDate.getMinutes()),
          this.padLeft.apply(sDate.getSeconds())].join(':');
      }

      if (this.beneficiaryDetails.consultationDate) {
        let cDate = new Date(this.beneficiaryDetails.consultationDate);
        this.beneficiaryDetails.consultationDate = [
          this.padLeft.apply(cDate.getDate()),
          this.padLeft.apply((cDate.getMonth() + 1)),
          this.padLeft.apply(cDate.getFullYear())].join('/') +
          ' ' +
          [this.padLeft.apply(cDate.getHours()),
          this.padLeft.apply(cDate.getMinutes()),
          this.padLeft.apply(cDate.getSeconds())].join(':');
      }

      let temp = this.casesheetData.nurseData.vitals;
      this.currentVitals = Object.assign({}, temp.benAnthropometryDetail, temp.benPhysicalVitalDetail);

      if (this.visitCategory != 'General OPD (QC)') {
        this.caseRecords = this.casesheetData.doctorData;
        if(this.caseRecords && this.caseRecords.diagnosis && this.caseRecords.diagnosis.ncdScreeningCondition)
        {
          this.ncdScreeningCondition=(this.caseRecords.diagnosis.ncdScreeningCondition).replaceAll("||",",");
        }
      } else {
        let temp = this.casesheetData.doctorData;
        this.caseRecords = {
          findings: temp.findings,
          prescription: temp.prescription,
          diagnosis: {
            provisionalDiagnosis: temp.diagnosis.diagnosisProvided,
            specialistAdvice: temp.diagnosis.instruction,
            externalInvestigation: temp.diagnosis.externalInvestigation
          },
          LabReport: temp.LabReport
        }
      }

      if(this.currentVitals.rbsTestResult)
      {
        
        let vitalsRBSValue= {
          "prescriptionID": null,
          "procedureID": null,
          "createdDate": this.currentVitals.createdDate,
          "procedureName": "RBS Test",
          "procedureType": "Laboratory",
          "componentList": [
            {
              "testResultValue": this.currentVitals.rbsTestResult,
              "remarks": this.currentVitals.rbsTestRemarks,
              "fileIDs": [
                null
              ],
              "testResultUnit": "mg/dl",
              "loincName": null,
              "testComponentID": null,
              "componentName": null
            }
          ]
        };
        // this.caseRecords.LabReport.push(vitalsRBSValue);
        this.caseRecords.LabReport=[vitalsRBSValue].concat(this.caseRecords.LabReport);
      }


      this.ancDetails = this.casesheetData.nurseData.anc;
      if(this.caseRecords.diagnosis.complicationOfCurrentPregnancy !== undefined)
      {
      this.tempComp=this.caseRecords.diagnosis.complicationOfCurrentPregnancy;
      console.log("tempComp"+this.tempComp)
      this.indexComplication=this.tempComp.indexOf("Other-complications : null");
      console.log("indexComp"+this.indexComplication)
      if(this.indexComplication!==-1)
      {
        this.tempComplication = true;
        this.newComp=this.tempComp.replace(', Other-complications : null','');
        console.log("newComp"+this.newComp)
      }
      else{
        this.tempComplication = false;
      }
     
    }

      if (temp2 != undefined) {
        if ((temp2["symptom"]) != undefined) {
          this.symptomsList = temp2["symptom"];
          this.symptomFlag = true;
        }
        if ((temp2["contactStatus"]) != undefined) {
          this.contactList = temp2["contactStatus"];
          if ((this.contactList.length) > 0)
            this.contactFlag = true;
          else
            this.contactFlag = false;
        }
        if ((temp2.travelStatus) != undefined) {
          this.travelStatus = temp2.travelStatus;
          if (this.travelStatus === false) {
            this.travelFlag = true;
            this.travelStatus = "No";
          }
          else if (this.travelStatus === true) {
            this.travelFlag = true;
            this.travelStatus = "Yes";
          }
          else
            this.travelFlag = false;
        }
        if ((temp2.suspectedStatusUI) != undefined) {
          this.suspectedFlag = true;
          this.suspected = temp2.suspectedStatusUI;
        }
        if ((temp2["recommendation"]) != undefined) {
          this.recFlag = true;
          this.recommendation = temp2["recommendation"];
          let ar = this.recommendation[0]
          for (var i = 0; i < ar.length; i++) {
            this.temp.push(ar[i]);
          }
          let testtravelarr = this.temp.join("\n");
          this.recommendationText = testtravelarr;
        }
      }
      if(this.casesheetData.nurseData.idrs !== undefined && this.casesheetData.nurseData.idrs){
      if(this.casesheetData.nurseData.idrs.IDRSDetail){
        this.idrsDetailsHistory = this.casesheetData.nurseData.idrs.IDRSDetail;
        this.temp1 = this.idrsDetailsHistory.idrsDetails.filter(response=>response.answer === 'yes');
        
        this.temp1 = this.temp1.filter(
          (idrsQuestionId, index, arr) => arr.findIndex(t => t.idrsQuestionId === idrsQuestionId.idrsQuestionId) === index
          ); 
        }
        if(this.casesheetData.nurseData.idrs.IDRSDetail){
        this.idrsScore = this.casesheetData.nurseData.idrs.IDRSDetail;
        }
        if(this.casesheetData.nurseData.idrs.IDRSDetail.suspectedDisease){
        this.suspect = this.casesheetData.nurseData.idrs.IDRSDetail.suspectedDisease.split(',') ;
        }
        if(this.casesheetData.nurseData.idrs.IDRSDetail.confirmedDisease){
          this.suspectt = this.casesheetData.nurseData.idrs.IDRSDetail.confirmedDisease.split(',') ;
        }
      }

        this.downloadSign();
        this.getVaccinationTypeAndDoseMaster();
    }
  }

  downloadSign() {
   
    if (this.beneficiaryDetails && this.beneficiaryDetails.tCSpecialistUserID) {
    
      let tCSpecialistUserID = this.beneficiaryDetails.tCSpecialistUserID;
      this.doctorService.downloadSign(tCSpecialistUserID).subscribe((response) => {
        const blob = new Blob([response], { type: response.type });
        this.showSign(blob);
      }, (err) => {
        console.log('error');
      })
    } else {
      
      console.log("No tCSpecialistUserID found");
    }
  }
  showSign(blob) {
    let reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = (_event) => {
      this.imgUrl = reader.result;
    }
  }


  padLeft() {
    let len = (String(10).length - String(this).length) + 1;
    return len > 0 ? new Array(len).join('0') + this : this;
  }

  fetchHRPPositive()
  {
    let beneficiaryRegID = localStorage.getItem('caseSheetBeneficiaryRegID');
    let visitCode = localStorage.getItem('visitCode');
    this.doctorService
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

  // AV40085804 13/10/2021 Integrating Multilingual Functionality -----Start-----
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.httpServiceService);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  // -----End------

  getVaccinationTypeAndDoseMaster(){
    if(this.beneficiaryDetails !== undefined && this.beneficiaryDetails !== null){
      if(this.beneficiaryDetails.ageVal >= 12) {
      this.masterdataService.getVaccinationTypeAndDoseMaster().subscribe((res) => {
        if (res.statusCode == 200) {
          if (res.data) {
            let doseTypeList = res.data.doseType;
            let vaccineTypeList = res.data.vaccineType;
                this.getPreviousCovidVaccinationDetails(doseTypeList,vaccineTypeList);
          
          }
        
        }
        
      }, err => {
        console.log("error",err.errorMessage);
      });

    }
  }

  }

  getPreviousCovidVaccinationDetails(doseTypeList,vaccineTypeList)
  {
    let beneficiaryRegID = localStorage.getItem('caseSheetBeneficiaryRegID');
    this.masterdataService.getPreviousCovidVaccinationDetails(beneficiaryRegID).subscribe((res) => {
      if (res.statusCode == 200) {
        if (res.data.covidVSID) {
          this.covidVaccineDetails=res.data;

          if(res.data.doseTypeID !== undefined && res.data.doseTypeID !== null && res.data.covidVaccineTypeID !== undefined && res.data.covidVaccineTypeID !== null) 
          {
          this.covidVaccineDetails.doseTypeID = doseTypeList.filter(item => {
            return item.covidDoseTypeID === res.data.doseTypeID;
          });
          this.covidVaccineDetails.covidVaccineTypeID = vaccineTypeList.filter(item => {
            return item.covidVaccineTypeID === res.data.covidVaccineTypeID;
          });
        }

        }
       
      }
      
    }, err => {
     console.log("error",err.errorMessage);
    });
   
  }

  getAssessmentID() {
    let benRegID = localStorage.getItem('caseSheetBeneficiaryRegID');
    this.doctorService.getAssessment(benRegID).subscribe(res => {
      if (res.statusCode === 200 && res.data !== null) {
        const lastElementIndex = res.data.length - 1;
        const lastElementData = res.data[lastElementIndex];
        let assessmentId = lastElementData.assessmentId;
        if(assessmentId !== null && assessmentId !== undefined) {
          this.getAssessmentDetails(assessmentId);
        }
      }
    })
  }

  getAssessmentDetails(assessmentId) {
    this.doctorService.getAssessmentDet(assessmentId).subscribe(res => {
      if (res.statusCode === 200 && res.data !== null) {
        this.severity = res.data.severity;
        this.cough_pattern = res.data.cough_pattern;
        this.cough_severity_score = res.data.cough_severity_score;
        this.record_duration = res.data.record_duration;
        this.nurseService.setEnableLAssessment(false);
        this.enableResult = true;
      }
    })
  }

}

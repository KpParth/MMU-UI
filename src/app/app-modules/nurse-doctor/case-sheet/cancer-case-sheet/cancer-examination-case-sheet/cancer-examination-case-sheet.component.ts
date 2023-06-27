import { Component, OnInit, Input } from '@angular/core';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { DoctorService } from "app/app-modules/nurse-doctor/shared/services";
import * as moment from 'moment';
@Component({
  selector: 'cancer-examination-case-sheet',
  templateUrl: './cancer-examination-case-sheet.component.html',
  styleUrls: ['./cancer-examination-case-sheet.component.css']
})
export class CancerExaminationCaseSheetComponent implements OnInit {

  @Input('data')
  casesheetData: any;
  @Input('previous')
  previous:any;
  gynecologicalImageUrl = 'assets/images/gynecologicalExamination.png';
  breastImageUrl = 'assets/images/breastExamination.png';
  abdominalImageUrl = 'assets/images/abdominalExamination.png';
  oralImageUrl = 'assets/images/oralExamination.png';
  date: any;
  signsAndSymptoms: any;
  BenCancerLymphNodeDetails: any;
  oralExamination: any;
  breastExamination: any;
  abdominalExamination: any;
  gynecologicalExamination: any;
  imageAnnotatedData: any;
  beneficiaryDetails: any;
  diagnosisdetails: any;

  blankRows = [1, 2, 3, 4]
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(public httpServiceService: HttpServiceService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
  }

  ngOnChanges() {
    if (this.casesheetData) {
      if (this.casesheetData.BeneficiaryData)
        this.beneficiaryDetails = this.casesheetData.BeneficiaryData;

      this.signsAndSymptoms = this.casesheetData.nurseData.signsAndSymptoms;
      this.BenCancerLymphNodeDetails = this.casesheetData.nurseData.BenCancerLymphNodeDetails;
      this.oralExamination = this.casesheetData.nurseData.oralExamination;
      this.breastExamination = this.casesheetData.nurseData.breastExamination;
      this.abdominalExamination = this.casesheetData.nurseData.abdominalExamination;
      this.gynecologicalExamination = this.casesheetData.nurseData.gynecologicalExamination;
      this.imageAnnotatedData = this.casesheetData.ImageAnnotatedData;
    }
    let t = new Date();
    this.date = t.getDate() + "/" + (t.getMonth() + 1) + "/" + t.getFullYear();  
  if(this.casesheetData && this.casesheetData.doctorData !=undefined && this.casesheetData.doctorData.diagnosis !=undefined)
  {
    this.diagnosisdetails = this.casesheetData.doctorData.diagnosis;
    if(this.casesheetData.doctorData !=undefined && this.casesheetData.doctorData.diagnosis !=undefined && this.casesheetData.doctorData.diagnosis.revisitDate !=undefined && !(moment(this.casesheetData.doctorData.diagnosis.revisitDate, 'DD/MM/YYYY',true).isValid()))
    {
    
      let sDate = new Date(this.diagnosisdetails.revisitDate);
        this.diagnosisdetails.revisitDate = [
          this.padLeft.apply(sDate.getDate()),
          this.padLeft.apply((sDate.getMonth() + 1)),
          this.padLeft.apply(sDate.getFullYear())].join('/');
    }
  }
  }
  padLeft() {
    let len = (String(10).length - String(this).length) + 1;
    return len > 0 ? new Array(len).join('0') + this : this;
  }
  // ngDoCheck() {
  //   this.assignSelectedLanguage();
  // }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.currentLanguageSet = getLanguageJson.currentLanguageObject;
    }
  getImageAnnotation(imageID) {
    let arr = this.imageAnnotatedData.filter(item => item.imageID == imageID);
    return arr.length > 0 ? arr[0] : null;
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

}
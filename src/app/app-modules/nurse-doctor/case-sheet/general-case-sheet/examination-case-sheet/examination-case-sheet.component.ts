import { Component, OnInit, Input } from '@angular/core';
import { DoctorService } from "app/app-modules/nurse-doctor/shared/services";
import { DatePipe } from '@angular/common'
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-examination-case-sheet',
  templateUrl: './examination-case-sheet.component.html',
  styleUrls: ['./examination-case-sheet.component.css'],
  providers: [ DatePipe ] 
})
export class ExaminationCaseSheetComponent implements OnInit {

  @Input('previous')
  previous:any;
  
  @Input('data')
  casesheetData: any;

  visitCategory: any;
  beneficiaryRegID: any;
  visitID: any;
  generalExamination: any;
  headToToeExamination: any;
  gastroIntestinalExamination: any;
  cardioVascularExamination: any;
  respiratorySystemExamination: any;
  centralNervousSystemExamination: any;
  musculoskeletalSystemExamination: any;
  genitoUrinarySystemExamination: any;
  obstetricExamination: any;
  revisitDate: any;
  referDetails: any;
  date: any;
  serviceList: String = "";
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  

  constructor(private doctorService: DoctorService,
    private httpServiceService: HttpServiceService,
    public datepipe: DatePipe) { }

  ngOnInit() { 
    this.fetchLanguageResponse();
    this.visitCategory = localStorage.getItem("caseSheetVisitCategory");
    this.beneficiaryRegID = localStorage.getItem('beneficiaryRegID');
    this.visitID = localStorage.getItem('visitID');
  }
   

  ngOnChanges() {
    if (this.casesheetData && this.casesheetData.nurseData && this.casesheetData.nurseData.examination) {
      let examination = this.casesheetData.nurseData.examination;

      if (examination.generalExamination)
        this.generalExamination = examination.generalExamination;

      if (examination.headToToeExamination)
        this.headToToeExamination = examination.headToToeExamination;

      if (examination.cardiovascularExamination)
        this.cardioVascularExamination = examination.cardiovascularExamination;

      if (examination.respiratoryExamination)
        this.respiratorySystemExamination = examination.respiratoryExamination;

      if (examination.centralNervousExamination)
        this.centralNervousSystemExamination = examination.centralNervousExamination;

      if (examination.musculoskeletalExamination)
        this.musculoskeletalSystemExamination = examination.musculoskeletalExamination;

      if (examination.genitourinaryExamination)
        this.genitoUrinarySystemExamination = examination.genitourinaryExamination;

      if (examination.obstetricExamination)
        this.obstetricExamination = examination.obstetricExamination;

      if (examination.gastrointestinalExamination)
        this.gastroIntestinalExamination = examination.gastrointestinalExamination;
    }
    // let t = new Date();
    // this.date = t.getDate() + "/" + (t.getMonth() + 1) + "/" + t.getFullYear();
    if (this.casesheetData && this.casesheetData.doctorData) {
      this.referDetails = this.casesheetData.doctorData.Refer;
      console.log("refer", this.referDetails);     
      if (this.referDetails && this.referDetails.refrredToAdditionalServiceList) {
        console.log(
          "institute",
          this.referDetails.refrredToAdditionalServiceList
        );
        for (
          let i = 0;
          i < this.referDetails.refrredToAdditionalServiceList.length;
          i++
        ) {
          if (this.referDetails.refrredToAdditionalServiceList[i].serviceName) {
            this.serviceList += this.referDetails.refrredToAdditionalServiceList[
              i
            ].serviceName;
            if (
              i >= 0 &&
              i < this.referDetails.refrredToAdditionalServiceList.length - 1
            )
              this.serviceList += ",";
          }
        }
      }
      console.log(
        "referDetailsForReferexamination",
        JSON.stringify(this.casesheetData, null, 4)
      );
      // if (this.casesheetData.doctorData.Refer) {
      //   this.referDetails.revisitDate = this.datepipe.transform(this.referDetails.revisitDate, 'dd/MM/yyyy')       
      // }
    }
// padLeft() {
//   let len = (String(10).length - String(this).length) + 1;
//   return len > 0 ? new Array(len).join('0') + this : this;
// }

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

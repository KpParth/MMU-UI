import { Component, OnInit, Input, OnChanges, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'nurse-examination',
  templateUrl: './examination.component.html',
  styleUrls: ['./examination.component.css']
})
export class ExaminationComponent implements OnInit,DoCheck {

  @Input('visitCategory')
  visitCategory: string;

  @Input('patientExaminationForm')
  patientExaminationForm: FormGroup;

  @Input('examinationMode')
  examinationMode: String;

  showGeneralOPD = false;
  showCancer = false;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(private httpServiceService: HttpServiceService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
  }

  ngOnChanges() {
    if (this.visitCategory) {
      this.showGeneralOPD = this.visitCategory == 'General OPD' || this.visitCategory == 'ANC' || this.visitCategory == 'PNC' ? true : false;
      this.showCancer = this.visitCategory == 'Cancer Screening' ? true : false;
    }
  }


  //BU40088124 12/10/2021 Integrating Multilingual Functionality --Start--
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


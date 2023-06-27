import { Component, OnInit, Input } from '@angular/core';
import { GeneralUtils } from '../../../shared/utility/general-utility';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'nurse-systemic-examination',
  templateUrl: './systemic-examination.component.html',
  styleUrls: ['./systemic-examination.component.css']
})
export class SystemicExaminationComponent implements OnInit {

  generalUtils = new GeneralUtils(this.fb);

  @Input('systemicExaminationForm')
  systemicExaminationForm: FormGroup;

  @Input('visitCategory')
  visitCategory: string;

  displayANC: Boolean;
  displayGeneral: Boolean;
  languageComponent: SetLanguageComponent;
  
  currentLanguageSet: any;

  constructor(private fb: FormBuilder,
    private httpServiceService: HttpServiceService) { }

  ngOnInit() {
    this.displayANC = false;
    this.displayGeneral = false;
    this.fetchLanguageResponse();

    if (this.visitCategory == 'ANC') {
      this.systemicExaminationForm.addControl('obstetricExaminationForANCForm', this.generalUtils.createObstetricExaminationForANCForm());
      this.displayANC = true;
    } else if (this.visitCategory == 'General OPD' || this.visitCategory == 'PNC') {
      this.displayGeneral = true;
    }
  }

  ngOnChanges() {
    this.displayANC = this.visitCategory == 'ANC' ? true : false;
    if (this.displayANC) {
      this.systemicExaminationForm.addControl('obstetricExaminationForANCForm', this.generalUtils.createObstetricExaminationForANCForm());
    } else if (!this.displayANC) {
      this.systemicExaminationForm.removeControl('obstetricExaminationForANCForm');
      if (this.visitCategory == 'General OPD' || this.visitCategory == 'PNC') {
        this.displayGeneral = true;
      }
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

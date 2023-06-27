import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'nurse-vitals',
  templateUrl: './vitals.component.html',
  styleUrls: ['./vitals.component.css']
})
export class VitalsComponent implements OnInit {
  @Input('patientVitalsForm')
  patientVitalsForm: FormGroup;

  @Input('visitCategory')
  visitCategory: string;

  @Input('vitalsMode')
  mode: String;

  @Input('pregnancyStatus')
  pregnancyStatus: string;

  showGeneralOPD = false;
  showCancer = false;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  

  constructor(
    private httpServiceService: HttpServiceService,
    private fb: FormBuilder ) { }

  ngOnInit() {
    this.fetchLanguageResponse();
  }

  ngOnChanges() {
    if (this.visitCategory) {
      this.showCancer = this.visitCategory == 'Cancer Screening' ? true : false;
      this.showGeneralOPD = this.visitCategory != 'Cancer Screening' ? true : false;
    }
  }

   //AN40085822 13/10/2021 Integrating Multilingual Functionality --Start--
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

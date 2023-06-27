import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

import { ConfirmationService } from '../../core/services/confirmation.service';
import { DoctorService } from '../shared/services'
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
@Component({
  selector: 'app-visit-details',
  templateUrl: './visit-details.component.html',
  styleUrls: ['./visit-details.component.css']
})
export class VisitDetailsComponent implements OnInit {

  @Input('patientVisitForm')
  patientVisitForm: FormGroup;

  @Input('mode')
  mode: String;

  visitCategory: any;

  hideAll = false;
  showANCVisit = false;
  showNCDCare = false;
  showPNC = false;
  enableFileSelection = false;
  showCOVID = false;
  showNcdScreeningVisit=false;
  current_language_set: any;
  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private doctorService: DoctorService, private httpServiceService:HttpServiceService) { }

  ngOnInit() {
    this.getVisitCategory();
  }

  ngOnDestroy() {
  }

  getVisitCategory() {
    (<FormGroup>this.patientVisitForm.controls['patientVisitDetailsForm']).controls['visitCategory'].valueChanges
      .subscribe(categoryValue => {
        if (categoryValue) {
          this.visitCategory = categoryValue;
          this.conditionCheck();
        }
      })
  }

  conditionCheck() {
    if (!this.mode)
      this.hideAllTab();
      localStorage.setItem('visiCategoryANC',this.visitCategory);
    if (this.visitCategory == 'NCD screening') {
      this.enableFileSelection = true;
      this.showNcdScreeningVisit = true;
      
    }

    if (this.visitCategory == 'Cancer Screening' || this.visitCategory == 'NCD screening' || this.visitCategory == 'General OPD (QC)') {
      this.hideAll = false;
    } else if (this.visitCategory == 'ANC') {
      this.showANCVisit = true;
    } else if (this.visitCategory == 'NCD care') {
      this.showNCDCare = true;
    } else if (this.visitCategory == 'PNC' || this.visitCategory == 'General OPD') {
      this.showPNC = true;
    }  else if (this.visitCategory == 'COVID-19 Screening') {
      this.showCOVID = true; 
    }else {
      this.hideAll = false;
    }
  }

  hideAllTab() {
    this.hideAll = false;
    this.showANCVisit = false;
    this.showNCDCare = false;
    this.showPNC = false;
    this.showCOVID = false;
    this.showNcdScreeningVisit=false;
  }
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
    }
}

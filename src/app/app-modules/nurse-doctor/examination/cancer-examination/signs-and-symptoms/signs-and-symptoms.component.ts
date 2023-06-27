import { Component, OnInit, Input, OnChanges, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

import { BeneficiaryDetailsService } from '../../../../core/services/beneficiary-details.service';

import { CancerUtils } from '../../../shared/utility'

@Component({
  selector: 'doctor-signs-and-symptoms',
  templateUrl: './signs-and-symptoms.component.html',
  styleUrls: ['./signs-and-symptoms.component.css']
})
export class SignsAndSymptomsComponent implements OnInit,DoCheck {

  @Input('signsForm')
  signsForm: FormGroup;

  female18 = false;
  female30 = false;
  female = false;
  languageComponent: SetLanguageComponent;

  currentLanguageSet: any;

  constructor(
    private fb: FormBuilder,
    private httpServiceService: HttpServiceService,
    private beneficiaryDetailsService: BeneficiaryDetailsService) { }
  // ngDoCheck(): void {
  //   throw new Error('Method not implemented.');
  // }

  ngOnInit() {
    this.getBeneficiaryDetails();
    this.fetchLanguageResponse();
  }

  ngOnDestroy() {
    if (this.beneficiaryDetailsSubs)
      this.beneficiaryDetailsSubs.unsubscribe();
  }

  beneficiaryDetailsSubs: any;
  getBeneficiaryDetails() {
    this.beneficiaryDetailsSubs = this.beneficiaryDetailsService.beneficiaryDetails$
      .subscribe(beneficiaryDetails => {
        if ((beneficiaryDetails && beneficiaryDetails.genderName && (beneficiaryDetails.genderName.toLocaleLowerCase() == 'female' || beneficiaryDetails.genderName.toLocaleLowerCase() == 'transgender')))
          this.female = true;
        else
          this.female = false;

        if (beneficiaryDetails && beneficiaryDetails.genderName && beneficiaryDetails.genderName.toLocaleLowerCase() == 'female' && beneficiaryDetails.ageVal >= 18)
          this.female18 = true;
        else
          this.female18 = false;

        if (beneficiaryDetails && beneficiaryDetails.genderName && beneficiaryDetails.genderName.toLocaleLowerCase() == 'female' && beneficiaryDetails.ageVal >= 30)
          this.female30 = true;
        else
          this.female30 = false;
      })
  }

  checkLymph(lymphNode_Enlarged) {
    if (lymphNode_Enlarged == false) {
      this.signsForm.patchValue({ lymphNodes: new CancerUtils(this.fb).lymphNodesArray.map(item => (item)) })
    }
  }

  get observation() {
    return this.signsForm.get('observation');
  }

  get lymphNode_Enlarged() {
    return this.signsForm.controls['lymphNode_Enlarged'].value;
  }

  get lymphNodes() {
    return this.signsForm.controls['lymphNodes'].value;
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

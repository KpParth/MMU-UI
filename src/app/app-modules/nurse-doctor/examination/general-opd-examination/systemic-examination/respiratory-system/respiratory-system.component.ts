import { Component, OnInit, Input, DoCheck } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'nurse-respiratory-system',
  templateUrl: './respiratory-system.component.html',
  styleUrls: ['./respiratory-system.component.css']
})
export class RespiratorySystemComponent implements OnInit,DoCheck {

  @Input('respiratorySystemForm')
  respiratorySystemForm: FormGroup;

  selectTrachea = [
    {
      name: 'Central',
      id: 1
    },
    {
      name: 'Deviated to Right',
      id: 2
    },
    {
      name: 'Deviated to Left',
      id: 3
    },
  ]

  selectBreathSounds = [
    {
      name: 'Normal',
      id: 1
    },
    {
      name: 'Decreased',
      id: 2
    },
    {
      name: 'Abnormal Breath Sounds',
      id: 3
    },
  ]

  selectPercussion = [
    {
      name: 'Dull',
      id: 1
    },
    {
      name: 'Stony Dull',
      id: 2
    },
    {
      name: 'Resonant',
      id: 3
    },
    {
      name: 'Hyper Resonant',
      id: 4
    },
  ]
  languageComponent: SetLanguageComponent;
  
  currentLanguageSet: any;

  constructor(private fb: FormBuilder,
    private httpServiceService: HttpServiceService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
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

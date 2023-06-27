import { Component, OnInit, Input, DoCheck } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'nurse-gastro-intestinal-system',
  templateUrl: './gastro-intestinal-system.component.html',
  styleUrls: ['./gastro-intestinal-system.component.css']
})
export class GastroIntestinalSystemComponent implements OnInit,DoCheck {

  @Input('gastroIntestinalSystemForm')
  gastroIntestinalSystemForm: FormGroup;



  selectAbdomenTexture = [
    {
      name: 'Soft',
      id: 1
    },
    {
      name: 'Firm',
      id: 2
    },
    {
      name: 'Tense',
      id: 3
    },
    {
      name: 'Rigid',
      id: 4
    }
  ];

  selectLiver =
  [
    {
      name: 'Not Palpable',
      id: 1
    },
    {
      name: 'Just Palpable',
      id: 2
    },
    {
      name: 'Enlarged',
      id: 3
    },
  ]
  selectSpleen =
  [
    {
      name: 'Not Palpable',
      id: 1
    },
    {
      name: 'Just Palpable',
      id: 2
    },
    {
      name: 'Enlarged',
      id: 3
    },
  ]
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  

  constructor(private fb: FormBuilder,
    private httpServiceService: HttpServiceService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
  }

  checkWithTenderness() {
    this.gastroIntestinalSystemForm.patchValue({ palpation_LocationOfTenderness: null })
  }

  get palpation_Tenderness() {
    return this.gastroIntestinalSystemForm.controls['palpation_Tenderness'].value;
  }

  get palpation_LocationOfTenderness() {
    return this.gastroIntestinalSystemForm.controls['palpation_LocationOfTenderness'].value;
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

import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'nurse-central-nervous-system',
  templateUrl: './central-nervous-system.component.html',
  styleUrls: ['./central-nervous-system.component.css']
})
export class CentralNervousSystemComponent implements OnInit {
  
  @Input('centralNervousSystemForm')
  centralNervousSystemForm: FormGroup;

  selectHandedness = [
    {
      name: 'No',
      id: 1
    },
    {
      name: 'Right Handed',
      id: 2
    },
    {
      name: 'Left Handed',
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

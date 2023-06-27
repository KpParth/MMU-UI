import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'nurse-cardio-vascular-system',
  templateUrl: './cardio-vascular-system.component.html',
  styleUrls: ['./cardio-vascular-system.component.css']
})
export class CardioVascularSystemComponent implements OnInit {
  
  @Input('cardioVascularSystemForm')
  cardioVascularSystemForm: FormGroup;
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

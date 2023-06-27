import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
@Component({
  selector: 'nurse-anc-obstetric-examination',
  templateUrl: './obstetric-examination.component.html',
  styleUrls: ['./obstetric-examination.component.css']
})
export class ObstetricExaminationComponent implements OnInit {

  @Input('obstetricExaminationForANCForm')
  obstetricExaminationForANCForm: FormGroup;

  selectFundalHeight =
    [
      {
        name: 'Not Palpable',
        id: 1
      },
      {
        name: '12th Week',
        id: 2
      },
      {
        name: '16th Week',
        id: 3
      },
      {
        name: '20th Week',
        id: 4
      },
      {
        name: '24th Week',
        id: 5
      },
      {
        name: '28th Week',
        id: 6
      },
      {
        name: '32th Week',
        id: 7
      },
      {
        name: '36th Week',
        id: 8
      },
      {
        name: '40th Week',
        id: 9
      },
    ]

  selectFHPOAStatus =
    [
      {
        name: 'FH=POA',
        id: 1
      },
      {
        name: 'FH>POA',
        id: 2
      },
      {
        name: 'FH<POA',
        id: 3
      },
    ]

  selectInterpretationFHAndPOA =
    [
      {
        name: 'Corresponding',
        id: 1
      },
      {
        name: 'Not Corresponding',
        id: 2
      }
    ]

  selectFetalHeartRate =
    [
      {
        name: '<120',
        id: 1
      },
      {
        name: '120-160',
        id: 2
      },
      {
        name: '>160',
        id: 3
      },
    ]

  selectFetalPositionOrLie =
    [
      {
        name: 'Longitudinal',
        id: 1
      },
      {
        name: 'Oblique',
        id: 2
      },
      {
        name: 'Transverse',
        id: 3
      },
    ]

  selectFetalPresentation =
    [
      {
        name: 'Cepahlic',
        id: 1
      },
      {
        name: 'Breech',
        id: 2
      },
      {
        name: 'Face',
        id: 3
      },
      {
        name: 'Shoulder',
        id: 4
      },
    ]

  selectAbdominalScars =
    [
      {
        name: 'Absent',
        id: 1
      },
      {
        name: 'LSCS Scar',
        id: 2
      },
      {
        name: 'Other Surgical Scars',
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

  resetFetalHeartRate(event) {
    if(event.value == "Not Audible")
    this.obstetricExaminationForANCForm.patchValue({fetalHeartRate_BeatsPerMinute: null});
  }

  get fetalHeartSounds() {
    return this.obstetricExaminationForANCForm.controls['fetalHeartSounds'].value;
  }

  get SFH() {
    console.log("sfh");
    return this.obstetricExaminationForANCForm.controls['sfh'].value;
  }

  /** -- Neeraj 26 dec, build error was there, so added this line  */
  getPreviousPastHistory() { }


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
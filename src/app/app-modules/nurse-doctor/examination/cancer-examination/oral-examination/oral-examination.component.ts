import { Component, OnInit, Input, OnChanges, ViewChild, ElementRef, EventEmitter, Output, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { CameraService } from '../../../../core/services/camera.service';


@Component({
  selector: 'cancer-oral-examination',
  templateUrl: './oral-examination.component.html',
  styleUrls: ['./oral-examination.component.css']
})
export class OralExaminationComponent implements OnInit,DoCheck {

  @Input('oralExaminationForm')
  oralExaminationForm: FormGroup;
  
  @ViewChild('mouthImage')
  private oralImage: ElementRef;
  
  showOther = false;
  imagePoints: any;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  

  constructor(
    private fb: FormBuilder,
    private httpServiceService: HttpServiceService,
    private cameraService: CameraService) { }

  ngOnInit() { 
    this.oralExaminationForm.get('preMalignantLesionTypeList')
    .valueChanges.subscribe((value: [string]) => {
      if (value != null) {
        if (value.indexOf('Any other lesion') >= 0) {
          this.showOther = true;
          this.fetchLanguageResponse();
        }
        else {
          this.showOther = false;
          this.oralExaminationForm.patchValue({ otherLesionType: null })
        }
      } else {
        this.oralExaminationForm.patchValue({ otherLesionType: null })
      }
    });
  }

  ngOnChanges() {
  }

  checkWithPremalignantLesion() {
    this.oralExaminationForm.patchValue({ preMalignantLesionTypeList: null })
  }

  get premalignantLesions() {
    return this.oralExaminationForm.get('premalignantLesions');
  }

  get preMalignantLesionType() {
    return this.oralExaminationForm.get('preMalignantLesionType');
  }

  get observation() {
    return this.oralExaminationForm.get('observation');
  }

  annotateImage() {
    this.cameraService.annotate(this.oralImage.nativeElement.attributes.src.nodeValue, this.oralExaminationForm.controls['image'].value
    ,this.currentLanguageSet)
      .subscribe(result => {
        if (result) {
          this.imagePoints = result;
          this.imagePoints.imageID = 3;
          this.oralExaminationForm.patchValue({ image: this.imagePoints });
          this.oralExaminationForm.markAsDirty();
        }
      })
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

import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, DoCheck } from '@angular/core';
import { CameraService } from '../../../../core/services/camera.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'doctor-abdominal-examination',
  templateUrl: './abdominal-examination.component.html',
  styleUrls: ['./abdominal-examination.component.css']
})
export class AbdominalExaminationComponent implements OnInit ,DoCheck{

  @Input('abdominalExaminationForm')
  abdominalExaminationForm: FormGroup;

  @ViewChild('abdominalImage')
  private abdominalImage: ElementRef;

  imagePoints: any;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  

  constructor(
    private fb: FormBuilder,
    private httpServiceService: HttpServiceService,
    private cameraService: CameraService) { }

  ngOnInit() {
    this.fetchLanguageResponse();
  }

  checkWithLymphNodes() {
    this.abdominalExaminationForm.patchValue({ lymphNode_Inguinal_Left: null });
    this.abdominalExaminationForm.patchValue({ lymphNode_Inguinal_Right: null });
    this.abdominalExaminationForm.patchValue({ lymphNode_ExternalIliac_Left: null });
    this.abdominalExaminationForm.patchValue({ lymphNode_ExternalIliac_Right: null });
    this.abdominalExaminationForm.patchValue({ lymphNode_ParaAortic_Left: null });
    this.abdominalExaminationForm.patchValue({ lymphNode_ParaAortic_Right: null });
  }

  get lymphNodes_Enlarged() {
    return this.abdominalExaminationForm.get('lymphNodes_Enlarged');
  }

  get observation() {
    return this.abdominalExaminationForm.get('observation');
  }

  annotateImage() {
    this.cameraService.annotate(this.abdominalImage.nativeElement.attributes.src.nodeValue, this.abdominalExaminationForm.controls['image'].value,this.currentLanguageSet)
      .subscribe(result => {
        if (result) {
          this.imagePoints = result;
          this.imagePoints.imageID = 1;
          this.abdominalExaminationForm.patchValue({ image: this.imagePoints });
          this.abdominalExaminationForm.markAsDirty();
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

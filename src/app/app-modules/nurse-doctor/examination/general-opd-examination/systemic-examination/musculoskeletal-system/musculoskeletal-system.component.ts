import { Component, OnInit, Input } from '@angular/core';
import { MasterdataService } from '../../../../shared/services';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'nurse-musculoskeletal-system',
  templateUrl: './musculoskeletal-system.component.html',
  styleUrls: ['./musculoskeletal-system.component.css']
})
export class MusculoskeletalSystemComponent implements OnInit {

  @Input('musculoSkeletalSystemForm')
  musculoSkeletalSystemForm: FormGroup;

  selectTypeOfJoint = [];

  selectJointLaterality = [
    {
      name: 'Left',
      id: 1
    },
    {
      name: 'Right',
      id: 2
    },
    {
      name: 'Bilateral',
      id: 3
    }
  ]

  selectJointAbnormality = [
    {
      name: 'Swelling',
      id: 1
    },
    {
      name: 'Tenderness',
      id: 2
    },
    {
      name: 'Deformity',
      id: 3
    },
    {
      name: 'Restriction',
      id: 4
    }
  ]

  selectUpperLimbsLaterality = [
    {
      name: 'Left',
      id: 1
    },
    {
      name: 'Right',
      id: 2
    },
    {
      name: 'Bilateral',
      id: 3
    }
  ]

  selectUpperLimbsAbnormality = [
    {
      name: 'Swelling',
      id: 1
    },
    {
      name: 'Tenderness',
      id: 2
    },
    {
      name: 'Deformity',
      id: 3
    },
    {
      name: 'Restriction',
      id: 4
    }
  ]

  selectLowerLimbsLaterality =
  [
    {
      name: 'Left',
      id: 1
    },
    {
      name: 'Right',
      id: 2
    },
    {
      name: 'Bilateral',
      id: 3
    }
  ]

  selectLowerLimbsAbnormality = [
    {
      name: 'Swelling',
      id: 1
    },
    {
      name: 'Tenderness',
      id: 2
    },
    {
      name: 'Deformity',
      id: 3
    },
    {
      name: 'Restriction',
      id: 4
    }
  ]
  languageComponent: SetLanguageComponent;
  
  currentLanguageSet: any;

  constructor(
    private fb: FormBuilder,
    private httpServiceService: HttpServiceService,
    private masterdataService: MasterdataService ) { }

  ngOnInit() {
    this.getMasterData();
    this.fetchLanguageResponse();
  }

  ngOnDestroy() {
    if(this.nurseMasterDataSubscription)
      this.nurseMasterDataSubscription.unsubscribe();
  }

  nurseMasterDataSubscription: any;
  getMasterData() {
    this.nurseMasterDataSubscription = this.masterdataService.nurseMasterData$.subscribe(masterData => {
      if (masterData)
      this.selectTypeOfJoint = masterData.jointTypes;
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

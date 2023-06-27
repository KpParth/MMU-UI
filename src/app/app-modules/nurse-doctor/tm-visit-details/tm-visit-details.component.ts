import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { DoctorService, MasterdataService } from '../shared/services';

@Component({
  selector: 'app-tm-visit-details',
  templateUrl: './tm-visit-details.component.html',
  styleUrls: ['./tm-visit-details.component.css']
})
export class TmVisitDetailsComponent implements OnInit {

  @Input('patientVisitForm')
  patientVisitForm: FormGroup;

  @Input('mode')
  mode: String;
  visitCategory: any;
  hideAll = false;
  beneficiaryData:any;
  visitDetailsPregSubscription: any;
  currentLanguageSet: any;
  constructor( private masterdataService: MasterdataService,private doctorService: DoctorService,
    private router: Router,
    private httpServices: HttpServiceService
    ) { }

  ngOnInit() {
    this.assignSelectedLanguage();
   // this.getVisitCategory();
   this.visitCategory = localStorage.getItem('visitCategory');
    this.getVisitDetails();
    this.getPregnancyStatus();
 
    if ((localStorage.getItem('selectTMC') == "true")) { 
      this.patientVisitForm.controls["tmcConfirmationForm"].patchValue({tmcConfirmed: true});
      localStorage.removeItem('selectTMC');
    }
   
  }
   /*
   * JA354063 - Multilingual Changes added on 13/10/21
   */
   ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServices);
    getLanguageJson.setLanguage();
    this.currentLanguageSet = getLanguageJson.currentLanguageObject;
  }
  // Ends
  ngOnDestroy(){
    let currentURL = this.router.url;
    if (currentURL == "/common/print/MMU/current") { 
      localStorage.setItem('selectTMC',"true");
      // this.patientVisitForm.controls["tmcConfirmationForm"].patchValue({tmcConfirmed:true});
    }
    else {
      localStorage.removeItem('specialist_flag');
      localStorage.removeItem('beneficiaryData');
      if (this.visitDetailsPregSubscription)
      this.visitDetailsPregSubscription.unsubscribe();
      this.doctorService.prescribedDrugData = null;
    }    

  }
     
  // getVisitCategory() {
  //   (<FormGroup>this.patientVisitForm.controls['patientVisitDetailsForm']).controls['visitCategory'].valueChanges
  //     .subscribe(categoryValue => {
  //       if (categoryValue) {
  //         this.visitCategory = categoryValue;
  //         // this.conditionCheck();         
  //       }
  //     });
  // }

  getVisitDetails() {   
    this.beneficiaryData = JSON.parse(localStorage.getItem("beneficiaryData"))
    if (this.beneficiaryData) {
      let visitDetails = this.beneficiaryData;
      visitDetails.visitCode = visitDetails.visitCode;
      this.patientVisitForm.controls["patientVisitDetailsForm"].patchValue({visitCategory:visitDetails.VisitCategory,visitReason:visitDetails.VisitReason});
      
    }
  }    

  getPregnancyStatus() {
    let visitID = localStorage.getItem('visitID');
    let benRegID = localStorage.getItem('beneficiaryRegID')
    this.visitDetailsPregSubscription=this.doctorService.getPregVisitComplaintDetails(benRegID, visitID, this.beneficiaryData.VisitCategory)
    .subscribe(value => {
      if (value != null && value.statusCode == 200 && value.data != null) {
    
          let visitDetails = value.data.NCDScreeningNurseVisitDetail;
          visitDetails.visitCode = visitDetails.visitCode;
          // this.doctorService.fileIDs = value.data.NCDScreeningNurseVisitDetail.files;
          this.patientVisitForm.controls["patientVisitDetailsForm"].patchValue(visitDetails);
        }
       
     
     
      
    })
  }

  conditionCheck() {
    if (!this.mode)
      this.hideAllTab();
    localStorage.setItem('visiCategoryANC', this.visitCategory);
    if (this.visitCategory == 'NCD screening') {

    }
    else {
      this.hideAll = false;
    }
  }
  hideAllTab() {
    this.hideAll = false;
  }
}


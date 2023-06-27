import { Component, OnInit, OnDestroy, Input, OnChanges, ViewEncapsulation, ViewChild, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, NgForm } from '@angular/forms';
import { Params, RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { DoctorService, MasterdataService, NurseService } from '../shared/services';
import { MdDialog, PageEvent } from '@angular/material';
import { QuickConsultUtils } from '../shared/utility';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { IotcomponentComponent } from 'app/app-modules/core/components/iotcomponent/iotcomponent.component';
import { environment } from 'environments/environment';
import { TestInVitalsService } from '../shared/services/test-in-vitals.service';

interface prescribe {
  id: string;
  drugID: string;
  drugName: string;
  drugStrength: String;
  drugUnit: string;
  quantity: string;
  formID: string;
  qtyPrescribed: string;
  route: string;
  formName: string;
  dose: string;
  frequency: string;
  duration: string;
  unit: string;
  instructions: string;
  sctCode: string;
  sctTerm: string;
}
@Component({
  selector: 'doctor-quick-consult',
  templateUrl: './quick-consult.component.html',
  styleUrls: ['./quick-consult.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class QuickConsultComponent implements OnInit, OnDestroy, OnChanges, DoCheck {

  utils = new QuickConsultUtils(this.fb);

  @ViewChild('prescriptionForm')
  prescriptionForm: NgForm;

  @Input('patientQuickConsultForm')
  patientQuickConsultForm: FormGroup;

  @Input('quickConsultMode')
  quickConsultMode: string;

  drugPrescriptionForm: FormGroup;
  createdBy: string;
  startRBSTest= environment.startRBSurl;
  pageSize = 5;
  pageEvent: PageEvent;
  pageLimits = [];
  rbsPopup: boolean=false;
  currentPrescription: prescribe = {
    id: null,
    drugID: null,
    drugName: null,
    drugStrength: null,
    drugUnit: null,
    qtyPrescribed: null,
    quantity: null,
    route: null,
    formID: null,
    formName: null,
    dose: null,
    frequency: null,
    duration: null,
    unit: null,
    instructions: null,
    sctCode: null,
    sctTerm: null
  };

  tempDrugName: any;
  tempform: any;



  masterData: any;

  chiefComplaintMaster: any;
  chiefComplaintTemporarayList = [];
  selectedChiefComplaintList = [];
  suggestedChiefComplaintList = [];

  benChiefComplaints = [];

  filteredDrugMaster = [];
  filteredDrugDoseMaster = [];
  subFilteredDrugMaster = [];
  drugMaster: any;
  drugFormMaster: any;
  drugDoseMaster: any;
  drugFrequencyMaster: any;
  drugDurationMaster = [];
  drugRouteMaster: any;
  drugDurationUnitMaster: any;

  nonRadiologyMaster: any;
  radiologyMaster: any;
  previousLabTestList: any;
  previousChiefComplaints: any;

  medicines: Array<any> = [];
  prescribedDrugsList: any;
  edlMaster: any;
  isStockAvalable: string;
  currentLanguageSet: any;
  rbsSelectedInInvestigation: boolean;
  rbsSelectedInInvestigationSubscription: any;
  rbsTestResultCurrent: any;
  rbsTestResultCurrentSubscription: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private masterdataService: MasterdataService,
    private confirmationService: ConfirmationService,
    private httpServices: HttpServiceService,
    private nurseService:NurseService,
    private dialog:MdDialog,
    private testInVitalsService: TestInVitalsService
  ) { }

  ngOnInit() {
    this.rbsPopup = false;
    this.nurseService.clearRbsSelectedInInvestigation();
    this.nurseService.clearRbsInVitals();
    this.assignSelectedLanguage();
    this.createdBy = localStorage.getItem('userName');
    this.getPrescriptionForm();
    this.setLimits();
    this.makeDurationMaster();
    this.loadMasterData();
    this.rbsSelectedInInvestigationSubscription= this.nurseService.rbsSelectedInInvestigation$.subscribe(response => (response == undefined ? this.rbsSelectedInInvestigation = false : this.rbsSelectedInInvestigation = response));
    this.rbsTestResultCurrentSubscription=this.nurseService.rbsTestResultCurrent$.subscribe(response => (response == undefined ? this.rbsTestResultCurrent = null : this.rbsTestResultCurrent = response));
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
  ngOnChanges() {
    this.nurseService.rbsTestResultFromDoctorFetch=null;
  }
  openIOTRBSModel() {
    this.rbsPopup=true;
    let dialogRef = this.dialog.open(IotcomponentComponent, {
      "width": "600px",
      "height": "180px",
      "disableClose": true,
      data: { "startAPI": this.startRBSTest }

    });
    dialogRef.afterClosed().subscribe(result => {
      this.rbsPopup=false;
      if (result != null) {
        this.patientQuickConsultForm.patchValue({
          'rbsTestResult': result['result']
        })
        this.patientQuickConsultForm.controls["rbsTestResult"].markAsDirty();
        if (this.patientQuickConsultForm.controls['rbsTestResult'].value && 
        this.patientQuickConsultForm.controls['rbsTestResult'].value != null ) {
        this.nurseService.setRbsInCurrentVitals(this.patientQuickConsultForm.controls['rbsTestResult'].value);
       
      }

    
        this.setRBSResultInReport();
      
    }
    });
  }

  setRBSResultInReport() {

    if(this.patientQuickConsultForm.value)
    {
      let todayDate = new Date();
      
      let patientQCVitalsDataForReport = Object.assign({}, this.patientQuickConsultForm.getRawValue(), {
        createdDate: todayDate
      });

      this.testInVitalsService.setVitalsRBSValueInReportsInUpdate(patientQCVitalsDataForReport);
    }
  }

  ngOnDestroy() {
    if (this.masterDataSubscription) {
      this.masterDataSubscription.unsubscribe();
    }
    if (this.getQuickConsultSubscription) {
      this.getQuickConsultSubscription.unsubscribe();
    }
    if (this.rbsSelectedInInvestigationSubscription) {
    this.rbsSelectedInInvestigationSubscription.unsubscribe();
    }
    if (this.rbsTestResultCurrentSubscription) {
     this.rbsTestResultCurrentSubscription.unsubscribe();
    }
    this.nurseService.rbsTestResultFromDoctorFetch=null;
  }

  getPrescriptionForm() {
    this.drugPrescriptionForm = <FormGroup>this.patientQuickConsultForm.controls['prescription'];
  }



  addDiagnosis() {
    let diagnosisListForm = this.patientQuickConsultForm.controls['provisionalDiagnosisList'] as FormArray;
    if (diagnosisListForm.length < 30) {
      diagnosisListForm.push(this.utils.initProvisionalDiagnosisList());
    }
    else {
      this.confirmationService.alert(this.currentLanguageSet.alerts.info.maxDiagnosis);
    }
  }


  deleteDiagnosis(index, diagnosisList?: FormArray) {
    let diagnosisListForm = this.patientQuickConsultForm.controls['provisionalDiagnosisList'] as FormArray;
    if (!diagnosisListForm.at(index).invalid) {
      this.confirmationService.confirm(`warn`, this.currentLanguageSet.alerts.info.warn).subscribe(result => {
        if (result) {
          if (diagnosisListForm.length > 1) {
            diagnosisListForm.removeAt(index);
          }
          else {
            diagnosisListForm.removeAt(index);
            diagnosisListForm.push(this.utils.initProvisionalDiagnosisList());
          }
        }
      });
    } else {
      if (diagnosisListForm.length > 1) {
        diagnosisListForm.removeAt(index);
      }
      else {
        diagnosisListForm.removeAt(index);
        diagnosisListForm.push(this.utils.initProvisionalDiagnosisList());
      }
    }
  }


  makeDurationMaster() {
    let i = 1;
    while (i <= 29) {
      this.drugDurationMaster.push(i);
      i++;
    }
  }

  displayFn(option): string | undefined {
    return option ? `${option.itemName} ${option.strength}${option.unitOfMeasurement?option.unitOfMeasurement:''}${option.quantityInHand?'('+ option.quantityInHand+')':''}` : undefined;
  }

  getFormValueChanged() {
    this.clearCurrentDetails();
    this.getFormDetails();
  }
  getFormDetails() {
    this.currentPrescription['formID'] = this.tempform.itemFormID;
    this.currentPrescription['formName'] = this.tempform.itemFormName;
    this.filterDrugMaster();
    this.filterDoseMaster();
  }

  filterDrugMaster() {
    const drugMasterCopy = Object.assign([], this.drugMaster);
    this.filteredDrugMaster = [];
    drugMasterCopy.forEach(element => {
      if (this.currentPrescription.formID === element.itemFormID) {
        element["isEDL"] = true;
        this.filteredDrugMaster.push(element);
      }
    })
    const drugMasterCopyEdl = Object.assign([], this.edlMaster);    
    drugMasterCopyEdl.forEach(element => {
      if (this.currentPrescription.formID === element.itemFormID) {
        element["quantityInHand"] = 0;
        this.filteredDrugMaster.push(element);
      }
    })
    this.subFilteredDrugMaster = this.filteredDrugMaster;
  }

  filterDoseMaster() {
    const drugDoseMasterCopy = Object.assign([], this.drugDoseMaster);
    this.filteredDrugDoseMaster = [];
    drugDoseMasterCopy.forEach(element => {
      if (this.currentPrescription.formID === element.itemFormID) {
        this.filteredDrugDoseMaster.push(element);
      }
    });

  }


  filterMedicine(medicine) {

    if (medicine) {
      this.subFilteredDrugMaster = this.filteredDrugMaster.filter(drug => {
        return drug.itemName.toLowerCase().startsWith(medicine.toLowerCase());
      })
    } else {
      this.subFilteredDrugMaster = this.filteredDrugMaster;
    }
  }

  reEnterMedicine() {
    if (this.tempDrugName && this.currentPrescription.drugID) {
      this.tempDrugName = {
        id: this.currentPrescription.id,
        itemName: this.currentPrescription.drugName,
        itemID: this.currentPrescription.drugID,
        quantityInHand: this.currentPrescription.quantity,
        strength: this.currentPrescription.drugStrength,
        unitOfMeasurement: this.currentPrescription.drugUnit,
        sctCode: this.currentPrescription.sctCode,
        sctTerm: this.currentPrescription.sctTerm,
      }
    } else if (this.tempDrugName && !this.currentPrescription.drugID) {
      this.tempDrugName = null;
    } else {
      this.clearCurrentDetails();
      this.getFormDetails();
    }
  }

  checkNotIssued(itemID) {
    const medicineValue = this.drugPrescriptionForm.controls['prescribedDrugs'].value;
    const filteredExisting = medicineValue.filter(meds => meds.drugID === itemID);
    if (filteredExisting.length > 0) {
      this.reEnterMedicine();
      this.confirmationService.alert(this.currentLanguageSet.alerts.info.medicinePrescribe, 'info');
      return false;
    } else {
      return true;
    }
  }

  selectMedicineObject(event) {
    const option = event.source.value;
    if (event.isUserInput) {
      if (this.checkNotIssued(option.itemID)) {

        this.currentPrescription['id'] = option.id;
        this.currentPrescription['drugName'] = option.itemName;
        this.currentPrescription['drugID'] = option.itemID;
        this.currentPrescription['quantity'] = option.quantityInHand;
        this.currentPrescription['drugStrength'] = option.strength;
        this.currentPrescription['drugUnit'] = option.unitOfMeasurement;
        this.currentPrescription['sctCode'] = option.sctCode;
        this.currentPrescription['sctTerm'] = option.sctTerm;
        this.currentPrescription['isEDL'] = option.isEDL;
        const typeOfDrug = option.isEDL ? '' : this.currentLanguageSet.nonEDLMedicine
        if (option.quantityInHand == 0) {
          this.confirmationService.confirm('info ' + typeOfDrug, this.currentLanguageSet.stockNotAvailableWouldYouPrescribe + option.itemName + ' ' + option.strength + option.unitOfMeasurement)
            .subscribe(res => {
              if (!res) {
                this.tempDrugName = null;
                this.currentPrescription['id'] = null;
                this.currentPrescription['drugName'] = null;
                this.currentPrescription['drugID'] = null;
                this.currentPrescription['quantity'] = null;
                this.currentPrescription['drugStrength'] = null;
                this.currentPrescription['drugUnit'] = null;
                this.currentPrescription['sctCode'] = null;
                this.currentPrescription['sctTerm'] = null;
                this.isStockAvalable = "";
              }
              else {
                this.isStockAvalable = "warn";
              }
            })
        }
        else {
          this.isStockAvalable = "primary";
        }
      }
    }
  }

  clearCurrentDetails() {
    this.currentPrescription = {
      id: null,
      drugID: null,
      drugName: null,
      drugStrength: null,
      drugUnit: null,
      quantity: null,
      formID: null,
      route: null,
      qtyPrescribed: null,
      formName: null,
      dose: null,
      frequency: null,
      duration: null,
      unit: null,
      instructions: null,
      sctCode: null,
      sctTerm: null
    };
    this.tempDrugName = null;
    this.prescriptionForm.form.markAsUntouched();
    this.isStockAvalable = "";
  }

  submitForUpload() {
    this.addMedicine();
    this.tempform = null;
    this.clearCurrentDetails();
    // this.currentPrescription = {
    //   id: null,
    //   drugID: null,
    //   drugName: null,
    //   drugStrength: null,
    //   drugUnit: null,
    //   quantity: null,
    //   formID: null,
    //   formName: null,
    //   dose: null,
    //   frequency: null,
    //   duration: null,
    //   unit: null,
    //   instructions: null,
    // }
    // this.tempform = null;
    // this.tempDrugName = null;
    // this.prescriptionForm.form.markAsUntouched();
  }

  masterDataSubscription: any;
  loadMasterData() {
    this.masterDataSubscription = this.masterdataService.doctorMasterData$
      .subscribe(res => {
        if (res != null) {
          this.masterData = res;
          this.chiefComplaintMaster = this.masterData.chiefComplaintMaster;
          this.chiefComplaintTemporarayList[0] = this.chiefComplaintMaster.slice();

          this.nonRadiologyMaster = this.masterData.procedures.filter(item => {
            return item.procedureType == 'Laboratory';
          })
          this.radiologyMaster = this.masterData.procedures.filter(item => {
            return item.procedureType == 'Radiology';
          })

          this.drugFormMaster = this.masterData.drugFormMaster;
          this.drugMaster = this.masterData.itemMaster;
          this.drugDoseMaster = this.masterData.drugDoseMaster;
          this.drugFrequencyMaster = this.masterData.drugFrequencyMaster;
          this.drugDurationUnitMaster = this.masterData.drugDurationUnitMaster;
          this.drugRouteMaster = this.masterData.routeOfAdmin;
          this.edlMaster = this.masterData.NonEdlMaster;

          this.loadVitalsFromNurse();
          if (this.quickConsultMode == 'view') {
            let beneficiaryRegID = localStorage.getItem('beneficiaryRegID');
            let visitID = localStorage.getItem('visitID');
            let visitCategory = localStorage.getItem('visitCategory');
            this.getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory);
          }
        }
      });
  }

  diagnosisSubscription: any;
  getDiagnosisDetails(beneficiaryRegID, visitID, visitCategory) {
    this.diagnosisSubscription = this.doctorService.getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data) {
          this.patchDiagnosisDetails(res.data);
        }
      })
  }

  filterInitialComplaints(element) {
    let arr = this.chiefComplaintMaster.filter(item => {
      return item.chiefComplaint == element.chiefComplaint;
    })

    if (arr.length > 0) {
      let index = this.chiefComplaintTemporarayList[0].indexOf(arr[0]);
      let index2 = this.chiefComplaintMaster.indexOf(arr[0]);

      if (index >= 0)
        this.chiefComplaintTemporarayList[0].splice(index, 1);

      if (index2 >= 0)
        this.chiefComplaintMaster.splice(index2, 1);
    }
  }

  patchDiagnosisDetails(response) {
    if (response) {
      const complaintDetails = response.findings;
      if (complaintDetails && complaintDetails.complaints) {
        this.benChiefComplaints = complaintDetails.complaints;
        this.benChiefComplaints.forEach(chiefComplaint => {
          this.filterInitialComplaints(chiefComplaint);
        })
      }

      const investigation = response.investigation;
      if (investigation && investigation.laboratoryList) {
        this.previousLabTestList = investigation.laboratoryList;
        let labTest = [];
        investigation.laboratoryList.forEach(item => {
          let temp = this.masterData.procedures.filter(procedure => {
            return procedure.procedureID == item.procedureID;
          })
          if (temp.length > 0)
            labTest.push(temp[0])
            if ((item.procedureName).toLowerCase() == (environment.RBSTest).toLowerCase()) {
              this.rbsSelectedInInvestigation = true;
              this.nurseService.setRbsSelectedInInvestigation(true);
            }
        })

        let test = labTest.filter(item => {
          return item.procedureType == 'Laboratory';
        });
        let radiology = labTest.filter(item => {
          return item.procedureType == 'Radiology';
        });
        this.patientQuickConsultForm.patchValue({ test, radiology });
      }
      const findings = response.findings;
      const diagnosis = response.diagnosis;
      if (findings.clinicalObservation) {
        this.patientQuickConsultForm.patchValue({ clinicalObservation: findings.clinicalObservation });
      }
      if (diagnosis.diagnosisProvided) {
        this.patientQuickConsultForm.patchValue({ diagnosisProvided: diagnosis.diagnosisProvided });
      }
      if (diagnosis.externalInvestigation) {
        this.patientQuickConsultForm.patchValue({ externalInvestigation: diagnosis.externalInvestigation });
      }
      if (diagnosis.instruction) {
        this.patientQuickConsultForm.patchValue({ instruction: diagnosis.instruction });
      }
      if (diagnosis.prescriptionID) {
        this.patientQuickConsultForm.patchValue({ prescriptionID: diagnosis.prescriptionID });
      }
      if (diagnosis.provisionalDiagnosisList) {
        let generalArray = this.patientQuickConsultForm.controls['provisionalDiagnosisList'] as FormArray;
        let previousArray = diagnosis.provisionalDiagnosisList;
        var j = 0
        if(previousArray.length>0){
        previousArray.forEach(i => {
          generalArray.at(j).patchValue({
            "conceptID": i.conceptID,
            "term": i.term,
            "provisionalDiagnosis": i.term
          });
          (<FormGroup>generalArray.at(j)).controls['provisionalDiagnosis'].disable();
          if (generalArray.length < previousArray.length) {
            this.addDiagnosis();
          }
          j++;
        });
      }
      }
      this.patchPrescriptionDetails(response.prescription);
    }
  }

  getQuickConsultSubscription: any;
  loadVitalsFromNurse() {
    this.getQuickConsultSubscription = this.doctorService.getGenericVitals({
      benRegID: localStorage.getItem('beneficiaryRegID'),
      benVisitID: localStorage.getItem('visitID')
    }).subscribe((res) => {
      if (res.benAnthropometryDetail != null && res.benPhysicalVitalDetail != null) {
        this.patientQuickConsultForm.patchValue({
          height_cm: res.benAnthropometryDetail.height_cm,
          weight_Kg: res.benAnthropometryDetail.weight_Kg,
          bMI: res.benAnthropometryDetail.bMI,
          temperature: res.benPhysicalVitalDetail.temperature,
          systolicBP_1stReading: res.benPhysicalVitalDetail.systolicBP_1stReading,
          diastolicBP_1stReading: res.benPhysicalVitalDetail.diastolicBP_1stReading,
          pulseRate: res.benPhysicalVitalDetail.pulseRate,
          respiratoryRate: res.benPhysicalVitalDetail.respiratoryRate,
          bloodGlucose_Fasting: res.benPhysicalVitalDetail.bloodGlucose_Fasting,
          bloodGlucose_Random: res.benPhysicalVitalDetail.bloodGlucose_Random,
          bloodGlucose_2hr_PP: res.benPhysicalVitalDetail.bloodGlucose_2hr_PP,
          sPO2:res.benPhysicalVitalDetail.sPO2,
          rbsTestResult:res.benPhysicalVitalDetail.rbsTestResult,
          rbsTestRemarks: res.benPhysicalVitalDetail.rbsTestRemarks,
        });
        this.nurseService.rbsTestResultFromDoctorFetch=null;
        if(res.benPhysicalVitalDetail.rbsTestResult !=undefined && res.benPhysicalVitalDetail.rbsTestResult !=null)
        {
          this.nurseService.rbsTestResultFromDoctorFetch=res.benPhysicalVitalDetail.rbsTestResult;
          this.rbsResultChange();
        }
       //Sending RBS Test Result to patch in Lab Reports
       if(res.benPhysicalVitalDetail)
       {
        this.testInVitalsService.setVitalsRBSValueInReports(res.benPhysicalVitalDetail)
       }
      }
    });
  }
  checkDiasableRBS()
  {
    if(this.rbsSelectedInInvestigation === true || (this.nurseService.rbsTestResultFromDoctorFetch !=undefined && this.nurseService.rbsTestResultFromDoctorFetch !=null))
    return true;

    return false;
  }
  rbsResultChange()
  {
    if (this.patientQuickConsultForm.controls['rbsTestResult'].value && 
    this.patientQuickConsultForm.controls['rbsTestResult'].value != null ) {
    this.nurseService.setRbsInCurrentVitals(this.patientQuickConsultForm.controls['rbsTestResult'].value);
    //this.patientVitalsForm.controls['rbsTestResult'].disable();
  }
  else
  {
    this.nurseService.setRbsInCurrentVitals(null);
  }
  if(this.rbsSelectedInInvestigation === true || (this.nurseService.rbsTestResultFromDoctorFetch !=undefined && this.nurseService.rbsTestResultFromDoctorFetch !=null))
  {
    this.patientQuickConsultForm.controls['rbsTestResult'].disable();
    this.patientQuickConsultForm.controls['rbsTestRemarks'].disable();
  }
  else
  {
    this.patientQuickConsultForm.controls['rbsTestResult'].enable();
    this.patientQuickConsultForm.controls['rbsTestRemarks'].enable();
  }
  
  }
  checkForRange() {
    if (this.rbsTestResult < 0 || this.rbsTestResult > 1000 && !this.rbsPopup) {
      this.confirmationService.alert(this.currentLanguageSet.alerts.info.recheckValue);
    }
  }
  get bMI() {
    return this.patientQuickConsultForm.controls['bMI'].value;
  }

  get systolicBP_1stReading() {
    return this.patientQuickConsultForm.controls['systolicBP_1stReading'].value;
  }


  get diastolicBP_1stReading() {
    return this.patientQuickConsultForm.controls['diastolicBP_1stReading'].value;
  }

  get pulseRate() {
    return this.patientQuickConsultForm.controls['pulseRate'].value;
  }

  get respiratoryRate() {
    return this.patientQuickConsultForm.controls['respiratoryRate'].value;
  }

  get bloodGlucose_Fasting() {
    return this.patientQuickConsultForm.controls['bloodGlucose_Fasting'].value;
  }

  get bloodGlucose_Random() {
    return this.patientQuickConsultForm.controls['bloodGlucose_Random'].value;
  }

  get bloodGlucose_2hr_PP() {
    return this.patientQuickConsultForm.controls['bloodGlucose_2hr_PP'].value;
  }

  get rbsTestRemarks() {
    return this.patientQuickConsultForm.controls['rbsTestRemarks'].value;
  }


  get temperature() {
    return this.patientQuickConsultForm.controls['temperature'].value;
  }

  get rbsTestResult()
  {
   return this.patientQuickConsultForm.controls['rbsTestResult'].value;
  }
  get sPO2() {
    return this.patientQuickConsultForm.controls['sPO2'].value;
  }
  addMedicine() {
    const medicine: FormArray = <FormArray>this.drugPrescriptionForm.controls['prescribedDrugs'];
    medicine.insert(0,
      this.utils.initMedicineWithData(
        Object.assign({},
          this.currentPrescription,
          { createdBy: this.createdBy })
      )
    );
  }

  setLimits(pageNo = 0) {
    this.pageLimits[0] = +pageNo * +this.pageSize;
    this.pageLimits[1] = (+pageNo + 1) * +this.pageSize;
  }

  deleteMedicine(i, id?: null) {
    this.confirmationService.confirm('warn', this.currentLanguageSet.alerts.info.confirmDelete)
      .subscribe(res => {
        if (res && id) {
          this.deleteMedicineBackend(i, id);
        } else if (res && !id) {
          this.deleteMedicineUI(i);
        }
      });
  }

  deleteMedicineUI(i) {
    const prescribedDrugs = <FormArray>this.drugPrescriptionForm.controls['prescribedDrugs'];
    prescribedDrugs.removeAt(i);
  }
  deleteMedicineBackend(index, id) {
    this.doctorService.deleteMedicine(id)
      .subscribe(res => {
        if (res.statusCode == 200) {
          this.deleteMedicineUI(index);
        }
      })

  }

  patchPrescriptionDetails(prescription) {

    const medicine: FormArray = <FormArray>this.drugPrescriptionForm.controls['prescribedDrugs'];
    prescription.forEach(element => {
      medicine.insert(0, this.utils.initMedicineWithData(element, element.id));
    });

  }

  getSnomedCTRecord(chiefComplaint, i) {
    this.masterdataService.getSnomedCTRecord(chiefComplaint)
      .subscribe(snomedCT => {
        if (snomedCT && snomedCT.data && snomedCT.data.conceptID) {
          const complaintFormArray = <FormArray>this.patientQuickConsultForm.controls['chiefComplaintList'];
          complaintFormArray.controls[i].patchValue({
            conceptID: snomedCT.data.conceptID
          });
        }
      })
  }

  filterComplaints(chiefComplaintValue, i) {
    this.getSnomedCTRecord(chiefComplaintValue.chiefComplaint, i);
    this.suggestChiefComplaintList(this.fb.group({ chiefComplaint: chiefComplaintValue }), i);

    let arr = this.chiefComplaintMaster.filter(item => {
      return item.chiefComplaint == chiefComplaintValue.chiefComplaint;
    })

    if (this.selectedChiefComplaintList && this.selectedChiefComplaintList[i]) {
      this.chiefComplaintTemporarayList.map((item, t) => {
        if (t != i) {
          item.push(this.selectedChiefComplaintList[i]);
          this.sortChiefComplaintList(item);
        }
      })
    }

    if (arr.length > 0) {
      this.chiefComplaintTemporarayList.map((item, t) => {
        let index = item.indexOf(arr[0]);
        if (index != -1 && t != i)
          item = item.splice(index, 1);
      })
      this.selectedChiefComplaintList[i] = arr[0];
    }
  }

  addChiefComplaint() {
    const complaintFormArray = <FormArray>this.patientQuickConsultForm.controls['chiefComplaintList'];
    const complaintFormArrayValue = complaintFormArray.value;
    let temp = this.chiefComplaintMaster.filter(item => {
      let arr = complaintFormArrayValue.filter((value) => {
        return value.chiefComplaint.chiefComplaint == item.chiefComplaint;
      })
      let flag = arr.length == 0 ? true : false;
      return flag;
    })
    if (temp.length > 0) {
      this.chiefComplaintTemporarayList.push(temp);
    }
    complaintFormArray.push(this.utils.initChiefComplaint());
  }

  deleteChiefComplaint(i: number, complaintForm?: FormGroup) {
    this.confirmationService.confirm(`warn`, this.currentLanguageSet.alerts.info.warn).subscribe(result => {
      if (result) {
        const complaintFormArray = <FormArray>this.patientQuickConsultForm.controls['chiefComplaintList'];
        this.patientQuickConsultForm.markAsDirty();

        let arr = [];
        if (complaintForm.value.chiefComplaint) {
          arr = this.chiefComplaintMaster.filter(item => {
            return item.chiefComplaint == complaintForm.value.chiefComplaint.chiefComplaint;
          })
        }
        if (arr.length > 0) {
          this.chiefComplaintTemporarayList.forEach((element, t) => {
            if (t != i)
              element.push(arr[0]);
            this.sortChiefComplaintList(element);
          })
        }

        if (this.selectedChiefComplaintList[i])
          this.selectedChiefComplaintList[i] = null;

        if (this.suggestChiefComplaintList[i])
          this.suggestedChiefComplaintList[i] = null;

        if (complaintFormArray.length == 1 && complaintForm)
          complaintForm.reset();
        else
          complaintFormArray.removeAt(i);
      }
    });
  }



  displayDrugName(drug) {
    return drug && drug.drugDisplayName;
  }

  canDisableTest(test) {
    if(((this.rbsTestResultCurrent !=null && this.rbsTestResultCurrent !=undefined)|| 
    this.nurseService.rbsTestResultFromDoctorFetch !=null) && test.procedureName == environment.RBSTest)
      {
       // test.checked=true;
        return true;
      }
      // else if(((this.rbsTestResultCurrent == null || this.rbsTestResultCurrent == undefined) &&  
      // this.nurseService.rbsTestResultFromDoctorFetch ==null) && test.procedureName == environment.RBSTest)
      // {
      //   test.checked=false;
      // }
    if (this.previousLabTestList) {
      let temp = this.previousLabTestList.filter(item => {
        return item.procedureID == test.procedureID;
      })
        
      if (temp.length > 0 )
        test.disabled = true;
      else
        test.disabled = false;
      
      return temp.length > 0;
    }
  }

  canDisableComplaints(complaints) {
    if (this.previousChiefComplaints) {
      let temp = this.previousChiefComplaints.filter(item => {
        return complaints.chiefComplaintID == item.chiefComplaintID;
      })

      if (temp.length > 0)
        complaints.disabled = true;
      else
        complaints.disabled = false;

      return temp.length > 0;
    }
  }

  validateDrug(drugName, medicine: FormGroup) {
    if (typeof drugName === 'string') {
      medicine.patchValue({ drug: null });
    }
  }

  checkDrugFormValidity(drugForm) {
    let temp = drugForm.value;
    if (temp.drug && temp.drugForm && temp.dose && temp.frequency && temp.drugDuration && temp.drugDurationUnit && temp.specialInstruction) {
      return false;
    } else {
      return true;
    }
  }

  displayChiefComplaint(complaint) {
    return complaint && complaint.chiefComplaint;
  }

  suggestChiefComplaintList(complaintForm: FormGroup, i) {
    const complaintFormArray = <FormArray>this.patientQuickConsultForm.controls['chiefComplaintList'];
 
    if(complaintForm.value.chiefComplaint !== null && complaintForm.value.chiefComplaint !== undefined && complaintForm.value.chiefComplaint !== '')
      {
    let complaint = complaintForm.value.chiefComplaint;
    if (typeof complaint === 'string') {
      if(this.chiefComplaintTemporarayList !=undefined && this.chiefComplaintTemporarayList !=null)
      {
      this.suggestedChiefComplaintList[i] = this.chiefComplaintTemporarayList[i].filter(compl =>
        compl.chiefComplaint.toLowerCase().indexOf(complaint.toLowerCase().trim()) >= 0);
      }
    } else if (typeof complaint == 'object' && complaint) {
      if(this.chiefComplaintTemporarayList !=undefined && this.chiefComplaintTemporarayList !=null)
      {
      this.suggestedChiefComplaintList[i] = this.chiefComplaintTemporarayList[i].filter(compl =>
        compl.chiefComplaint.toLowerCase().indexOf(complaint.chiefComplaint.toLowerCase().trim()) >= 0);
      }
    }

    if (this.suggestedChiefComplaintList[i].length == 0)
      complaintForm.reset();
  }
  else
  {
    // if(complaintFormArray.controls.length>1 && i==0)
    // {
    //       this.deleteChiefComplaintRow(i,complaintForm)
    // }
    // else{
      complaintFormArray.controls[i].patchValue({
        conceptID: null,
        description: null
      });
    // }
  }
  }

  deleteChiefComplaintRow(i: number, complaintForm?: FormGroup)
  {
   
   
      const complaintFormArray = <FormArray>this.patientQuickConsultForm.controls['chiefComplaintList'];
      this.patientQuickConsultForm.markAsDirty();

      let arr = [];
      if (complaintForm.value.chiefComplaint) {
        arr = this.chiefComplaintMaster.filter(item => {
          return item.chiefComplaint == complaintForm.value.chiefComplaint.chiefComplaint;
        })
      }
      if (arr.length > 0) {
        this.chiefComplaintTemporarayList.forEach((element, t) => {
          if (t != i)
            element.push(arr[0]);
          this.sortChiefComplaintList(element);
        })
      }

      if (this.selectedChiefComplaintList[i])
        this.selectedChiefComplaintList[i] = null;

      if (this.suggestChiefComplaintList[i])
        this.suggestedChiefComplaintList[i] = null;

      if (complaintFormArray.length == 1 && complaintForm)
        complaintForm.reset();
      else
        complaintFormArray.removeAt(i);
    
    
  }

  sortChiefComplaintList(complaintList) {
    complaintList.sort((a, b) => {
      if (a.chiefComplaint == b.chiefComplaint) return 0;
      if (a.chiefComplaint < b.chiefComplaint) return -1;
      else return 1;
    })
  }

  checkProvisionalDiagnosisValidity(diagnosis) {
    let tempDiagnosis = diagnosis.value
    if (tempDiagnosis.conceptID && tempDiagnosis.term) {
      return false;
    }
    else {
      return true;
    }

  }

  checkComplaintFormValidity(complaintForm) {
    let temp = complaintForm.value;
    if (temp.chiefComplaint && temp.conceptID) {
      return false;
    } else {
      return true;
    }
  }

  checkTestName(event) {
    console.log("testName", event);
    let item = event.value;
    this.rbsSelectedInInvestigation =false;
    this.nurseService.setRbsSelectedInInvestigation(false);
    item.forEach(element => {
      if ((element.procedureName).toLowerCase() == (environment.RBSTest).toLowerCase()) {
        this.rbsSelectedInInvestigation =true;
        this.nurseService.setRbsSelectedInInvestigation(true);
      }
     
    
    });
  }
}


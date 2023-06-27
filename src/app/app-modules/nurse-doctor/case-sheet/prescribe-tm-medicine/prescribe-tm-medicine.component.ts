import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { PageEvent } from '@angular/material';
import { MasterdataService, DoctorService } from '../../../nurse-doctor/shared/services';
import { FormBuilder, FormGroup, FormArray, NgForm } from '@angular/forms';
import { GeneralUtils } from '../../shared/utility/general-utility';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
 interface prescribe {
  id: string;
  drugID: string;
  drugName: string;
  drugStrength: string;
  drugUnit: string;
  quantity: string;
  route: string;
  formID: string;
  formName: string;
  qtyPrescribed: string;
  dose: string;
  frequency: string;
  duration: string;
  unit: string;
  instructions: string;
  isEDL:boolean;
  sctCode: string;
  sctTerm: string;
}
@Component({
  selector: 'app-prescribe-tm-medicine',
  templateUrl: './prescribe-tm-medicine.component.html',
  styleUrls: ['./prescribe-tm-medicine.component.css']
})
export class PrescribeTmMedicineComponent implements OnInit {

  generalUtils = new GeneralUtils(this.fb);
  @ViewChild('prescriptionForm')
  prescriptionForm: NgForm;

  drugPrescriptionForm: FormGroup;
  createdBy: string;

  pageSize = 5;
  pageEvent: PageEvent;
  pageLimits = [];
  currentPrescription: prescribe = {
    id: null,
    drugID: null,
    drugName: null,
    drugStrength: null,
    drugUnit: null,
    qtyPrescribed: null,
    quantity: null,
    formID: null,
    formName: null,
    route: null,
    dose: null,
    frequency: null,
    duration: null,
    unit: null,
    instructions: null,
    isEDL:false,
    sctCode: null,
    sctTerm: null
  };
  filteredDrugMaster = [];
  filteredDrugDoseMaster = [];
  subFilteredDrugMaster = [];
  drugMaster: any;
  drugFormMaster: any;
  drugDoseMaster: any;
  drugRouteMaster: any;
  drugFrequencyMaster: any;
  drugDurationMaster = [];
  drugDurationUnitMaster: any;
  edlMaster: any;

  beneficiaryRegID: string;
  visitID: string;
  visitCategory: string;
  isStockAvalable: string;
  tmPrescribedDrugs: any;
  tempform: any;
  tempDrugName: any;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  constructor(@Inject(MD_DIALOG_DATA) public input: any,
  public dialogRef: MdDialogRef<PrescribeTmMedicineComponent>,
  private masterdataService: MasterdataService,
  private fb: FormBuilder,
  public httpServiceService: HttpServiceService,
  private confirmationService: ConfirmationService,
  private doctorService: DoctorService){ }

  ngOnInit() {
    this.fetchLanguageResponse();
    this.tmPrescribedDrugs = this.input.tmPrescribedDrugs;
    this.createdBy = localStorage.getItem('userName');
    this.drugPrescriptionForm = this.generalUtils.createDrugPrescriptionForm();
    this.setLimits();
    this.makeDurationMaster();
    this.getDoctorMasterData();

  }

  setLimits(pageNo = 0) {
    this.pageLimits[0] = +pageNo * +this.pageSize;
    this.pageLimits[1] = (+pageNo + 1) * +this.pageSize;
  }
  makeDurationMaster() {
    let i = 1;
    while (i <= 29) {
      this.drugDurationMaster.push(i);
      i++;
    }
  }
  getDoctorMasterData() {
    let visitID = localStorage.getItem('caseSheetVisitCategoryID');
    let serviceProviderID = localStorage.getItem("providerServiceID");
      this.masterdataService.getDoctorMasterDataForNurse(visitID, serviceProviderID)       
        .subscribe((masterData) => {
          if (masterData.statusCode == 200) {
            this.drugFormMaster = masterData.data.drugFormMaster;
            this.drugMaster = masterData.data.itemMaster;
            this.drugDoseMaster = masterData.data.drugDoseMaster;
            this.drugFrequencyMaster = masterData.data.drugFrequencyMaster;
            this.drugDurationUnitMaster = masterData.data.drugDurationUnitMaster;
            this.drugRouteMaster = masterData.data.routeOfAdmin;
            this.edlMaster = masterData.data.NonEdlMaster;
    
          }
        });
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
        console.log('here');
    
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
            sctCode: this.currentPrescription.sctCode,
            sctTerm: this.currentPrescription.sctTerm,
            strength: this.currentPrescription.drugStrength,
            unitOfMeasurement: this.currentPrescription.drugUnit
          }
        } else if (this.tempDrugName && !this.currentPrescription.drugID) {
          this.tempDrugName = null;
        } else {
          this.clearCurrentDetails();
          this.getFormDetails();
        }
      }
      displayFn(option): string | undefined {
        return option
          ? `${option.itemName} ${option.strength}${
              option.unitOfMeasurement ? option.unitOfMeasurement : ""
            }${option.quantityInHand ? "(" + option.quantityInHand + ")" : ""}`
          : undefined;
      }
      selectMedicineObject(event) {
        const option = event.source.value;
        console.log('here', event);
        if (event.isUserInput) {
          if (this.checkNotIssued(option.itemID)) {
            this.currentPrescription['id'] = option.id;
            this.currentPrescription['drugName'] = option.itemName;
            this.currentPrescription['drugID'] = option.itemID;
            this.currentPrescription['quantity'] = option.quantityInHand;
            this.currentPrescription['sctCode'] = option.sctCode;
            this.currentPrescription['sctTerm'] = option.sctTerm;
            this.currentPrescription['drugStrength'] = option.strength;
            this.currentPrescription['drugUnit'] = option.unitOfMeasurement;
            this.currentPrescription['isEDL'] = option.isEDL;
            const typeOfDrug =  option.isEDL?'':'- (Non-EDL) Medicine'
            if (option.quantityInHand == 0) {
              this.confirmationService.confirm('info '+typeOfDrug, 'Stock not Available, would you still like to prescribe?  ' + option.itemName +' '+ option.strength + option.unitOfMeasurement)
              .subscribe(res => {
                if (!res) {
                  this.tempDrugName = null;
                  this.currentPrescription['id'] = null;
                  this.currentPrescription['drugName'] = null;
                  this.currentPrescription['drugID'] = null;
                  this.currentPrescription['quantity'] = null;
                  this.currentPrescription['sctCode'] = null;
                  this.currentPrescription['sctTerm'] = null;
                  this.currentPrescription['drugStrength'] = null;
                  this.currentPrescription['drugUnit'] = null;
                  this.isStockAvalable = "";               
                }
                else{
                  this.isStockAvalable = "warn";
                }
              })
          }
          else{
            this.isStockAvalable = "primary";
          }
          }
        }
      }
    
      checkNotIssued(itemID) {
        const medicineValue = this.drugPrescriptionForm.controls['prescribedDrugs'].value;
        const filteredExisting = medicineValue.filter(meds => meds.drugID === itemID);
        if (filteredExisting.length > 0) {
          this.reEnterMedicine();
          this.confirmationService.alert('Medicine is already prescribed, Please delete the previously added one to change.', 'info');
          return false;
        } else {
          return true;
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
          qtyPrescribed: null,
          formName: null,
          route: null,
          dose: null,
          frequency: null,
          duration: null,
          unit: null,
          instructions: null,
          isEDL:false,
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
      }
    
      addMedicine() {
        const medicine: FormArray = <FormArray>this.drugPrescriptionForm.controls['prescribedDrugs'];
        medicine.insert(0,
          this.generalUtils.initMedicineWithData(
            Object.assign({},
              this.currentPrescription,
              { createdBy: this.createdBy })
          )
        );
        console.log(medicine.value, 'frrr')
      }
  
      deleteMedicine(i, id?: null) {
        this.confirmationService.confirm('warn', 'Please confirm to delete.')
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
      submitPrescription() {
        console.log(this.drugPrescriptionForm);
        if(this.drugPrescriptionForm.value) {
          this.dialogRef.close(this.drugPrescriptionForm.value);
        } else {
          this.confirmationService.alert('Please prescribe the medicines');
        }
      }

      // AV40085804 13/10/2021 Integrating Multilingual Functionality -----Start-----
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.httpServiceService);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  // -----End------

}

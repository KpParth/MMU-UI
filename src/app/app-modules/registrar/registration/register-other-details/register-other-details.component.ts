import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { RegistrarService } from '../../shared/services/registrar.service';
import { RegistrationUtils } from '../../shared/utility/registration-utility';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'register-other-details',
  templateUrl: './register-other-details.component.html',
  styleUrls: ['./register-other-details.component.css']
})
export class RegisterOtherDetailsComponent implements OnInit, OnDestroy {
  utils = new RegistrationUtils(this.fb);


  masterData: any;
  masterDataSubscription: any;

  revisitData: any;
  revisitDataSubscription: any;

  govIDMaster = [];
  previousGovID = [];
  otherGovIDMaster = [];
  previousOtherGovID = [];
  removedGovIDs = []; // edit ben
  removedOtherGovIDs = []; //edit ben
  govLength: number;
  otherGovLength: number;
  patterns: any;
  // patterns = [
  //   {
  //     'govtIdentityTypeID': 1, allow: 'number', error: 'Enter 12 Digit Aadhar Number',
  //     maxLength: 12, pattern: /^\d{4}\d{4}\d{4}$/, 'identityType': 'Aadhar'
  //   },
  //   {
  //     'govtIdentityTypeID': 2, allow: 'alphanumeric', error: 'Enter 12 Character Voter ID',
  //     maxLength: 15, pattern: /^([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*$/, 'identityType': 'Voter ID'
  //   },
  //   {
  //     'govtIdentityTypeID': 3, allow: 'alphanumerichyphen', error: 'Enter 18 Character Driving License ID',
  //     maxLength: 18, pattern: /^([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*$/, 'identityType': 'Driving License'
  //   },
  //   {
  //     'govtIdentityTypeID': 4, allow: 'alphanumeric', error: 'Enter 10 Character Pan ID',
  //     maxLength: 10, pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/, 'identityType': 'PAN'
  //   },
  //   {
  //     'govtIdentityTypeID': 5, allow: 'alphanumeric', error: 'Enter 15 Character Passport',
  //     maxLength: 15, pattern: /^([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*$/, 'identityType': 'Passport'
  //   },
  //   {
  //     'govtIdentityTypeID': 6, allow: 'alphanumeric', error: 'Enter 15 Character Rationcard  ID',
  //     maxLength: 15, pattern: /^([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*$/, 'identityType': 'Ration Card'
  //   }]

  @Input('otherDetailsForm')
  otherDetailsForm: FormGroup;

  @Input('patientRevisit')
  patientRevisit: Boolean;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  

  constructor(
    private httpServiceService: HttpServiceService,
    private registrarService: RegistrarService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.fetchLanguageResponse();
    this.assignPattern();
    this.loadMasterDataObservable();
    //  console.log(this.patientRevisit,'revisit others');

  }


  assignPattern(){
    this.patterns = [
      {
        'govtIdentityTypeID': 1, allow: 'number', error: this.currentLanguageSet.common.enterDigitAadharNumber,
        maxLength: 12, pattern: /^\d{4}\d{4}\d{4}$/, 'identityType': 'Aadhar'
      },
      {
        'govtIdentityTypeID': 2, allow: 'alphanumeric', error: this.currentLanguageSet.common.enterCharacterVoterID,
        maxLength: 10, pattern: /^([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*$/, 'identityType': 'Voter ID'
      },
      {
        'govtIdentityTypeID': 3, error: this.currentLanguageSet.common.enterCharacterDrivingLicenseID,
        minLength: 8,
        maxLength: 20, 'identityType': 'Driving License'
      },
      {
        'govtIdentityTypeID': 4, allow: 'alphanumeric', error: this.currentLanguageSet.common.EnterCharacterPanID,
        maxLength: 10, pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/, 'identityType': 'PAN'
      },
      {
        'govtIdentityTypeID': 5, allow: 'alphanumeric', error: this.currentLanguageSet.common.EnterCharacterPassport,
        maxLength: 15, pattern: /^([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*$/, 'identityType': 'Passport'
      },
      {
        'govtIdentityTypeID': 6, allow: 'alphanumeric', error: this.currentLanguageSet.common.EnterCharacterRationcardID,
        maxLength: 15, pattern: /^([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*$/, 'identityType': 'Ration Card'
      }]
  }
  ngOnDestroy() {
    if (this.masterDataSubscription) { this.masterDataSubscription.unsubscribe() };
    if (this.patientRevisit && this.revisitDataSubscription) {
      this.revisitDataSubscription.unsubscribe();
    }
  }
  alerting(control) {
    console.log(control, 'a');

  }


  /**
  *
  * Reset FormArrays
  *
  */
  resetForm() {
    this.govIDMaster = [];
    this.previousGovID = [];
    this.otherGovIDMaster = [];
    this.previousOtherGovID = [];
    this.govLength = null;
    this.otherGovLength = null;
    this.loadMasterDataObservable();
  }


  checkIDPattern(index) {

    const values = this.otherDetailsForm.value.govID[index];
    const id = (<FormArray>this.otherDetailsForm.controls['govID']).at(index);
    if (values.idValue.length == values.maxLength) {
      console.log('ok')
    }
  }
  /**
  *
  * Load Basic Master Data Observable
  */
  loadMasterDataObservable() {

    this.masterDataSubscription = this.registrarService.registrationMasterDetails$
      .subscribe(res => {
        // console.log('res other', res)
        if (res != null) {
          // console.log(res,'res other')
          this.masterData = Object.assign({}, res);
          this.govIDMaster[0] = Object.assign({}, res);
          this.govLength = this.masterData.govIdEntityMaster.length;
          this.otherGovLength = this.masterData.otherGovIdEntityMaster.length;
          this.otherGovIDMaster[0] = Object.assign({}, res);
          if (this.patientRevisit) { this.configMasterForOthers(); }
        }
      })


  }

  /**
  * Load Master and Current Others Details for an Old Beneficiary
  * FOR BENEFICIARY EDIT FROM BENEFICIARY DATA
  */
  configMasterForOthers() {
    this.revisitDataSubscription = this.registrarService.beneficiaryEditDetails$
      .subscribe(res => {
        if (res && res.beneficiaryID) {
          this.revisitData = Object.assign({}, res);
          if (this.patientRevisit) {
            // this.setDemographicDefaults();
            this.loadBenEditDetails();

          }
        }
      })
  }

  loadBenEditDetails() {
    this.otherDetailsForm.patchValue({
      fatherName: this.revisitData.fatherName || null,
      motherName: this.revisitData.motherName || null,
      emailID: this.revisitData.email || null,
      community: this.revisitData.i_bendemographics && this.revisitData.i_bendemographics.communityID || null,
      communityName: this.revisitData.i_bendemographics && this.revisitData.i_bendemographics.communityName || null,
      bankName: this.revisitData.bankName || null,
      branchName: this.revisitData.branchName || null,
      ifscCode: this.revisitData.ifscCode || null,
      accountNo: this.revisitData.accountNo || null,
      religion: this.revisitData.religionId || null,
      religionOther: this.revisitData.religion || null,
    })

    this.loadPreviousBenIdData();
  }

  loadPreviousBenIdData() {
    if (this.revisitData.beneficiaryIdentities && this.revisitData.beneficiaryIdentities.length) {
      const unFilteredIdentityData = Object.assign([], this.revisitData.beneficiaryIdentities);
      const identityData = [];
      unFilteredIdentityData.forEach(element => {
        if (!element.deleted || element.deleted == false) {
          identityData.push(element);
        }

      });
      console.log(identityData, 'identityData')
      // this.loadGovIDs(identityData);
      // this.loadotherGovIDs(identityData);
      const govIDs = [];
      const otherGovIDs = [];
      identityData.forEach((item) => {
        if (item.govtIdentityType.isGovtID == true) {
          govIDs.push(item);
        }
      })
      identityData.forEach((item) => {
        if (item.govtIdentityType.isGovtID == false) {
          otherGovIDs.push(item);
        }
      })
      console.log(govIDs, otherGovIDs, 'gov n others  ')
      this.loadGovIDs(Object.assign([], govIDs));
      this.loadOtherGovIDs(Object.assign([], otherGovIDs));
      this.workAround();

    }
  }

  workAround() {
    const id = <FormArray>this.otherDetailsForm.controls['govID'];
    const idValue = id.value;
    const idToRemove = [];
    idValue.forEach((element, i) => {
      if (!element.type || element.type == null || element.type == undefined) {
        idToRemove.push(i);

      }
    })
    const otherId = <FormArray>this.otherDetailsForm.controls['otherGovID'];
    const otherIdValue = otherId.value;
    const idOtherToRemove = [];

    otherIdValue.forEach((element, i) => {
      if (!element.type || element.type == null || element.type == undefined) {
        idOtherToRemove.push(i);
      }
    })

    const reversedidToRemove = idToRemove.reverse();
    const reversedidOtherToRemove = idOtherToRemove.reverse();

    reversedidToRemove.forEach((elementA) => {
      if (elementA)
        id.removeAt(elementA);
    })
    reversedidOtherToRemove.forEach((elementB) => {
      if (elementB)
        otherId.removeAt(elementB);
    })


    console.log(idValue, otherIdValue, 'laoji');


  }

  loadGovIDs(govtids) {
    console.log(govtids, 'here');
    // let govIdIndex = 0;
    const id = <FormArray>this.otherDetailsForm.controls['govID'];
    console.log(id, 'formGovID')
    govtids.forEach((val, i) => {
      console.log(i, 'is i');
      console.log('data', val, 'clear', val.govIdentityTypeID)
      const formGroupIndexed = <FormGroup>id.at(i);
      console.log(formGroupIndexed, 'formgroupIndexed');
      this.filtergovIDs(val.govtIdentityTypeID, i)
      formGroupIndexed.patchValue({
        type: val.govtIdentityTypeID,
        idValue: val.govtIdentityNo,
        allow: this.getAllowedGovChars(val.govtIdentityTypeID),
        benIdentityId: val.benIdentityId,
        deleted: val.deleted,
        createdBy: val.createdBy
      })
      this.addID(1, i);
      console.log(formGroupIndexed.value, 'formGroupValue');
      console.log(val, 'value to be added', i, 'and index')
      // if (i !== 0) {
      // govIdIndex++;
      // }
      console.log(id, 'formGovID again')

    })

  }

  getAllowedGovChars(govtTypeID) {
    let allowedText = null;
    this.patterns.forEach((element) => {
      if (element.govtIdentityTypeID == govtTypeID) {
        allowedText = element.allow
      }
    })

    return allowedText;


  }
  loadOtherGovIDs(otherGovtIDs) {
    console.log(otherGovtIDs, 'here');
    // let govIdIndex = 0;
    const id = <FormArray>this.otherDetailsForm.controls['otherGovID'];
    console.log(id, 'formGovID')
    otherGovtIDs.forEach((val, i) => {
      console.log(i, 'is i');
      console.log('data', val, 'clear', val.govIdentityTypeID)
      const formGroupIndexed = <FormGroup>id.at(i);
      console.log(formGroupIndexed, 'formgroupIndexed');
      this.filterOtherGovIDs(val.govtIdentityTypeID, i)
      formGroupIndexed.patchValue({
        type: val.govtIdentityTypeID,
        idValue: val.govtIdentityNo,
        benIdentityId: val.benIdentityId,
        deleted: val.deleted,
        createdBy: val.createdBy
      })
      this.addID(0, i);
      console.log(formGroupIndexed.value, 'formGroupValue');
      console.log(val, 'value to be added', i, 'and index')
      // if (i !== 0) {
      // govIdIndex++;
      // }
      console.log(id, 'formGovID again')

    })

  }

  /*   loadGovIDs(identityData) {
      let govIdIndex = 0;
      const govid = <FormArray>this.otherDetailsForm.controls['govID'];
      identityData.forEach((element, i) => {
        if (element.govtIdentityType && element.govtIdentityType.isGovtID === true) {
          if (i !== 0) {
            this.addID(1, govIdIndex); // 1 = govt id
            govIdIndex++;
          }
          govid.at(govIdIndex).patchValue({
            type: element.govtIdentityTypeID,
            idValue: element.govtIdentityNo
          })
          this.filtergovIDs(element.govtIdentityTypeID, govIdIndex)

        }
      });

    }
    loadotherGovIDs(identityData) {
      let othergovIdIndex = 0;
      const othergovid = <FormArray>this.otherDetailsForm.controls['otherGovID'];
      console.log(othergovid, 'othergovIDDdd');
      identityData.forEach((element, j) => {
        if (element.govtIdentityType && element.govtIdentityType.isGovtID === true){

        } else
        if (element.govtIdentityType.isGovtID == false)  {
          // if (j !== 0) {
            // }
            othergovid.at(othergovIdIndex).patchValue({
              type: element.govtIdentityTypeID,
              idValue: element.govtIdentityNo
            })
            console.log('called called');
            this.filterOtherGovIDs(element.govtIdentityTypeID, othergovIdIndex)
            this.addID(0, othergovIdIndex); // 0 = other govt id
            othergovIdIndex++;

        }
      });
    } */


  /**
  *
  * Filter GovIDs for List
  */
  filtergovIDs(selectedID, index: number) {
    let nextIndex = index + 1;

    if (this.previousGovID[index] == undefined) {
      this.previousGovID[index] = selectedID;

      let govIDs = this.otherDetailsForm.value.govID;

      this.govIDMaster[nextIndex] = JSON.parse(JSON.stringify(this.masterData));

      this.previousGovID.forEach((value) => {
        this.govIDMaster[nextIndex].govIdEntityMaster = this.govIDMaster[nextIndex].govIdEntityMaster.filter((item) => {
          return item.govtIdentityTypeID != value;
        })
      })

      for (let i = 0; i < this.govIDMaster.length; i++) {
        let indexToRemove;
        let newDataforOtherLists;
        if (i != index) {

          let temp = JSON.parse(JSON.stringify(this.govIDMaster[i].govIdEntityMaster));
          temp.forEach((removing, j) => {
            if (removing.govtIdentityTypeID == selectedID) {
              indexToRemove = j;


            }



          })

          if (indexToRemove != undefined) {
            temp.splice(indexToRemove, 1);
            this.govIDMaster[i].govIdEntityMaster = temp;

          }
        }
        indexToRemove = undefined;

      }

    } else {
      const id = <FormArray>this.otherDetailsForm.controls['govID'];
      const formGroupIndexed = <FormGroup>id.at(index);
      console.log(formGroupIndexed, 'formgroupIndexed');
      // formGroupIndexed.patchValue({
      //   idValue: null
      //  })
      formGroupIndexed.controls['idValue'].reset();

      let toBePushed = this.masterData.govIdEntityMaster.filter((item) => {
        return item.govtIdentityTypeID == this.previousGovID[index];
      })
      // })
      let indexToRemove;
      let newDataforOtherLists;

      for (let i = 0; i < this.govIDMaster.length; i++) {
        let indexToRemove;
        let newDataforOtherLists;
        if (i != index) {
          if (toBePushed[0] != undefined) {
            this.govIDMaster[i].govIdEntityMaster.push(toBePushed[0]);
          }
          let temp = JSON.parse(JSON.stringify(this.govIDMaster[i].govIdEntityMaster));
          temp.forEach((removing, j) => {
            if (removing.govtIdentityTypeID == selectedID) {
              indexToRemove = j;
            }
          })
          if (indexToRemove != undefined) {
            temp.splice(indexToRemove, 1);
            this.govIDMaster[i].govIdEntityMaster = temp;
          }
        }
        indexToRemove = undefined;
      }
      this.previousGovID[index] = selectedID;
    }
    this.addPatternforGovID(selectedID, index);
  }

  addPatternforGovID(type, index) {
    const id = <FormArray>this.otherDetailsForm.controls['govID'];

    this.patterns.forEach((element, i) => {
      if (type == element.govtIdentityTypeID) {
        id.at(index).patchValue({
          pattern: element.pattern,
          error: element.error,
          allow: element.allow,
          minLength: element.minLength,
          maxLength: element.maxLength,
          type: type
        })
      }

    })
    // if (index === 0 && length - 1 === index) {
    //   console.log(id, 'here')
    //   id.at(index).patchValue({
    //     type: null,
    //     value: null
    //   })

  }

  /**
  *
  * Filter Other GovIDs for List
  */
  filterOtherGovIDs(selectedID, index: number) {
    // console.log(selectedID, index);
    let nextIndex = index + 1;
    // console.log(nextIndex, 'nextIndex')
    // console.log(this.previousOtherGovID[index], 'before at previous ids');

    if (this.previousOtherGovID[index] == undefined) {
      this.previousOtherGovID[index] = selectedID;

      let govIDs = this.otherDetailsForm.value.otherGovID;
      // console.log(govIDs, 'ids');
      // console.log(govIDs.length, 'length')
      // console.log(this.previousOtherGovID[index], 'at previous ids');
      // console.log(govIDs[index], 'value at index', index);

      this.otherGovIDMaster[nextIndex] = JSON.parse(JSON.stringify(this.masterData));

      this.previousOtherGovID.forEach((value) => {
        this.otherGovIDMaster[nextIndex].otherGovIdEntityMaster = this.otherGovIDMaster[nextIndex].otherGovIdEntityMaster.filter((item) => {
          return item.govtIdentityTypeID != value;
        })
      })
      // console.log(this.masterData.otherGovIdEntityMaster, 'master untouched');

      for (let i = 0; i < this.otherGovIDMaster.length; i++) {
        let indexToRemove;
        let newDataforOtherLists;
        if (i != index) {
          // console.log(this.masterData.otherGovIdEntityMaster, 'master untouched');

          let temp = JSON.parse(JSON.stringify(this.otherGovIDMaster[i].otherGovIdEntityMaster));
          temp.forEach((removing, j) => {
            if (removing.govtIdentityTypeID == selectedID) {
              indexToRemove = j;
              // console.log(indexToRemove, j, 'index to remove');


            }



          })

          if (indexToRemove != undefined) {
            temp.splice(indexToRemove, 1);
            this.otherGovIDMaster[i].otherGovIdEntityMaster = temp;

          }
        }
        indexToRemove = undefined;

      }
      // console.log(this.masterData.otherGovIdEntityMaster, 'master untouched');

    } else {
      const id = <FormArray>this.otherDetailsForm.controls['otherGovID'];
      const formGroupIndexed = <FormGroup>id.at(index);
      console.log(formGroupIndexed, 'formgroupIndexed');
      formGroupIndexed.patchValue({
        idValue: null
      })
      // console.log(this.masterData.otherGovIdEntityMaster, 'master untouched');
      let toBePushed = this.masterData.otherGovIdEntityMaster.filter((item) => {
        // console.log(item, 'item to check');
        return item.govtIdentityTypeID == this.previousOtherGovID[index];
      })
      // let toBeRemoved = this.masterData.otherGovIdEntityMaster.filter((item)=>{
      //   return item.govtIdentityTypeID == selectedID;
      // })
      // console.log(this.previousOtherGovID[index], 'tobePushed index');
      // console.log(toBePushed, 'tobePushed');
      let indexToRemove;
      let newDataforOtherLists;

      for (let i = 0; i < this.otherGovIDMaster.length; i++) {
        let indexToRemove;
        let newDataforOtherLists;
        if (i != index) {
          if (toBePushed[0] != undefined) {
            this.otherGovIDMaster[i].otherGovIdEntityMaster.push(toBePushed[0]);
          }
          let temp = JSON.parse(JSON.stringify(this.otherGovIDMaster[i].otherGovIdEntityMaster));
          // console.log(temp, 'here');
          temp.forEach((removing, j) => {
            if (removing.govtIdentityTypeID == selectedID) {
              indexToRemove = j;
              // console.log(indexToRemove, j, 'index to remove');


            }



          })

          if (indexToRemove != undefined) {
            temp.splice(indexToRemove, 1);
            this.otherGovIDMaster[i].otherGovIdEntityMaster = temp;
          }
        }
        indexToRemove = undefined;

      }
      this.previousOtherGovID[index] = selectedID;

      // console.log(this.masterData.otherGovIdEntityMaster, 'master untouched');

    }
    //  this.otherGovIDMaster[nextIndex].otherGovIdEntityMaster = this.masterData.otherGovIdEntityMaster.filter((item)=>{
    //    return item.govtIdentityTypeID != selectedID;
    // })
    // console.log(this.otherGovIDMaster, 'masterchange')
    // console.log(this.masterData.otherGovIdEntityMaster, 'master untouched');


  }

  // Removed Gov IDs
  getRemovedIDs() {
    return { removedGovIDs: this.removedGovIDs, removedOtherGovIDs: this.removedOtherGovIDs };
  }

  /**
  * Remove ID from New IDs
  *
  */
  removeID(idtype, index, length) {
    // console.log(index, 'index');
    // console.log(length, 'length')
    //id type '1' means govID
    //id type '0' means otherGovID
    if (idtype == 1) {
      if (this.otherDetailsForm.value.govID[index].type != null) {
        if (this.patientRevisit && this.otherDetailsForm.value.govID[index].createdBy) {
          this.removedGovIDs.push(this.otherDetailsForm.value.govID[index]);
        }
        this.previousGovID.splice(index, 1);
        // console.log(this.govIDMaster[index], 'its master');
        const values = this.govIDMaster[index].govIdEntityMaster.filter((item) => {
          return item.govtIdentityTypeID == this.otherDetailsForm.value.govID[index].type;
        })
        // console.log(values, 'restoring');
        this.govIDMaster.splice(index, 1);
        this.govIDMaster.forEach((item) => {
          item.govIdEntityMaster.push(values[0]);
        })

      }
      const id = <FormArray>this.otherDetailsForm.controls['govID'];
      if (index === 0 && length - 1 === index) {
        // console.log(id, 'here')
        id.at(index).patchValue({
          type: null,
          idValue: null,
          pattern: null,
          error: null,
          allow: null,
          minLength: null,
          maxLength: null,
          benIdentityId: null
        })
      } else {
        id.removeAt(index);
      }
    } else if (idtype == 0) {
      if (this.otherDetailsForm.value.otherGovID[index].type != null) {
        if (this.patientRevisit && this.otherDetailsForm.value.otherGovID[index].createdBy) {
          this.removedOtherGovIDs.push(this.otherDetailsForm.value.otherGovID[index]);
        }
        this.previousOtherGovID.splice(index, 1);

        const values = this.otherGovIDMaster[index].otherGovIdEntityMaster.filter((item) => {
          return item.govtIdentityTypeID == this.otherDetailsForm.value.otherGovID[index].type;
        })
        // console.log(values, 'restoring');
        this.otherGovIDMaster.splice(index, 1);
        this.otherGovIDMaster.forEach((item) => {
          item.otherGovIdEntityMaster.push(values[0]);
        })
      }

      const id = <FormArray>this.otherDetailsForm.controls['otherGovID'];
      if (index === 0 && length - 1 === index) {
        // console.log(id, 'here')
        id.at(index).patchValue({
          type: null,
          idValue: null,
          pattern: null,
          error: null,
          minLength: null,
          maxLength: null,
          benIdentityId: null
        })
      } else {
        id.removeAt(index);
      }
    }

  }

  /**
  * Add ID to New IDs
  *
  */
  addID(idtype, index) {
    //id type '1' means govID
    //id type '0' means otherGovID

    // console.log(index, 'index');
    if (idtype == 1) {


      if (this.otherDetailsForm.value.govID[index]
        && this.otherDetailsForm.value.govID[index].type
        && this.otherDetailsForm.value.govID[index].idValue) {
        const id = <FormArray>this.otherDetailsForm.controls['govID'];
        id.push(this.utils.initGovID());

      } else {
        this.confirmationService.alert(this.currentLanguageSet.alerts.info.pleaseInputFieldFirst, 'warn');

        // console.log('please enter value for This ID')
      }

    } else if (idtype == 0) {
      if (this.otherDetailsForm.value.otherGovID[index]
        && this.otherDetailsForm.value.otherGovID[index].type
        && this.otherDetailsForm.value.otherGovID[index].idValue) {
        const id = <FormArray>this.otherDetailsForm.controls['otherGovID'];
        id.push(this.utils.initGovID());
      } else {
        this.confirmationService.alert(this.currentLanguageSet.alerts.info.pleaseInputFieldFirst, 'warn');

        // console.log('please enter value for This ID')
      }
    }
  }

  /**
   * Get ReligionName as per ID
   */

  getReligionName() {


    this.masterData.religionMaster.forEach((religion) => {
      if (this.otherDetailsForm.value.religion != 7
        && this.otherDetailsForm.value.religion === religion.religionID) {
        this.otherDetailsForm.patchValue({
          religionOther: religion.religionType
        })
      }
    });

    if (this.otherDetailsForm.value.religion === 7) {
      this.otherDetailsForm.patchValue({
        religionOther: null
      })
    }

  }

  /**
   * get Community Name on getting ID
   */
  onCommunityChanged() {
    const communityMaster = this.masterData.communityMaster;
    communityMaster.forEach((element, i) => {
      if (element.communityID === this.otherDetailsForm.value.community) {
        this.otherDetailsForm.patchValue({
          communityName: element.communityType
        })
      }
    });
  }



  checkPattern(index, id) {
    console.log(index, id, 'knocker');
    if (id.idValue) {
      if ((id.pattern !== null && id.pattern !== undefined && !id.pattern.test(id.idValue)) || (id.type === 3 && id.idValue.length < id.minLength) || (id.type !== 3 && id.idValue.length !== id.maxLength)) {
        this.confirmationService.alert(id.error);
        const ids = <FormArray>this.otherDetailsForm.controls["govID"];
        const formGroupIndexed = <FormGroup>ids.at(index);
        console.log(formGroupIndexed, "formgroupIndexed");
        formGroupIndexed.controls["idValue"].reset();
      } 
    }

  }

  //AN40085822 13/10/2021 Integrating Multilingual Functionality --Start--
  ngDoCheck(){
    this.fetchLanguageResponse();
    this.assignPattern();
    const id = this.otherDetailsForm.controls['govID'].value;
     id.forEach((resp, index)=>  this.addPatternforGovID(resp.type, index))
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.httpServiceService);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject; 
  }
  //--End--
}

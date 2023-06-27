import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { RegistrarService } from 'app/app-modules/registrar/shared/services/registrar.service';

import { ConfirmationService } from '../app-modules/core/services/confirmation.service';
import { ServicePointService } from './service-point.service';

@Component({
  selector: 'app-service-point',
  templateUrl: './service-point.component.html',
  styleUrls: ['./service-point.component.css']
})
export class ServicePointComponent implements OnInit {

  @ViewChild('f') form: any;

  designation: any;
  vanServicepointDetails: any;
  servicePointsList = [];
  filteredServicePoints = [];
  vansList = [];

  sessionsList = [
    {
      sessionID: 1,
      sessionName: 'Morning'
    },
    {
      sessionID: 2,
      sessionName: 'Evening'
    },
    {
      sessionID: 3,
      sessionName: 'Full Day'
    }
  ]

  showVan = false;

  userId: string;
  serviceProviderId: string;

  servicePointName: string;
  servicePointID: string;
  sessionID: string;
  vanID: string;
  isDisabled = true;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  statesList: any =[];
  districtList: any=[];
  subDistrictList:any=[];
  stateID: any;
  state: any;
  demographicsMaster: any;
  districtID: any;
  blockID: any;
  villageList: any =[];
  districtBranchID: any;
  blockName: any;
  villageName: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private servicePointService: ServicePointService,
    private confirmationService: ConfirmationService,
    private httpServiceService: HttpServiceService,
    private registrarService: RegistrarService
    ) { }

  ngOnInit() {
    this.fetchLanguageResponse();
    this.serviceProviderId = localStorage.getItem('providerServiceID');
    this.userId = localStorage.getItem('userID');
    this.getServicePoint();
    // this.resetLocalStorage();
  }
  
  resetLocalStorage() {
    localStorage.removeItem('sessionID');
    localStorage.removeItem('serviceLineDetails');
    localStorage.removeItem('vanType');
    localStorage.removeItem('location');
    localStorage.removeItem('servicePointID');
    localStorage.removeItem('servicePointName');
    sessionStorage.removeItem('facilityID');
  }

  getServicePoint() {
    this.route.data.subscribe(res => {
      if (res.servicePoints.statusCode == 200 && res.servicePoints.data != null) {
        let data = res.servicePoints.data;
        if (data.UserVanSpDetails)
          this.vanServicepointDetails = data.UserVanSpDetails;
      } else if (res.servicePoints.statusCode == 5002) {
        this.confirmationService.alert(res.servicePoints.errorMessage, 'error');
      } else {
        this.confirmationService.alert(res.servicePoints.errorMessage, 'error');
        this.router.navigate(['/service']);
      }
    }, (err) => {
      this.confirmationService.alert(err, 'error');
    });
  }

  filterVansList() {
    localStorage.setItem('sessionID', this.sessionID);
    this.vansList = [];
    this.filteredServicePoints = [];
    this.vanID = null;
    this.servicePointID = null;
    this.servicePointName = null;
    this.form.controls['van'].reset();
    this.form.controls['servicePointName'].reset();
    
    if (this.vanServicepointDetails)
      this.vansList = this.vanServicepointDetails.filter((item) => {
        if (item.vanSession == '3') {
          return item.vanSession;
        } else {
          return item.vanSession == this.sessionID;
        }
      });

    this.vansList = this.vansList.filter((item, index, self) => {
      return self.findIndex((t) => { return t.vanID == item.vanID; }) == index
    });
    this.servicePointsList = [];
  }

  filterServicePointsList() {
    this.saveVanType();
    let serviceLineDetails = this.vansList.filter((van) => {
      return this.vanID == van.vanID
    })[0];

    localStorage.setItem('serviceLineDetails', JSON.stringify(serviceLineDetails));
    if (serviceLineDetails.facilityID) {
      sessionStorage.setItem('facilityID', serviceLineDetails.facilityID);
    }
    this.servicePointID = null;
    this.servicePointName = null;
    this.filteredServicePoints = [];
    this.isDisabled = false;
    if (this.vanServicepointDetails)
      this.servicePointsList = this.vanServicepointDetails.filter((item) => {
        if (item.vanSession == '3') {
          return item.vanID == this.vanID;
        } else {
          return item.vanID == this.vanID && item.vanSession == this.sessionID;
        }
      });
    this.servicePointsList = this.servicePointsList.filter((item, index, self) => {
      return self.findIndex((t) => { return t.servicePointID == item.servicePointID; }) == index
    });

    this.filteredServicePoints = this.servicePointsList.slice(0, 10);
  }

  /**
* Temporary Solution, some code for workaround will be replaced
*/

  saveVanType() {
    let vanDetail;
    this.vansList.forEach((van) => {
      if (van.vanID == this.vanID) {
        vanDetail = van.vanNoAndType;
      }
    })
    const index = vanDetail.indexOf('- ');
    if (index != -1) {
      localStorage.setItem('vanType', vanDetail.substring(index + 2));
    }

    console.log('van', localStorage.getItem('vanType'));

  }

  filterServicePointVan(searchTerm) {
    if (searchTerm) {
      this.filteredServicePoints = this.servicePointsList.filter(servicePoint => {
        return servicePoint.servicePointName.toLowerCase().startsWith(searchTerm.toLowerCase());
      })
    } else {
      this.filteredServicePoints = this.servicePointsList.slice(0, 10);
    }
  }

  routeToDesignation(designation) {
    console.log('designation',designation);
    
    switch (designation) {
      case "Registrar":
        this.router.navigate(['/registrar/registration']);
        break;
      case "Nurse":
        this.router.navigate(['/common/nurse-worklist']);
        break;
      case "Doctor":
        this.router.navigate(['/common/doctor-worklist']);
        break;
      case "Lab Technician":
        this.router.navigate(['/lab']);
        break;
      case "Pharmacist":
        this.router.navigate(['/pharmacist']);
        break;
      case "Radiologist":
        this.router.navigate(['/common/radiologist-worklist']);
        break;
      case "Oncologist":
        this.router.navigate(['/common/oncologist-worklist']);
        break;
      default:
    }
  }

  getDemographics() {
    let temp = this.servicePointsList.filter(item => item.servicePointName == this.servicePointName);
    if (temp.length > 0) {
      localStorage.setItem('servicePointID', temp[0].servicePointID);
      localStorage.setItem('servicePointName', this.servicePointName);

      this.servicePointService.getMMUDemographics()
        .subscribe((res) => {
          if (res && res.statusCode == 200) {
            this.saveDemographicsToStorage(res.data);
          } else {
            this.locationGathetingIssues();
          }
        });
    } else {
      this.stateID = null;
      this.districtID = null;
      this.blockID = null;
      this.districtBranchID = null;
      this.statesList = [];
      this.districtList = [];
      this.subDistrictList = [];
      this.villageList = [];
      // if(this.form.controls.servicePointName.value !== null )
      // this.confirmationService.alert("Please select a valid service point", "info");
    }
  }

  saveDemographicsToStorage(data) {
    if (data) {
      if (data.stateMaster && data.stateMaster.length >= 1) {
        localStorage.setItem('location', JSON.stringify(data));
        // this.goToWorkList();
        this.statesList = data.stateMaster;
        this.stateID = data.otherLoc.stateID;
        this.fetchDistrictsOnStateSelection(this.stateID);
        this.districtID = null;
        this.blockID = null;
        this.districtBranchID = null;
      } else {
        this.locationGathetingIssues();
      }
    } else {
      this.locationGathetingIssues();
    }
  }

  fetchDistrictsOnStateSelection(stateID) {
    console.log("stateID", stateID);  
    this.registrarService
      .getDistrictList(this.stateID)
      .subscribe((res) => {
        if (res && res.statusCode === 200) {
          this.districtList = res.data;
          this.blockID = null;
          this.districtBranchID = null;
        } else {
          this.confirmationService.alert(
            this.currentLanguageSet.alerts.info.IssuesInFetchingDemographics,
            "error"
          );
        }
      });
  }

  fetchSubDistrictsOnDistrictSelection(districtID) {
    this.registrarService
    .getSubDistrictList(this.districtID.districtID)
    .subscribe((res) => {
      if (res && res.statusCode === 200) {
        this.subDistrictList = res.data;
        this.districtBranchID = null;
      } else {
        this.confirmationService.alert(
          this.currentLanguageSet.alerts.info.IssuesInFetchingDemographics,
          "error"
        );
      }
    });
  }


  onSubDistrictChange(blockID) {
    this.registrarService
      .getVillageList(this.blockID.blockID)
      .subscribe((res) => {
        if (res && res.statusCode === 200) {
          this.villageList = res.data;
          this.districtBranchID = null;
        } else {
          this.confirmationService.alert(
            this.currentLanguageSet.alerts.info
              .IssuesInFetchingLocationDetails,
            "error"
          );
        }
      });
  }

  saveLocationDataToStorage(){
    var locationData = {
      stateID: this.stateID,
      // stateName : this.stateName,
      districtID: this.districtID.districtID,
      districtName: this.districtID.districtName,
      blockName: this.blockID.blockName,
      blockID: this.blockID.blockID,
      subDistrictID: this.districtBranchID.districtBranchID,
      villageName: this.districtBranchID.villageName
    };

    // Convert the object into a JSON string
    var locationDataJSON = JSON.stringify(locationData);

    // Store the JSON string in localStorage
    localStorage.setItem("locationData", locationDataJSON);
    this.goToWorkList();

  }

  goToWorkList() {
    this.designation = localStorage.getItem('designation');
    this.routeToDesignation(this.designation);
  }

  locationGathetingIssues() {
    this.confirmationService.alert('Issues in getting your location, Please try to re-login.', 'error');
  }

  //AN40085822 13/10/2021 Integrating Multilingual Functionality --Start--
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

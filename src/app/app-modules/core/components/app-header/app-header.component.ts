import { Component, OnInit, Input, Output, Optional, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { ConfirmationService } from "../../services/confirmation.service";
import { environment } from 'environments/environment';
import { MdDialog, MdDialogRef } from '@angular/material';
import { ShowCommitAndVersionDetailsComponent } from './../show-commit-and-version-details/show-commit-and-version-details.component'
import { IotBluetoothComponent } from '../iot-bluetooth/iot-bluetooth.component';
import { IotService } from "../../services/iot.service";
import { HttpServiceService } from "../../services/http-service.service";

@Component({
  selector: "app-header",
  templateUrl: "./app-header.component.html",
  styleUrls: ["./app-header.component.css"]
})
export class AppHeaderComponent implements OnInit {
  navigation = [
    {
      role: "Registrar",
      work: [
        { link: "/registrar/registration", label: "Registration" },
        { link: "/registrar/search", label: "Search" }
      ]
    },
    { role: "Nurse", link: "/common/nurse-worklist", label: "Nurse" },
    { role: "Doctor", link: "/common/doctor-worklist", label: "Doctor" },
    { role: "Lab Technician", link: "/lab/worklist", label: "Lab Technician" },
    {
      role: "Pharmacist",
      link: "/pharmacist/pharmacist-worklist",
      label: "Pharmacist"
    },
    {
      role: "Radiologist",
      link: "/common/radiologist-worklist",
      label: "Radiologist"
    },
    {
      role: "Oncologist",
      link: "/common/oncologist-worklist",
      label: "Oncologist"
    },
    { role: "DataSync", link: "/datasync", label: "Data Sync" },
    { role: 'Reports', link: '/common/reports', label: 'Reports' }
  ];
  // @Input('isDarkTheme')
  // isDarkTheme: Boolean;
  language_file_path: any = "./assets/";
  app_language: any = "English";
  currentLanguageSet: any;
  languageArray: any;
  @Input("showRoles")
  showRoles: boolean;

  // @Output()
  // dark: EventEmitter <Boolean> = new EventEmitter<Boolean>();

  servicePoint: string;
  userName: string;
  isAuthenticated: boolean;
  roles: any;
  helpURL: string = environment.licenseURL;
  filteredNavigation: any;
  isConnected:Boolean=true;
  status: string;
  constructor(
    private dialog: MdDialog,
    private router: Router,
    private auth: AuthService,
    private confirmationService: ConfirmationService,
    public service: IotService,
    private http_service: HttpServiceService
  ) { }

  ngOnInit() {
    this.service.disconnectValue$.subscribe((response) => {
      response === undefined
        ? (this.isConnected = false)
        : (this.isConnected = response);
    });
    this.getUIVersionAndCommitDetails();
    this.servicePoint = localStorage.getItem("servicePointName");
    this.userName = localStorage.getItem("userName");
    this.isAuthenticated =
      sessionStorage.getItem("isAuthenticated") == "true" ? true : false;
    if (this.showRoles) {
      this.roles = JSON.parse(localStorage.getItem("role"));
      this.filteredNavigation = this.navigation.filter(item => {
        return this.roles.includes(item.role);
      });
    }
    if (this.isAuthenticated) {
      this.fetchLanguageSet();
    }
    console.log(this.filteredNavigation, "filter");
    this.status = localStorage.getItem('providerServiceID');
  }

  DataSync() {
    this.router.navigate(["/datasync"]);
  }
  fetchLanguageSet() {
    this.http_service.fetchLanguageSet().subscribe(languageRes => {
      if (languageRes !== undefined && languageRes !== null) {
      this.languageArray = languageRes;
      this.getLanguage();
      }
    })
    console.log("language array" + this.languageArray);

  }
  changeLanguage(language) {
    
    this.http_service.getLanguage(this.language_file_path+language+".json").subscribe(response => {
      if(response !== undefined && response !== null){
        this.languageSuccessHandler(response,language)
      }else{
        alert(this.currentLanguageSet.alerts.info.langNotDefinesd)
      }      
    },error => {
      alert(this.currentLanguageSet.alerts.info.comingUpWithThisLang + " " + language);
      
    }
    );
  }
  getLanguage() {
    if (sessionStorage.getItem('setLanguage') != null) {
      this.changeLanguage(sessionStorage.getItem('setLanguage'));
    } else {
      this.changeLanguage(this.app_language);
    }
  }

  
  languageSuccessHandler(response, language) {
    console.log("language is ", response);
    if (response == undefined) {
      alert(this.currentLanguageSet.alerts.info.langNotDefinesd)
    }

    if (response[language] != undefined) {
      this.currentLanguageSet = response[language];
      sessionStorage.setItem('setLanguage', language);
      if (this.currentLanguageSet) {
        this.languageArray.forEach(item => {
          if (item.languageName == language) {
            this.app_language = language;
          
          }

        });
      } else {
        this.app_language = language;
      }
     
      this.http_service.getCurrentLanguage(response[language]);
      this.rolenavigation();
    } else {
      alert(this.currentLanguageSet.alerts.info.comingUpWithThisLang + " " + language);
    }
  }
  logout() {
    this.auth.logout().subscribe(res => {
      this.router.navigate(["/login"]).then(result => {
        if (result) {
          this.changeLanguage('English');
          localStorage.clear();
          sessionStorage.clear();
        }
      });
    });
  }
  rolenavigation() {
    this.navigation = [
      {
        role: "Registrar",
        label: this.currentLanguageSet.role_selection.Registrar,

        work: [
          { link: "/registrar/registration", label: this.currentLanguageSet.ro.registration },
          { link: "/registrar/search", label: this.currentLanguageSet.common.search },

        ]

      },
      { role: "Nurse", link: "/common/nurse-worklist", label: this.currentLanguageSet.role_selection.Nurse },
      { role: "Doctor", link: "/common/doctor-worklist", label: this.currentLanguageSet.role_selection.Doctor },
      { role: "Lab Technician", link: "/lab/worklist", label: this.currentLanguageSet.role_selection.LabTechnician },
      {
        role: "Pharmacist",
        link: "/pharmacist/pharmacist-worklist",
        label: this.currentLanguageSet.role_selection.Pharmacist
      },
      {
        role: "Radiologist",
        link: "/common/radiologist-worklist",
        label: this.currentLanguageSet.role_selection.Radiologist
      },
      {
        role: "Oncologist",
        link: "/common/oncologist-worklist",
        label: this.currentLanguageSet.role_selection.Oncologist
      },
      { role: "DataSync", link: "/datasync", label: this.currentLanguageSet.common.dataSync}
    ];
    if (this.showRoles) {
      this.roles = JSON.parse(localStorage.getItem("role"));
      if (this.roles !== undefined && this.roles !== null) {
        this.filteredNavigation = this.navigation.filter(item => {
          return this.roles.includes(item.role);
        });
      }
    }
  }
  commitDetailsUI: any;
  versionUI: any
  getUIVersionAndCommitDetails() {
    let commitDetailsPath: any = "assets/git-version.json";
    this.auth.getUIVersionAndCommitDetails(commitDetailsPath).subscribe((res) => {
      console.log('res', res);
      this.commitDetailsUI = res
      this.versionUI = this.commitDetailsUI['version']
    }, err => {
      console.log('err', err);

    })
  }
  showVersionAndCommitDetails() {
    this.auth.getAPIVersionAndCommitDetails().subscribe((res) => {
      if (res.statusCode == 200) {
        this.constructAPIAndUIDetails(res.data);
      } else {
      }
    }, err => {
    })
  }
  constructAPIAndUIDetails(apiVersionAndCommitDetails) {
    let data = {
      commitDetailsUI: {
        version: this.commitDetailsUI['version'],
        commit: this.commitDetailsUI['commit']
      },
      commitDetailsAPI: {
        version: apiVersionAndCommitDetails['git.build.version'] || 'NA',
        commit: apiVersionAndCommitDetails['git.commit.id'] || 'NA'
      }
    }
    if (data) {
      this.showData(data)
    }
  }
  showData(versionData) {
    let dialogRef = this.dialog.open(ShowCommitAndVersionDetailsComponent, {
      data: versionData
    });

  }

  openIOT(){
    let dialogRef = this.dialog.open(IotBluetoothComponent, {
      width:"600px"
    });
  }
}

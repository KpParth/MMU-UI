import { Component, OnInit, Inject, Injector, DoCheck } from "@angular/core";
import { DataSyncService } from "../../../data-sync/shared/service/data-sync.service";
import { ConfirmationService } from "app/app-modules/core/services";
import { Router } from "@angular/router";
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from "@angular/material";
import { HttpServiceService } from "../../services/http-service.service";
import { SetLanguageComponent } from "app/app-modules/core/components/set-language.component";
import * as CryptoJS from 'crypto-js';

@Component({
  selector: "app-data-sync-login",
  templateUrl: "./data-sync-login.component.html",
  styleUrls: ["./data-sync-login.component.css"],
  providers: [DataSyncService],
})
export class DataSyncLoginComponent implements OnInit, DoCheck {
  userName: string;
  password: string;

  dynamictype = "password";
  dialogRef: any;
  data: any;
  showProgressBar: Boolean = false;
  current_language_set: any;
  encryptedVar: any;
  key: any;
  iv: any;
  SALT: string = "RandomInitVector";
  Key_IV: string = "Piramal12Piramal";
  encPassword: string;
  _keySize: any;
  _ivSize: any;
  _iterationCount: any;

  constructor(
    private router: Router,
    private dataSyncService: DataSyncService,
    private injector: Injector,
    public httpServiceService: HttpServiceService,
    private confirmationService: ConfirmationService
  ) {
    this._keySize = 256;
    this._ivSize = 128;
    this._iterationCount = 1989;
  }

  ngOnInit() {
    this.assignSelectedLanguage();
    this.dialogRef = this.injector.get(MdDialogRef, null);
    this.data = this.injector.get(MD_DIALOG_DATA, null);
  }

  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
  }

  showPWD() {
    this.dynamictype = "text";
  }

  hidePWD() {
    this.dynamictype = "password";
  }

  get keySize() {
    return this._keySize;
  }
  
  set keySize(value) {
    this._keySize = value;
  }
  
  
  
  get iterationCount() {
    return this._iterationCount;
  }
  
  
  
  set iterationCount(value) {
    this._iterationCount = value;
  }
  
  
  
  generateKey(salt, passPhrase) {
    return CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt), {
      keySize: this.keySize / 32,
      iterations: this._iterationCount
    })
  }
  
  
  
  encryptWithIvSalt(salt, iv, passPhrase, plainText) {
    let key = this.generateKey(salt, passPhrase);
    let encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: CryptoJS.enc.Hex.parse(iv)
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  }
  
  encrypt(passPhrase, plainText) {
    let iv = CryptoJS.lib.WordArray.random(this._ivSize / 8).toString(CryptoJS.enc.Hex);
    let salt = CryptoJS.lib.WordArray.random(this.keySize / 8).toString(CryptoJS.enc.Hex);
    let ciphertext = this.encryptWithIvSalt(salt, iv, passPhrase, plainText);
    return salt + iv + ciphertext;
  }
  

  // checkCurrentUser(){
  //   if(this.userName != localStorage.getItem('username')){
  //     this.confirmationService.alert('Username you entered not matched the current user')
  //     this.userName = null;
  //   }
  // }

  /*ADID: KA40094929 Karyamsetty Helen Grace 
   added a concurrent login changes
  */
  dataSyncLogin() {
    this.showProgressBar = true;
    let encriptPassword = this.encrypt(this.Key_IV, this.password)

    if (this.userName && this.password) {
      this.dataSyncService
        .dataSyncLogin(this.userName, encriptPassword, false)
        .subscribe(
          (res) => {
            if (res.statusCode === 200) {
              if (res.data && res.data != null && res.data != undefined) {
                let mmuService = res.data.previlegeObj.filter((item) => {
                  return item.serviceName == "MMU";
                });
                if (
                  mmuService !== undefined &&
                  mmuService !== null &&
                  mmuService.length > 0
                ) {
                  this.showProgressBar = false;
                  localStorage.setItem("serverKey", res.data.key);
                  this.getDataSyncMMU(res);
                } else {
                  this.showProgressBar = false;
                  localStorage.removeItem("serverKey");
                  this.confirmationService.alert(
                    "User doesn't have previlege to perform this activity. Please contact administrator."
                  );
                }
              } else {
                this.confirmationService.alert(
                  "Seems you are logged in from somewhere else, Logout from there & try back in.",
                  "error"
                );
              }
            } else if (res.statusCode === 5002) {
              if (
                res.errorMessage ===
                "You are already logged in,please confirm to logout from other device and login again"
              ) {
                this.confirmationService
                  .confirm("info", res.errorMessage)
                  .subscribe((confirmResponse) => {
                    if (confirmResponse) {
                      this.dataSyncService
                        .userlogoutPreviousSession(this.userName)
                        .subscribe((userlogoutPreviousSession) => {
                          if (userlogoutPreviousSession.statusCode === 200) {
                            this.dataSyncService
                              .dataSyncLogin(this.userName, encriptPassword, true)
                              .subscribe((userLoggedIn) => {
                                if (userLoggedIn.statusCode === 200) {
                                  if (
                                    userLoggedIn.data &&
                                    userLoggedIn.data != null &&
                                    userLoggedIn.data != undefined
                                  ) {
                                    userLoggedIn.data.previlegeObj.forEach(
                                      (item) => {
                                        if (
                                          item.roles[0]
                                            .serviceRoleScreenMappings[0] !==
                                            undefined &&
                                          item.roles[0]
                                            .serviceRoleScreenMappings[0] !==
                                            null &&
                                          item.roles[0]
                                            .serviceRoleScreenMappings[0]
                                            .providerServiceMapping.serviceID !=
                                            undefined &&
                                          item.roles[0]
                                            .serviceRoleScreenMappings[0]
                                            .providerServiceMapping.serviceID !=
                                            null &&
                                          item.roles[0]
                                            .serviceRoleScreenMappings[0]
                                            .providerServiceMapping.serviceID !=
                                            "2"
                                        ) {
                                          localStorage.removeItem("serverKey");
                                          this.confirmationService.alert(
                                            "User doesn't have previlege to perform this activity. Please contact administrator."
                                          );
                                          this.showProgressBar = false;
                                        } else {
                                          this.showProgressBar = false;
                                          localStorage.setItem(
                                            "serverKey",
                                            userLoggedIn.data.key
                                          );
                                          this.getDataSyncMMU(userLoggedIn);
                                          this.showProgressBar = false;
                                        }
                                      }
                                    );
                                  } else {
                                    this.confirmationService.alert(
                                      "Seems you are logged in from somewhere else, Logout from there & try back in.",
                                      "error"
                                    );
                                    this.showProgressBar = false;
                                  }
                                } else {
                                  this.confirmationService.alert(
                                    userLoggedIn.errorMessage,
                                    "error"
                                  );
                                  this.showProgressBar = false;
                                }
                              });
                          } else {
                            this.confirmationService.alert(
                              userlogoutPreviousSession.errorMessage,
                              "error"
                            );
                            this.showProgressBar = false;
                          }
                        });
                    } else {
                      //sessionStorage.clear();
                      this.showProgressBar = false;
                      //this.router.navigate(["/dataSyncLogin"]);
                      // this.confirmationService.alert(res.errorMessage, 'error');
                    }
                  });
              } else {
                this.confirmationService.alert(res.errorMessage, "error");
                this.showProgressBar = false;
              }
            } else {
              this.confirmationService.alert(res.errorMessage, "error");
              this.showProgressBar = false;
              sessionStorage.setItem(
                "authorizeToViewTMcasesheet",
                "NotAuthorized"
              );
            }
          },
          (err) => {
            this.confirmationService.alert(err.errorMessage, "error");
            this.showProgressBar = false;
          }
        );
    } else {
      this.confirmationService.alert(
        this.current_language_set.alerts.info.usernamenPass
      );
      this.showProgressBar = false;
    }
  }

  //added get datasync data on login to a new method
  getDataSyncMMU(res) {
    if (
      (this.data && this.data.masterDowloadFirstTime) ||
      (this.data && this.data.provideAuthorizationToViewTmCS)
    ) {
      let mmuService = res.data.previlegeObj.filter((item) => {
        return item.serviceName == "MMU";
      });
      // sessionStorage.setItem("key", res.data.key);
      localStorage.setItem(
        "dataSyncProviderServiceMapID",
        mmuService[0].providerServiceMapID
      );
      if (this.data.provideAuthorizationToViewTmCS) {
        sessionStorage.setItem("authorizeToViewTMcasesheet", "Authorized");
      } else {
        console.log("normal flow");
      }
      this.dialogRef.close(true);
    } else {
      this.showProgressBar = false;
      sessionStorage.setItem("authorizeToViewTMcasesheet", "NotAuthorized");
      this.router.navigate(["/datasync/workarea"]);
    }
  }

  closeDialog() {
    sessionStorage.setItem("authorizeToViewTMcasesheet", "NotAuthorized");
    this.dialogRef.close(false);
  }
}

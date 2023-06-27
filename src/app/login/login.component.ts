import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../app-modules/core/services';
import { ConfirmationService } from '../app-modules/core/services/confirmation.service';

import { MdDialog, MdDialogRef } from '@angular/material';

import { DataSyncLoginComponent } from '../app-modules/core/components/data-sync-login/data-sync-login.component';
import { MasterDownloadComponent } from '../app-modules/data-sync/master-download/master-download.component';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-login-cmp',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userName: any;
  password: any;
  dynamictype = 'password';
  encryptedVar: any;
  key: any;
  iv: any;
  SALT: string = "RandomInitVector";
  Key_IV: string = "Piramal12Piramal";
  encPassword: string;
  _keySize: any;
  _ivSize: any;
  _iterationCount: any;

  @ViewChild('focus') private elementRef: ElementRef;  

  constructor(
    private router: Router,
    private dialog: MdDialog,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) {
    this._keySize = 256;
    this._ivSize = 128;
    this._iterationCount = 1989;
   }

  ngOnInit() {
    if (sessionStorage.getItem('isAuthenticated')) {
      this.authService.validateSessionKey()
        .subscribe(res => {
          if (res && res.statusCode == 200 && res.data)
            this.router.navigate(['/service']);
        })
    } else {
      sessionStorage.clear();
    }
  }
  public ngAfterViewInit(): void {
    this.elementRef.nativeElement.focus();
  } 

  login() {
   let encryptPassword = this.encrypt(this.Key_IV, this.password)

    if(this.userName !=undefined && this.userName !=null && this.password !=undefined && this.password !=null)
    {
    this.authService.login(this.userName.trim(), encryptPassword, false)
      .subscribe(res => {
        if (res.statusCode == 200) {
          if (res.data.previlegeObj && res.data.previlegeObj[0]) {
            localStorage.setItem('loginDataResponse', JSON.stringify(res.data));
            this.getServicesAuthdetails(res.data);
          } else {
            this.confirmationService.alert('Seems you are logged in from somewhere else, Logout from there & try back in.', 'error');
          }
        } else if (res.statusCode === 5002) {
          if(res.errorMessage === 'You are already logged in,please confirm to logout from other device and login again') {
        this.confirmationService.confirm('info', res.errorMessage).subscribe((confirmResponse) => {
          if(confirmResponse) {
            this.authService.userlogoutPreviousSession(this.userName).subscribe((userlogoutPreviousSession) => {
              if (userlogoutPreviousSession.statusCode === 200) {
            this.authService.login(this.userName, encryptPassword, true).subscribe((userLoggedIn) => {
              if (userLoggedIn.statusCode === 200) {
              if (userLoggedIn.data.previlegeObj && userLoggedIn.data.previlegeObj[0] && userLoggedIn.data.previlegeObj != null && userLoggedIn.data.previlegeObj != undefined) {
                localStorage.setItem('loginDataResponse', JSON.stringify(userLoggedIn.data));
                this.getServicesAuthdetails(userLoggedIn.data);
              } else {
                this.confirmationService.alert('Seems you are logged in from somewhere else, Logout from there & try back in.', 'error');
              }
            }
            else {
              this.confirmationService.alert(userLoggedIn.errorMessage, 'error');
            }  
            })
          }

          else {

            this.confirmationService.alert(userlogoutPreviousSession.errorMessage, 'error');
          }
        });
      }
        else {
          sessionStorage.clear();
          this.router.navigate(["/login"]);
          // this.confirmationService.alert(res.errorMessage, 'error');
        }
      });
      }
      else {
        this.confirmationService.alert(res.errorMessage, 'error');
      }
    }
    }, err => {
      this.confirmationService.alert(err, 'error');
    });
  }
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

  getServicesAuthdetails(loginDataResponse) {
    
    sessionStorage.setItem('key', loginDataResponse.key);
    sessionStorage.setItem('isAuthenticated', loginDataResponse.isAuthenticated);
    localStorage.setItem('userID', loginDataResponse.userID);
    localStorage.setItem('userName', loginDataResponse.userName);
    localStorage.setItem('username', this.userName);
    localStorage.setItem('fullName', loginDataResponse.fullName);
    // this.saveServiceID(loginDataResponse);
    const services = [];
    loginDataResponse.previlegeObj.map(item => {
      if (item.roles[0].serviceRoleScreenMappings[0].providerServiceMapping.serviceID == '2') {
        let service = {
          'providerServiceID': item.serviceID,
          'serviceName': item.serviceName,
          'apimanClientKey': item.apimanClientKey,
          'serviceID': item.roles[0].serviceRoleScreenMappings[0].providerServiceMapping.serviceID
        }
        services.push(service)
      }
    })
    if (services.length > 0) {
      localStorage.setItem('services', JSON.stringify(services));
      if (loginDataResponse.Status.toLowerCase() == 'new') {
        this.router.navigate(['/set-security-questions'])
      }
      else {
        this.router.navigate(['/service']);
      }
    } else {
      this.confirmationService.alert('User doesn\'t have previlege to access the application');
    }
  }

  showPWD() {
    this.dynamictype = 'text';
  }

  hidePWD() {
    this.dynamictype = 'password';
  }

  loginDialogRef: MdDialogRef<DataSyncLoginComponent>;
  openDialog() {
    this.loginDialogRef = this.dialog.open(DataSyncLoginComponent, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: 'fit-screen',
      backdropClass: 'backdrop',
      position: { top: "20px" },
      data: {
        masterDowloadFirstTime: true
      }
    });

    this.loginDialogRef.afterClosed()
      .subscribe(flag => {
        if (flag) {
          this.dialog.open(MasterDownloadComponent, {
            hasBackdrop: true,
            disableClose: true,
            panelClass: 'fit-screen',
            backdropClass: 'backdrop',
            position: { top: "20px" },
          }).afterClosed().subscribe(() => {
            sessionStorage.clear();
            localStorage.clear();
          });
        }
      })
  }

  //  saveServiceID(obj) {
  //   // console.log(obj,'objhere')
  //   const privilegeObject = obj.previlegeObj;
  //   const mmuObject = privilegeObject.filter(item => item.serviceName == 'MMU');
  //   const tmObject = privilegeObject.filter(item => item.serviceName == 'TM');
  //   // console.log(mmuObject,'cdv' ,tmObject)
  //   let mmuServiceID;
  //   let tmServiceID;
  //   if (mmuObject.length) { mmuServiceID = this.getServiceID(mmuObject[0].roles[0]); }
  //   if (tmObject.length) { tmServiceID = this.getServiceID(tmObject[0].roles[0]); }
  //   console.log(mmuServiceID, tmServiceID)
  //   localStorage.setItem('serviceIDs', JSON.stringify({
  //     mmuServiceID,
  //     tmServiceID
  //   }))
  // }
  // getServiceID(role) {
  //   const serviceRoleMapping = role.serviceRoleScreenMappings[0];
  //   if (serviceRoleMapping) {
  //     return serviceRoleMapping.providerServiceMapping.serviceID;
  //   }

  // }

}

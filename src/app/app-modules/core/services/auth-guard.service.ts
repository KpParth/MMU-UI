import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/app-modules/core/services';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute) { }

  canActivate(route, state) {
    return this.auth.validateSessionKey()
      .map(res => {
        if (res && res.statusCode == 200 && res.data) {
          return true;
        }
        else {
          let componentName = route.component ? route.component.name : "";
          // alert("you are not authorised to view this page" + componentName);
          this.router.navigate(['/login']);
          return false;
        }
      });
  }

  // canActivateChild() {
  //   if (sessionStorage.getItem('isAuthenticated'))
  //     return true;
  //   else {
  //     this.router.navigate(['/login']);
  //   }
  // }

}

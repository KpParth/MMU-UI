import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService } from './../../core/services/confirmation.service';

@Component({
    selector: 'app-redir-in',
    templateUrl: './redir-in.component.html',
    styleUrls: ['./redir-in.component.css']
})
export class RedirInComponent implements OnInit {

    constructor(private router: Router,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService, ) { }

    ngOnInit() {
        this.getresponse();

        // this.routeToDesignation(localStorage.getItem('designation'));
    }

    getresponse() {
        let resolve;
        let language;
        this.route.queryParams.subscribe(params => {
            resolve = params['resolve'] === 'undefined' ? undefined : params['resolve'];
            language = params['currentLanguage'] === 'undefined' ? 'English' : params['currentLanguage'];
        });
        console.log('resolve', resolve);
        sessionStorage.setItem('setLanguage',language);
        if (resolve) {

            this.confirmationService.alert('Items Dispensed', 'info');
          }
          this.router.navigate(['/pharmacist/pharmacist-worklist'])

    }

    routeToDesignation(designation) {
        switch (designation) {
            case 'Registrar':
                this.router.navigate(['/registrar/registration']);
                break;
            case 'Nurse':
                this.router.navigate(['/common/nurse-worklist']);
                break;
            case 'Doctor':
                this.router.navigate(['/common/doctor-worklist']);
                break;
            case 'Lab Technician':
                this.router.navigate(['/lab']);
                break;
            case 'Pharmacist':
                this.router.navigate(['/pharmacist']);
                break;
            case 'Radiologist':
                this.router.navigate(['/common/radiologist-worklist']);
                break;
            case 'Oncologist':
                this.router.navigate(['/common/oncologist-worklist']);
                break;
            default:
        }
    }


}

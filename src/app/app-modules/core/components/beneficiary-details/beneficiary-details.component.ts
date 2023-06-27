import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BeneficiaryDetailsService } from '../../services/beneficiary-details.service';
import 'rxjs/Rx';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';

@Component({
  selector: 'app-beneficiary-details',
  templateUrl: './beneficiary-details.component.html',
  styleUrls: ['./beneficiary-details.component.css']
})
export class BeneficiaryDetailsComponent implements OnInit, DoCheck {

  beneficiary: any;
  today: any;
  beneficiaryDetailsSubscription: any;
  current_language_set: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public httpServiceService: HttpServiceService,
    private beneficiaryDetailsService: BeneficiaryDetailsService
  ) { }

  ngOnInit() {
    this.assignSelectedLanguage();
    this.today = new Date();
    this.route.params.subscribe(param => {
      this.beneficiaryDetailsService.getBeneficiaryDetails(param['beneficiaryRegID'], localStorage.getItem('benFlowID'));
      this.beneficiaryDetailsSubscription = this.beneficiaryDetailsService.beneficiaryDetails$
        .subscribe(res => {
          if (res != null) {
            this.beneficiary = res;
           if (res.serviceDate) {
             this.today = res.serviceDate;
           }
          }
        });

      this.beneficiaryDetailsService.getBeneficiaryImage(param['beneficiaryRegID'])
        .subscribe(data => {
          if (data && data.benImage) {
            this.beneficiary.benImage = data.benImage;
          }
        });
    });
  }

  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
    }
    
  ngOnDestroy() {
    if (this.beneficiaryDetailsSubscription)
      this.beneficiaryDetailsSubscription.unsubscribe();
  }

}

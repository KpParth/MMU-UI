import { Component, OnInit, DoCheck } from '@angular/core';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';

@Component({
  selector: 'app-footer',
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.css']
})
export class AppFooterComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  status: boolean;
  isSpecialist: Boolean = false;
  constructor(public httpServiceService: HttpServiceService) { }
  year:any;
  today:Date;
  ngOnInit() {
    this.assignSelectedLanguage();
    this.today = new Date();
    this.year = this.today.getFullYear();
    console.log('inside footer',this.year);
    setInterval(() => {
      this.status = navigator.onLine;
    }, 1000);
  }

  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.currentLanguageSet = getLanguageJson.currentLanguageObject;
    }

}

import { Component, OnInit, Inject } from '@angular/core';
import { MD_DIALOG_DATA, MdDialogRef } from '@angular/material';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-view-test-report',
  templateUrl: './view-test-report.component.html',
  styleUrls: ['./view-test-report.component.css']
})
export class ViewTestReportComponent implements OnInit {
  current_language_set: any;

  constructor( @Inject(MD_DIALOG_DATA) public data: any,
   public mdDialogRef: MdDialogRef<ViewTestReportComponent>,private httpServiceService:HttpServiceService ) { }

  testReport=[];
  ngOnInit() {
    console.log('data', this.data)
  this.testReport = this.data;
  console.log('this.testReport ',this.testReport );
  
  }
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
    }
}

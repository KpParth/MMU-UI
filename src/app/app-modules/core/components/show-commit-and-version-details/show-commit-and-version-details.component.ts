import { Component, OnInit, Inject, DoCheck } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';

@Component({
  selector: 'app-show-commit-and-version-details',
  templateUrl: './show-commit-and-version-details.component.html',
  styleUrls: ['./show-commit-and-version-details.component.css']
})
export class ShowCommitAndVersionDetailsComponent implements OnInit, DoCheck {

  current_language_set: any;
  
  constructor(@Inject(MD_DIALOG_DATA) public input: any,
    public httpServiceService: HttpServiceService,
    public dialogRef: MdDialogRef<ShowCommitAndVersionDetailsComponent>,) { }

  ngOnInit() {
    this.assignSelectedLanguage();
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

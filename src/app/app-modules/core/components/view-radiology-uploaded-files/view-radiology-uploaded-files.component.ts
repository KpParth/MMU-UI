import { Component, OnInit, Inject, DoCheck } from '@angular/core';
import { MD_DIALOG_DATA, MdDialogRef } from '@angular/material';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';

@Component({
  selector: 'app-view-radiology-uploaded-files',
  templateUrl: './view-radiology-uploaded-files.component.html',
  styleUrls: ['./view-radiology-uploaded-files.component.css']
})
export class ViewRadiologyUploadedFilesComponent implements OnInit, DoCheck {
  current_language_set: any;
  fileIds = [];
  constructor(
   @Inject(MD_DIALOG_DATA) public input: any,
   public httpServiceService: HttpServiceService,
   private dialogRef:MdDialogRef<ViewRadiologyUploadedFilesComponent>) { }

  ngOnInit() {
    this.assignSelectedLanguage();
    if (this.input && this.input.filesDetails !== undefined) {
      this.getFilesDetails(this.input.filesDetails);
    }
  }
  
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
    }

  getFilesDetails(filesDetails) {
    this.fileIds = filesDetails
  }
  openFileContent(fileID) {
    this.dialogRef.close(fileID);
  }
}

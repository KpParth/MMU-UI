import { Component, OnInit, Input, Inject, DoCheck } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { HttpServiceService } from '../../services/http-service.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';

@Component({
  selector: 'app-previous-details',
  templateUrl: './previous-details.component.html',
  styleUrls: ['./previous-details.component.css']
})
export class PreviousDetailsComponent implements OnInit, DoCheck {

  dataList = [];
  filteredDataList = [];
  columnList = [];
  current_language_set: any;

  constructor(
    public dialogRef: MdDialogRef<PreviousDetailsComponent>,
    public httpServiceService: HttpServiceService,
    @Inject(MD_DIALOG_DATA) public input: any) { }

  ngOnInit() {
    this.assignSelectedLanguage();
    if (this.input.dataList.data instanceof Array){
      this.dataList = this.input.dataList.data;
      this.filteredDataList = this.dataList.slice();
    }
    if (this.input.dataList.columns instanceof Array)
      this.columnList = this.input.dataList.columns;
  }

  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
    }

  filterPreviousData(searchTerm) {
    console.log("searchTerm", searchTerm);
    if (!searchTerm)
      this.filteredDataList = this.dataList;
    else {
      this.filteredDataList = [];
      this.dataList.forEach((item) => {
        for (let key in item) {
          let value: string = '' + item[key];
          if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
            this.filteredDataList.push(item); break;
          }
        }
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { ViewTestReportComponent } from './view-test-report/view-test-report.component';
import { LabService } from '../../../../lab/shared/services';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { DoctorService } from '../../../shared/services';
import { ViewRadiologyUploadedFilesComponent } from "../../../../core/components/view-radiology-uploaded-files/view-radiology-uploaded-files.component";
import { environment } from 'environments/environment';
import { IdrsscoreService } from 'app/app-modules/nurse-doctor/shared/services/idrsscore.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { TestInVitalsService } from 'app/app-modules/nurse-doctor/shared/services/test-in-vitals.service';

@Component({
  selector: 'app-test-and-radiology',
  templateUrl: './test-and-radiology.component.html',
  styleUrls: ['./test-and-radiology.component.css']
})
export class TestAndRadiologyComponent implements OnInit {
  current_language_set: any;

  constructor(private doctorService: DoctorService,
    private dialog: MdDialog,
    private labService: LabService,
    private confirmationService: ConfirmationService,
    private idrsScoreService: IdrsscoreService,
    private httpServiceService:HttpServiceService,
    private testInVitalsService: TestInVitalsService ) { }

  currentLabRowsPerPage = 5;
  currentLabActivePage = 1;
  previousLabRowsPerPage = 5;
  previousLabActivePage = 1;
  rotate = true;
  beneficiaryRegID: any;
  visitID: any;
  visitCategory: any;
  vitalsRBSResp: any = null;

  ngOnInit() {
    this.testInVitalsService.clearVitalsRBSValueInReports();
    this.testInVitalsService.clearVitalsRBSValueInReportsInUpdate();
    this.beneficiaryRegID = localStorage.getItem('beneficiaryRegID');
    this.visitID = localStorage.getItem('visitID');
    this.visitCategory = localStorage.getItem('visitCategory');
    // this.getTestResults(this.beneficiaryRegID, this.visitID, this.visitCategory);

  
    this.testInVitalsService.vitalRBSTestResult$.subscribe(response => {
      if(response.visitCode)
      {
         if(response.rbsTestResult)
        {
        this.vitalsRBSResp = null;
         this.vitalsRBSResp={
          "prescriptionID": null,
          "procedureID": null,
          "createdDate": response.createdDate,
          "procedureName": "RBS Test",
          "procedureType": "Laboratory",
          "componentList": [
            {
              "testResultValue": response.rbsTestResult,
              "remarks": response.rbsTestRemarks,
              "fileIDs": [
                null
              ],
              "testResultUnit": "mg/dl",
              "testComponentID": null,
              "componentName": null
            }
          ]
         };
  
       
            }
  
        this.getTestResults(this.beneficiaryRegID, this.visitID, this.visitCategory);

  
    }
  
   });

   this.testInVitalsService.vitalRBSTestResultInUpdate$.subscribe(vitalsresp => {

    this.checkRBSResultInVitalsUpdate(vitalsresp);
});

  }
  ngOnDestroy() {
    if (this.testResultsSubscription)
      this.testResultsSubscription.unsubscribe();
  }
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
    }


    checkRBSResultInVitalsUpdate(vitalsresp)
  {
    if(vitalsresp.rbsTestResult)
    {
     let vitalsRBSResponse = null;
     vitalsRBSResponse={
          "prescriptionID": null,
          "procedureID": null,
          "createdDate": vitalsresp.createdDate,
          "procedureName": "RBS Test",
          "procedureType": "Laboratory",
          "componentList": [
            {
              "testResultValue": vitalsresp.rbsTestResult,
              "remarks": vitalsresp.rbsTestRemarks,
              "fileIDs": [
                null
              ],
              "testResultUnit": "mg/dl",
              "testComponentID": null,
              "componentName": null
            }
          ]
         };
  
      this.labResults.forEach((element,index)=>{
        if(element.procedureName === "RBS Test" && element.procedureID === null) 
                    this.labResults.splice(index,1);
     });
  
    //  this.labResults.push(vitalsRBSResponse);
     this.labResults=[vitalsRBSResponse].concat(this.labResults);
     this.filteredLabResults = this.labResults;

     this.currentLabPageChanged({
      page: this.currentLabActivePage,
      itemsPerPage: this.currentLabRowsPerPage
    });
    }

    else
    {
        this.labResults.forEach((element,index)=>{
        if(element.procedureName === "RBS Test" && element.procedureID === null) 
                    this.labResults.splice(index,1);
     });

     
     this.filteredLabResults = this.labResults;

     this.currentLabPageChanged({
      page: this.currentLabActivePage,
      itemsPerPage: this.currentLabRowsPerPage
    });
    }
  }

  labResults = [];
  radiologyResults = [];
  archivedResults = [];
  testResultsSubscription: any;
  getTestResults(beneficiaryRegID, visitID, visitCategory) {
    this.testResultsSubscription = this.doctorService.getCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory)
      .subscribe(res => {
        console.log('response archive', res);
        if (res && res.statusCode == 200 && res.data) {
          console.log('labresult', res.data.LabReport);
          this.labResults = res.data.LabReport.filter((lab) => {
            return lab.procedureType == 'Laboratory'
          })
          this.filteredLabResults = this.labResults;

        
          
          //coded added to check whether strips are available for RBS Test 
          if(visitCategory == 'NCD screening'){
          this.filteredLabResults.forEach(element => {
            if(element.procedureName == environment.RBSTest){
              return element.componentList.forEach(element1 => {
                if (element1.stripsNotAvailable === true) {
                  
                  this.idrsScoreService.setReferralSuggested();
                }
              });
            }
            
          });
        }


          if(this.vitalsRBSResp)
          {
        
          // this.labResults.push(this.vitalsRBSResp);
          this.labResults=[this.vitalsRBSResp].concat(this.labResults);
          
          }

          this.filteredLabResults = this.labResults;

          this.radiologyResults = res.data.LabReport.filter((radiology) => {
            return radiology.procedureType == 'Radiology'
          })
          this.archivedResults = res.data.ArchivedVisitcodeForLabResult;
          this.currentLabPageChanged({
            page: this.currentLabActivePage,
            itemsPerPage: this.currentLabRowsPerPage
          });
        }
      })
  }


  filteredLabResults = [];
  filterProcedures(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredLabResults = this.labResults;
    }
    else {
      this.filteredLabResults = [];
      this.labResults.forEach((item) => {
        const value: string = '' + item.procedureName;
        if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
          this.filteredLabResults.push(item);
        }
      });
    }


    this.currentLabActivePage = 1;
    this.currentLabPageChanged({
      page: 1,
      itemsPerPage: this.currentLabRowsPerPage
    });

  }
  currentLabPagedList = [];
  currentLabPageChanged(event): void {
    console.log('called', event)
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.currentLabPagedList = this.filteredLabResults.slice(startItem, endItem);
    console.log('list', this.currentLabPagedList)

  }

  showTestResult(fileIDs) {
    
    let ViewTestReport = this.dialog.open(ViewRadiologyUploadedFilesComponent,
      {
        width: "40%",
        data: {
        filesDetails: fileIDs,        
        // width: 0.8 * window.innerWidth + "px",
        panelClass: 'dialog-width',
        disableClose: false
        }
      });
      ViewTestReport.afterClosed().subscribe((result) => {
        if (result) {
          this.labService.viewFileContent(result).subscribe((res) => {
            const blob = new Blob([res], { type: res.type });
            console.log(blob, "blob");
            const url = window.URL.createObjectURL(blob);
            // window.open(url);
            let a = document.createElement('a');
            a.href = url;
            a.download = result.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });
        }
    })
  }
  enableArchiveView: Boolean = false;
  archivedLabResults = [];
  filteredArchivedLabResults = [];
  archivedRadiologyResults = [];
  visitedDate: any;
  visitCode: any;
  showArchivedTestResult(visitCode) {
    let archivedReport = {
      beneficiaryRegID: localStorage.getItem('beneficiaryRegID'),
      visitCode: visitCode.visitCode
    }
    this.doctorService.getArchivedReports(archivedReport).subscribe((response) => {
      if (response.statusCode == 200) {
        this.archivedLabResults = response.data.filter((lab) => {
          return lab.procedureType == 'Laboratory'
        })
        this.filteredArchivedLabResults = this.archivedLabResults;
        this.previousLabPageChanged({
          page: this.previousLabActivePage,
          itemsPerPage: this.previousLabRowsPerPage
        });
        this.archivedRadiologyResults = response.data.filter((radiology) => {
          return radiology.procedureType == 'Radiology'
        })
        this.enableArchiveView = true;
        this.visitedDate = visitCode.date
        this.visitCode = visitCode.visitCode
      }
    })

  }

  filterArchivedProcedures(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredArchivedLabResults = this.archivedLabResults;
    }
    else {
      this.filteredArchivedLabResults = [];
      this.archivedLabResults.forEach((item) => {
        const value: string = '' + item.procedureName;
        if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
          this.filteredArchivedLabResults.push(item);
        }
      });
    }

    this.previousLabActivePage = 1;
    this.previousLabPageChanged({
      page: 1,
      itemsPerPage: this.previousLabRowsPerPage
    });
  }

  previousLabPagedList = [];
  previousLabPageChanged(event): void {
    console.log('called', event)
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.previousLabPagedList = this.filteredArchivedLabResults.slice(startItem, endItem);
    console.log('list', this.previousLabPagedList)

  }

  showArchivedRadiologyTestResult(radiologyReport) {
    console.log('reports', radiologyReport)
    let ViewTestReport = this.dialog.open(ViewTestReportComponent,
      {
        data: radiologyReport,
        width: 0.8 * window.innerWidth + "px",
        panelClass: 'dialog-width',
        disableClose: false
      });
  }

  resetArchived(){
    console.log('hwere');
    
    this.archivedLabResults =[];
    this.filteredArchivedLabResults = [];
    this.archivedRadiologyResults = [];
    this.visitCode = null;
    this.visitedDate = null;
    this.enableArchiveView = false;
    this.previousLabPagedList = [];
  }
}

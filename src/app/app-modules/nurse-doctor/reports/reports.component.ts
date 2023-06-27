import { Component, DoCheck, OnInit } from "@angular/core";
import { MasterdataService } from "../shared/services";
import { ConfirmationService } from "../../core/services/confirmation.service";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import * as XLSX from "xlsx";
import { SetLanguageComponent } from "app/app-modules/core/components/set-language.component";
import { HttpServiceService } from "app/app-modules/core/services/http-service.service";
@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.css"],
})
export class ReportsComponent implements OnInit, DoCheck {
  reportForm: FormGroup;
  currentLanguageSet: any;
  constructor(
    private masterdataService: MasterdataService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private httpServices: HttpServiceService
  ) {}
  today: Date;
  ngOnInit() {
    this.assignSelectedLanguage();
    this.today = new Date();
    this.reportForm = this.createReportForm();
    this.getReportsMaster();
    this.getVanMaster();
  }
  /*
   * JA354063 - Multilingual Changes added on 13/10/21
   */
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServices);
    getLanguageJson.setLanguage();
    this.currentLanguageSet = getLanguageJson.currentLanguageObject;
  }
  // Ends
  createReportForm() {
    return this.formBuilder.group({
      report: null,
      fromDate: null,
      toDate: null,
      van: null,
    });
  }

  reportMaster = [];
  getReportsMaster() {
    this.masterdataService.getReportsMaster().subscribe(
      (res) => {
        console.log("res", res);
        if (res && res.statusCode == 200) {
          if (res.data && res.data.length > 0) {
            this.reportMaster = res.data;
          } else {
            this.confirmationService.alert(
              this.currentLanguageSet.noReportsWereMappedforthisService
            );
          }
        } else {
          this.confirmationService.alert(res.errorMessage, "error");
        }
      },
      (err) => {
        this.confirmationService.alert(err, "error");
      }
    );
  }

  get report() {
    return this.reportForm.controls["report"].value;
  }

  checkReport() {
    console.log(this.report);
    this.reportForm.patchValue({
      fromDate: null,
      toDate: null,
      van: null,
    });
  }

  get fromDate() {
    return this.reportForm.controls["fromDate"].value;
  }
  checkFromDate() {
    console.log(this.fromDate);
    this.reportForm.patchValue({
      toDate: null,
      van: null,
    });
    let toMax = new Date(this.fromDate);
    toMax.setMonth(this.fromDate.getMonth() + 1);
    console.log(toMax, this.today);
    if (toMax > this.today) {
      console.log(this.today);
      this.maxToDate = new Date(this.today);
    } else {
      console.log("toMax", toMax);
      this.maxToDate = new Date(toMax);
    }

    console.log(this.maxToDate);
  }

  get toDate() {
    return this.reportForm.controls["toDate"].value;
  }

  maxToDate: Date;
  checkToDate() {
    this.reportForm.patchValue({
      van: null,
    });
  }
  vanMaster = [];
  getVanMaster() {
    this.masterdataService.getVanMaster().subscribe(
      (res) => {
        if (res && res.statusCode == 200) {
          if (res.data && res.data.length > 0) {
            this.vanMaster = res.data;
          } else {
            this.confirmationService.alert(
              this.currentLanguageSet.noVansWereMappedforthisprovider
            );
          }
        } else {
          this.confirmationService.alert(res.errorMessage, "error");
        }
      },
      (err) => {
        this.confirmationService.alert(err, "error");
      }
    );
  }
  get van() {
    return this.reportForm.controls["van"].value;
  }
  reportData = [];
  getReportData() {
    let reportRequst = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      providerServiceMapID: localStorage.getItem("providerServiceID"),
      reportID: this.report.reportID,
      vanID: this.van.vanID,
    };
    console.log("reportRequst", reportRequst);
    this.masterdataService.getReportData(reportRequst).subscribe(
      (res) => {
        if (res && res.statusCode == 200) {
          if (res.data && res.data.length > 0) {
            this.reportData = res.data;
            this.createCriteria();
          } else {
            this.confirmationService.alert(
              this.currentLanguageSet.noDataAvailabletoGenerateReport
            );
          }
        } else {
          this.confirmationService.alert(res.errorMessage, "error");
        }
      },
      (err) => {
        this.confirmationService.alert(err, "error");
      }
    );
  }

  createCriteria() {
    let criteria: any = [];
    criteria.push({ Filter_Name: "Start_Date", value: this.fromDate });
    criteria.push({ Filter_Name: "End_Date", value: this.toDate });
    criteria.push({ Filter_Name: "Vehicle", value: this.van.vehicalNo });
    criteria.push({ Filter_Name: "Report", value: this.report.reportName });
    this.exportExcel(criteria);
  }
  exportExcel(criteria) {
    if (this.reportData) {
      let reportManipulatedData = this.manipulateNullReportData(
        this.reportData
      );
      if (reportManipulatedData && reportManipulatedData.length > 0) {
        var head = Object.keys(reportManipulatedData[0]);
        console.log(" head", head);
        let wb_name = this.report.reportName;
        const criteria_worksheet: XLSX.WorkSheet =
          XLSX.utils.json_to_sheet(criteria);
        const report_worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
          reportManipulatedData,
          { header: head }
        );
        let reportSheetData = this.manipulateSheetCellsAndColumns(
          head,
          report_worksheet
        );
        this.generateWorkBook(reportSheetData, criteria_worksheet, wb_name);
      }
    }
  }

  manipulateNullReportData(reportData) {
    let tempReport = reportData.filter((report) => {
      for (var key in report) {
        if (report[key] == null) {
          report[key] = "";
        }
      }
      return report;
    });
    return tempReport;
  }

  manipulateSheetCellsAndColumns(head, report_worksheet) {
    let i = 65; // starting from 65 since it is the ASCII code of 'A'.
    let count = 0;
    while (i < head.length + 65) {
      let j;
      if (count > 0) {
        j = i - 26 * count;
      } else {
        j = i;
      }
      let cellPosition = String.fromCharCode(j);
      let finalCellName: any;
      if (count == 0) {
        finalCellName = cellPosition + "1";
        console.log(finalCellName);
      } else {
        let newcellPosition = String.fromCharCode(64 + count);
        finalCellName = newcellPosition + cellPosition + "1";
        console.log(finalCellName);
      }
      let newName = this.modifyHeader(head, i);
      delete report_worksheet[finalCellName].w;
      report_worksheet[finalCellName].v = newName;
      i++;
      if (i == 91 + count * 26) {
        // i = 65;
        count++;
      }
    }

    return report_worksheet;
  }

  modifyHeader(headers, i) {
    let modifiedHeader: String;
    modifiedHeader = headers[i - 65]
      .toString()
      .replace(/([A-Z])/g, " $1")
      .trim();
    modifiedHeader =
      modifiedHeader.charAt(0).toUpperCase() + modifiedHeader.substr(1);
    return modifiedHeader.replace(/I D/g, "ID");
  }

  generateWorkBook(report_worksheet, criteria_worksheet, wb_name) {
    const workbook: XLSX.WorkBook = {
      Sheets: { Report: report_worksheet, Criteria: criteria_worksheet },
      SheetNames: ["Criteria", "Report"],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    let blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, wb_name);
    } else {
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("visibility", "hidden");
      link.download = wb_name.replace(/ /g, "_") + ".xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    this.reportForm.reset();
  }
}

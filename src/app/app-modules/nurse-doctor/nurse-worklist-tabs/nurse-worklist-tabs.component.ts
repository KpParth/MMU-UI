import { Component, DoCheck, OnInit } from "@angular/core";
import { SetLanguageComponent } from "app/app-modules/core/components/set-language.component";
import { HttpServiceService } from "app/app-modules/core/services/http-service.service";

@Component({
  selector: "app-nurse-worklist-tabs",
  templateUrl: "./nurse-worklist-tabs.component.html",
  styleUrls: ["./nurse-worklist-tabs.component.css"],
})
export class NurseWorklistTabsComponent implements OnInit, DoCheck {
  currentLanguageSet: any;

  constructor(private httpServices: HttpServiceService) {}

  ngOnInit() {
    this.assignSelectedLanguage();
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
}

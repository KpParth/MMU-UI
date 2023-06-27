import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  DoCheck,
} from "@angular/core";
import { FormBuilder, FormGroup, FormControl, FormArray } from "@angular/forms";
import { SetLanguageComponent } from "app/app-modules/core/components/set-language.component";
import { HttpServiceService } from "app/app-modules/core/services/http-service.service";
import { DoctorService } from "../../shared/services";

@Component({
  selector: "patient-adherence",
  templateUrl: "./adherence.component.html",
  styleUrls: ["./adherence.component.css"],
})
export class AdherenceComponent implements OnInit, DoCheck {
  @Input("patientAdherenceForm")
  patientAdherenceForm: FormGroup;

  @Input("mode")
  mode: string;

  adherenceProgressData = ["Improved", "Unchanged", "Worsened"];
  currentLanguageSet: any;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private httpServices: HttpServiceService
  ) {}

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
  ngOnChanges() {
    if (this.mode == "view") {
      let visitID = localStorage.getItem("visitID");
      let benRegID = localStorage.getItem("beneficiaryRegID");
      this.getAdherenceDetails(benRegID, visitID);
    }
  }

  getAdherenceDetails(beneficiaryRegID, visitID) {
    this.doctorService
      .getVisitComplaintDetails(beneficiaryRegID, visitID)
      .subscribe((value) => {
        if (
          value != null &&
          value.statusCode == 200 &&
          value.data != null &&
          value.data.BenAdherence != null
        )
          this.patientAdherenceForm.patchValue(value.data.BenAdherence);
      });
  }

  checkReferralDescription(toReferral) {
    if (toReferral) {
      this.patientAdherenceForm.patchValue({ referralReason: null });
    }
  }

  checkDrugsDescription(toDrugs) {
    if (toDrugs) {
      this.patientAdherenceForm.patchValue({ drugReason: null });
    }
  }

  get drugReason() {
    return this.patientAdherenceForm.controls["drugReason"].value;
  }

  get referralReason() {
    return this.patientAdherenceForm.controls["referralReason"].value;
  }

  get toDrugs() {
    return this.patientAdherenceForm.controls["toDrugs"].value;
  }

  get toReferral() {
    return this.patientAdherenceForm.controls["toReferral"].value;
  }
}

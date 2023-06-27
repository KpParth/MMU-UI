import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MasterdataService, NurseService, DoctorService } from '../../../shared/services';
import { GeneralOpdDiagnosisComponent } from './general-opd-diagnosis/general-opd-diagnosis.component';
import { AncDiagnosisComponent } from './anc-diagnosis/anc-diagnosis.component';
@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css']
})
export class DiagnosisComponent implements OnInit {

  @Input('generalDiagnosisForm')
  generalDiagnosisForm: FormGroup;

  @Input('visitCategory')
  visitCategory: string;

  @Input('caseRecordMode')
  caseRecordMode: string;

  constructor(
    private fb: FormBuilder,
    private nurseService: NurseService,
    private doctorService: DoctorService,
    private masterdataService: MasterdataService) { }

  ngOnInit() {
  }

  ngOnChanges() {
  }

}


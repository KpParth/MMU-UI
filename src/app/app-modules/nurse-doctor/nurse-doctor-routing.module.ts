import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NurseWorklistComponent } from './nurse-worklist/nurse-worklist.component';
import { RadiologistWorklistComponent } from './radiologist-worklist/radiologist-worklist.component';
import { OncologistWorklistComponent } from './oncologist-worklist/oncologist-worklist.component';
import { WorkareaComponent } from './workarea/workarea.component';
import { CaseSheetComponent } from './case-sheet/case-sheet.component';
import { DoctorWorklistComponent } from './doctor-worklist/doctor-worklist.component';
import { GeneralCaseRecordComponent } from './case-record/general-case-record/general-case-record.component';
import { CanDeactivateGuardService } from '../core/services/can-deactivate-guard.service';
import { WorkareaCanActivate } from './workarea/workarea-can-activate.service';
import { ReportsComponent } from './reports/reports.component';
import { NurseWorklistTabsComponent } from './nurse-worklist-tabs/nurse-worklist-tabs.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'nurse-worklist',
        pathMatch: 'full'
      },
      // {
      //   path: 'nurse-worklist',
      //   component: NurseWorklistComponent
      // },
      {
        path: 'nurse-worklist',
        component: NurseWorklistTabsComponent
      },
      {
        path: 'doctor-worklist',
        component: DoctorWorklistComponent
      },
      {
        path: 'radiologist-worklist',
        component: RadiologistWorklistComponent
      },
      {
        path: 'oncologist-worklist',
        component: OncologistWorklistComponent
      },
      {
        path: 'reports',
        component: ReportsComponent
      },
      {
        path: 'attendant/:attendant/patient/:beneficiaryRegID',
        component: WorkareaComponent,
        canActivate: [WorkareaCanActivate],
        canDeactivate: [CanDeactivateGuardService]
      }
    ]
  },
  {
    path: 'print/:serviceType/:printablePage',
    component: CaseSheetComponent
  },
  {
    path: 'generalcaserec',
    component: GeneralCaseRecordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NurseDoctorRoutingModule { }

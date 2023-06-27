import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Md2Module } from 'md2';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { RegistrarRoutingModule } from './registrar-routing.module';
import { CoreModule } from '../core/core.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { RegistrationComponent } from './registration/registration.component';
import { SearchComponent } from './search/search.component';
import { SearchDialogComponent } from './search-dialog/search-dialog.component';

import { RegisterPersonalDetailsComponent } from './registration/register-personal-details/register-personal-details.component';
import { RegisterDemographicDetailsComponent } from './registration/register-demographic-details/register-demographic-details.component';
import { RegisterOtherDetailsComponent } from './registration/register-other-details/register-other-details.component';

import { RegistrarService } from './shared/services/registrar.service';
import { RegisterEditLocationComponent } from './registration/register-edit-location/register-edit-location.component';

@NgModule({
  imports: [
    CommonModule,
    Md2Module,
    FormsModule,
    CoreModule,
    RegistrarRoutingModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot()
  ],
  entryComponents: [SearchDialogComponent,RegisterEditLocationComponent],
  providers: [ 
    RegistrarService 
  ],
  declarations: [
    DashboardComponent,
    RegistrationComponent,
    SearchComponent,
    SearchDialogComponent,
    RegisterPersonalDetailsComponent,
    RegisterDemographicDetailsComponent,
    RegisterOtherDetailsComponent,
    RegisterEditLocationComponent
    
  ],
})
export class RegistrarModule { }

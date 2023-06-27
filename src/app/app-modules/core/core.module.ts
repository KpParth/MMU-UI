import { NgModule, ErrorHandler, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Http, XHRBackend, RequestOptions } from '@angular/http';
import { MaterialModule } from './material.module';
import { Md2Module } from 'md2';
import { ChartsModule } from 'ng2-charts';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebCamModule } from 'ack-angular-webcam';
import { CommonDialogComponent } from './components/common-dialog/common-dialog.component';
import { CameraDialogComponent } from './components/camera-dialog/camera-dialog.component';
import { TextareaDialogComponent } from './components/textarea-dialog/textarea-dialog.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ProvisionalSearchComponent } from './components/provisional-search/provisional-search.component';
import { BeneficiaryDetailsComponent } from './components/beneficiary-details/beneficiary-details.component';
import { AppFooterComponent } from './components/app-footer/app-footer.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { PreviousDetailsComponent } from './components/previous-details/previous-details.component';

import { HttpInterceptor } from './services/http-interceptor.service';
import { SpinnerService } from './services/spinner.service';
import { ConfirmationService } from './services/confirmation.service';
import { CameraService } from './services/camera.service';
import { AuthGuard } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';
import { BeneficiaryDetailsService } from './services/beneficiary-details.service';
import { TextareaDialog } from './components/textarea-dialog/textarea-dialog.service';
import { CommonService } from './services/common-services.service';
import { GlobalErrorHandler } from './services/global-error-handler.service';

import { myEmail } from './directives/email/myEmail.directive';
import { myMobileNumber } from './directives/MobileNumber/myMobileNumber.directive';
import { myName } from './directives/name/myName.directive';
import { myPassword } from './directives/password/myPassword.directive';
import { StringValidator } from './directives/stringValidator.directive';
import { NumberValidator } from './directives/numberValidator.directive';
import { OpenModalDirective } from './directives/open-modal.directive';
import { DisableFormControlDirective } from './directives/disableFormControl.directive';
import { NullDefaultValueDirective } from './directives/null-default-value.directive';
import { ConfirmatoryDiagnosisDirective } from './directives/confirmatory-diagnosis.directive';
import { InventoryService } from './services/inventory.service';
import { ShowCommitAndVersionDetailsComponent } from './components/show-commit-and-version-details/show-commit-and-version-details.component'
import { CanDeactivateGuardService } from './services/can-deactivate-guard.service';
import { ViewRadiologyUploadedFilesComponent } from './components/view-radiology-uploaded-files/view-radiology-uploaded-files.component';

import { IotcomponentComponent } from 'app/app-modules/core/components/iotcomponent/iotcomponent.component';
import { IotService } from 'app/app-modules/core/services/iot.service';
import { IotBluetoothComponent } from 'app/app-modules/core/components/iot-bluetooth/iot-bluetooth.component';
import { AllergenSearchComponent } from './components/allergen-search/allergen-search.component';
import { DataSyncLoginComponent } from './components/data-sync-login/data-sync-login.component';
import { CalibrationComponent } from './components/calibration/calibration.component';
import { MasterdataService } from '../nurse-doctor/shared/services';
import { HttpServiceService } from './services/http-service.service';
import { HttpClientModule } from '@angular/common/http';
import { SetLanguageComponent } from './components/set-language.component';
import { OpenPreviousVisitDetailsComponent } from './components/open-previous-visit-details/open-previous-visit-details.component';
@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule,
    Md2Module,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ChartsModule,
    WebCamModule,
    PaginationModule.forRoot()
  ],
  declarations: [
    CommonDialogComponent,
    CameraDialogComponent,
    ProvisionalSearchComponent,
    TextareaDialogComponent,
    SpinnerComponent,
    BeneficiaryDetailsComponent,
    AppFooterComponent,
    AppHeaderComponent,
    PreviousDetailsComponent,
    ShowCommitAndVersionDetailsComponent,CalibrationComponent,
    myEmail, myMobileNumber, OpenModalDirective, ConfirmatoryDiagnosisDirective, myName, myPassword, StringValidator, NullDefaultValueDirective, NumberValidator, DisableFormControlDirective,
    ViewRadiologyUploadedFilesComponent, IotcomponentComponent,IotBluetoothComponent,AllergenSearchComponent, DataSyncLoginComponent,OpenPreviousVisitDetailsComponent,
    SetLanguageComponent
  ],
  exports: [
    MaterialModule,
    Md2Module,
    CommonDialogComponent,
    CameraDialogComponent,
    TextareaDialogComponent,
    SpinnerComponent,
    BeneficiaryDetailsComponent,
    AppFooterComponent,
    AppHeaderComponent,
    PreviousDetailsComponent,
    PaginationModule, ShowCommitAndVersionDetailsComponent,
    myEmail, myMobileNumber, OpenModalDirective, ConfirmatoryDiagnosisDirective, myName, myPassword, DisableFormControlDirective, StringValidator, NumberValidator, NullDefaultValueDirective
    ,IotcomponentComponent,
    IotBluetoothComponent,AllergenSearchComponent, DataSyncLoginComponent,CalibrationComponent,OpenPreviousVisitDetailsComponent
  ],
  entryComponents: [
    CommonDialogComponent,
    CameraDialogComponent,
    TextareaDialogComponent,
    SpinnerComponent,
    PreviousDetailsComponent,
    ProvisionalSearchComponent,
    ShowCommitAndVersionDetailsComponent,
    ViewRadiologyUploadedFilesComponent,
    IotcomponentComponent,
    IotBluetoothComponent,
    AllergenSearchComponent,
    DataSyncLoginComponent,CalibrationComponent,
    OpenPreviousVisitDetailsComponent
  ]
})
export class CoreModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        ConfirmationService,
        CameraService,
        TextareaDialog,
        AuthGuard,
        AuthService,
        SpinnerService,
        BeneficiaryDetailsService,
        CommonService,
        InventoryService,
        CanDeactivateGuardService,
        MasterdataService,
        HttpServiceService,
        IotService,
        {
          provide: Http,
          useFactory: HttpInterceptorFactory,
          deps: [XHRBackend, RequestOptions, Router, SpinnerService, ConfirmationService]
        }
      ]
    };
  }
}

export function HttpInterceptorFactory(backend: XHRBackend, options: RequestOptions, router: Router, spinner: SpinnerService, confirmation: ConfirmationService) {
  return new HttpInterceptor(backend, options, router, spinner, confirmation);
}

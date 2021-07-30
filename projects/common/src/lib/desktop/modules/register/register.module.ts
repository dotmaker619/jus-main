import { NgModule } from '@angular/core';
import { SharedModule } from '@jl/common/shared';

import { AttorneyRegistrationModule } from './attorney-registration/attorney-registration.module';
import { ClientRegistrationModule } from './client-registration/client-registration.module';
import { RegisterRoutingModule } from './register-routing.module';
import { RegistrationSelectComponent } from './registration-select/registration-select.component';
import { StaffRegistrationComponent } from './staff-registration/staff-registration.component';
import { StaffRegistrationModule } from './staff-registration/staff-registration.module';

/**
 * Register user module.
 */
@NgModule({
  declarations: [
    RegistrationSelectComponent,
  ],
  imports: [
    SharedModule,
    RegisterRoutingModule,
    AttorneyRegistrationModule,
    ClientRegistrationModule,
    StaffRegistrationModule,
  ],
})
export class RegisterModule { }

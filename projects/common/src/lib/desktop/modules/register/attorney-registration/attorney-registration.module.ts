import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClientSharedModule } from '@jl/client/shared/client-shared.module';
import { CommonSharedModule as CommonSharedModule } from '@jl/common/shared/shared.module';

import { AddPaymentMethodComponent } from './add-payment-method/add-payment-method.component';
import { AttorneyRegistrationComponent } from './attorney-registration.component';
import { CreateAccountComponent } from './create-account/create-account.component';

/**
 * Attorney registration module.
 */
@NgModule({
  declarations: [
    CreateAccountComponent,
    AddPaymentMethodComponent,
    AttorneyRegistrationComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClientSharedModule,
    CommonSharedModule,
  ],
})
export class AttorneyRegistrationModule { }

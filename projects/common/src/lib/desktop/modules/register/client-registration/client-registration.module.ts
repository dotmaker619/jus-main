import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClientSharedModule } from '@jl/client/shared/client-shared.module';

import { ClientRegistrationComponent } from './client-registration.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';

/**
 * Client module.
 */
@NgModule({
  declarations: [
    ClientRegistrationComponent,
    CreateAccountComponent,
  ],
  imports: [
    ClientSharedModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class ClientRegistrationModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientSharedModule } from '@jl/client/shared/client-shared.module';
import { SharedModule } from '@jl/common/shared';

import { AttorneyUserFallbackComponent } from './attorney-user-fallback/attorney-user-fallback.component';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { PasswordResetConfirmationComponent } from './password-reset-confirmation/password-reset-confirmation.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { PreLogoutComponent } from './pre-logout/pre-logout.component';

/**
 * Module for authentication actions
 */
@NgModule({
  declarations: [
    LoginComponent,
    PasswordResetComponent,
    PasswordResetConfirmationComponent,
    AttorneyUserFallbackComponent,
    AuthComponent,
    PreLogoutComponent,
  ],
  imports: [
    AuthRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ClientSharedModule,
  ],
})
export class AuthModule { }

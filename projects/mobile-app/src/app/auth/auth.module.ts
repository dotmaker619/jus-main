import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@jl/common/shared';

import { AuthRoutingModule } from './auth-routing.module';
import { ClientUserFallbackComponent } from './client-user-fallback/client-user-fallback.component';
import { LoginComponent } from './login/login.component';
import { PasswordResetConfirmationComponent } from './password-reset-confirmation/password-reset-confirmation.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';

/** Module for authentication actions */
@NgModule({
  declarations: [LoginComponent, PasswordResetComponent, PasswordResetConfirmationComponent, ClientUserFallbackComponent],
  imports: [
    AuthRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class AuthModule { }

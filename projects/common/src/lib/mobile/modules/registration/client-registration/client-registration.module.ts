import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { CanContinueRegistrationGuard } from '../guards/can-continue-registration.guard';

import { ClientFirstStepRegistrationComponent } from './pages/client-first-step-registration/client-first-step-registration.component';
import { ClientSecondStepRegistrationComponent } from './pages/client-second-step-registration/client-second-step-registration.component';

export const routes: Routes = [
  { path: '', component: ClientFirstStepRegistrationComponent },
  {
    path: 'additional',
    component: ClientSecondStepRegistrationComponent,
    canActivate: [CanContinueRegistrationGuard],
  },
];

/** Client registration module for mobile devices. */
@NgModule({
  declarations: [
    ClientFirstStepRegistrationComponent,
    ClientSecondStepRegistrationComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonSharedModule,
    CommonMobileModule,
  ],
})
export class ClientRegistrationModule { }

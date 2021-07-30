import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { CanContinueRegistrationGuard } from '../guards/can-continue-registration.guard';

import { CreateAccountFormComponent } from './components/create-account-form/create-account-form.component';
import { RegistrationHeadingComponent } from './components/registration-heading/registration-heading.component';
import {
  AttorneyFirstStepRegistrationComponent,
} from './pages/attorney-first-step-registration/attorney-first-step-registration.component';
import {
  AttorneySecondStepRegistrationComponent,
} from './pages/attorney-second-step-registration/attorney-second-step-registration.component';
import {
  AttorneyThirdStepRegistrationComponent,
} from './pages/attorney-third-step-registration/attorney-third-step-registration.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: AttorneyFirstStepRegistrationComponent },
  {
    path: 'additional',
    component: AttorneySecondStepRegistrationComponent,
    canActivate: [CanContinueRegistrationGuard],
  },
  {
    path: 'payment',
    component: AttorneyThirdStepRegistrationComponent,
    canActivate: [CanContinueRegistrationGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

/** Attorney registration module for mobile devices. */
@NgModule({
  declarations: [
    AttorneyFirstStepRegistrationComponent,
    AttorneySecondStepRegistrationComponent,
    AttorneyThirdStepRegistrationComponent,
    CreateAccountFormComponent,
    RegistrationHeadingComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    CommonSharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommonMobileModule,
  ],
})
export class AttorneyRegistrationModule { }

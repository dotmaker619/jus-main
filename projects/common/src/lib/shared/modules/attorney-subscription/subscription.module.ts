import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@jl/common/shared';

import { CancelSubscriptionDialogComponent } from './components/cancel-subscription-dialog/cancel-subscription-dialog.component';
import {
  ChangeSubscriptionPlanDialogComponent,
} from './components/change-subscription-plan-dialog/change-subscription-plan-dialog.component';
import { PaymentMethodDialogComponent } from './components/payment-method-dialog/payment-method-dialog.component';
import { EditSubscriptionPageComponent } from './edit-subscription-page/edit-subscription-page.component';
import { SubscriptionPageComponent } from './subscription-page/subscription-page.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionPageComponent,
  },
  {
    path: 'edit',
    component: EditSubscriptionPageComponent,
  },
];

/** Subscription module */
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
  ],
  declarations: [
    SubscriptionPageComponent,
    EditSubscriptionPageComponent,
    PaymentMethodDialogComponent,
    ChangeSubscriptionPlanDialogComponent,
    CancelSubscriptionDialogComponent,
  ],
  entryComponents: [
    PaymentMethodDialogComponent,
    ChangeSubscriptionPlanDialogComponent,
    CancelSubscriptionDialogComponent,
  ],
})
export class SubscriptionModule { }

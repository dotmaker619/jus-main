import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { AttorneyMobileSharedModule } from '../shared/shared.module';

import { EditSubscriptionPageComponent } from './edit-subscription-page/edit-subscription-page.component';
import { PaymentMethodModalComponent } from './payment-method-modal/payment-method-modal.component';
import { SubscriptionPageComponent } from './subscription-page/subscription-page.component';

export const routes: Routes = [
  { path: '', component: SubscriptionPageComponent },
  { path: 'edit', component: EditSubscriptionPageComponent },
];

/** Subscriptions module. */
@NgModule({
  declarations: [EditSubscriptionPageComponent, SubscriptionPageComponent, PaymentMethodModalComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AttorneyMobileSharedModule,
    CommonSharedModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonMobileModule,
  ],
  entryComponents: [
    PaymentMethodModalComponent,
  ],
})
export class MobileSubscriptionsModule { }

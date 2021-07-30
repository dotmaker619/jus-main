import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { DynamicValuesListControlComponent } from './components/dynamic-values-list/dynamic-values-list.component';
import { InvoiceDetailsPageComponent } from './invoice-details-page/invoice-details-page.component';
import { InvoicesPageComponent } from './invoices-page/invoices-page.component';
import { EditInvoiceModalComponent } from './modals/edit-invoice-modal/edit-invoice-modal.component';
import { PickClientModalComponent } from './modals/pick-client-modal/pick-client-modal.component';
import { SendInvoiceModalComponent } from './modals/send-invoice-modal/send-invoice-modal.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: InvoicesPageComponent},
  { path: ':id', component: InvoiceDetailsPageComponent },
];

/** Invoices module for mobile. */
@NgModule({
  declarations: [
    InvoicesPageComponent,
    InvoiceDetailsPageComponent,
    SendInvoiceModalComponent,
    DynamicValuesListControlComponent,
    EditInvoiceModalComponent,
    PickClientModalComponent,
  ],
  entryComponents: [
    SendInvoiceModalComponent,
    EditInvoiceModalComponent,
    PickClientModalComponent,
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
export class MobileInvoicesModule { }

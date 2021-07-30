import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MatDatepickerModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { Routes, RouterModule } from '@angular/router';
import { DocumentViewer } from '@ionic-native/document-viewer/ngx';
import { CommonDesktopModule } from '@jl/common/desktop/desktop.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { SendInvoiceDialogComponent } from './components/send-invoice-dialog/send-invoice-dialog.component';
import { PickClientDialogComponent } from './dialogs/pick-client/pick-client-dialog.component';
import { InvoiceDetailsComponent } from './invoice-details-page/invoice-details.component';
import { InvoicesComponent } from './invoices-page/invoices.component';

const routes: Routes = [
  {
    path: ':id',
    component: InvoiceDetailsComponent,
  },
  {
    path: '',
    component: InvoicesComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

/** Invoices module. */
@NgModule({
  declarations: [
    InvoicesComponent,
    InvoiceDetailsComponent,
    SendInvoiceDialogComponent,
    PickClientDialogComponent,
  ],
  entryComponents: [
    SendInvoiceDialogComponent,
    PickClientDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatDatepickerModule,
    CommonDesktopModule,
  ],
  providers: [
    DocumentViewer,
  ],
})
export class InvoicesModule { }

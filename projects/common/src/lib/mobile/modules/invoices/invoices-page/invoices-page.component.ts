import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { InvoiceStatus } from '@jl/common/core/models/invoice-status';
import { InvoicesTabDescription } from '@jl/common/core/models/invoice-tab-description';
import { Role } from '@jl/common/core/models/role';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { BaseInvoicesPage } from '@jl/common/mobile/base/invoices.base';
import { ExportStatisticsModalComponent } from '@jl/common/mobile/modals/export-statistics-modal/export-statistics-modal.component';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { EditInvoiceModalComponent } from '../modals/edit-invoice-modal/edit-invoice-modal.component';

/** Tab options. */
enum Tabs {
  /** Documents. */
  Sent = 'Sent',
  /** Notes. */
  Pending = 'Pending',
}

const TABS: InvoicesTabDescription[] = [
  { name: Tabs.Pending, status: { statuses: [InvoiceStatus.Pending] } },
  { name: Tabs.Sent, status: { statuses: [InvoiceStatus.Sent] } },
];

/** Invoices page component. */
@Component({
  selector: 'jlc-invoices-page',
  templateUrl: './invoices-page.component.html',
  styleUrls: ['./invoices-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesPageComponent extends BaseInvoicesPage {

  /** Is export button available. */
  public readonly isExportAvailable$: Observable<boolean>;

  /**
   * @constructor
   *
   * @param modalCtrl Modal controller.
   * @param cdr Change detection reference.
   * @param fb Form builder.
   * @param invoiceService Invoice service.
   * @param route Current route.
   * @param router Router.
   * @param curUserService Current user service.
   */
  public constructor(
    modalCtrl: ModalController,
    cdr: ChangeDetectorRef,
    fb: FormBuilder,
    invoicesService: InvoiceService,
    route: ActivatedRoute,
    router: Router,
    curUserService: CurrentUserService,
  ) {
    super(TABS, modalCtrl, cdr, fb, invoicesService, route, router);

    this.isExportAvailable$ = curUserService.currentUser$.pipe(
      first(),
      map(user => user.role === Role.Attorney),
    );
  }

  /**
   * Handle 'click' of Export button.
   */
  public async onExportStatisticsClick(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExportStatisticsModalComponent,
    });
    modal.present();
  }

  /**
   * Handle click on create invoice button.
   */
  public async onCreateInvoiceClick(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: EditInvoiceModalComponent,
    });
    modal.present();
    await modal.onDidDismiss();
    this.update$.next();
  }
}

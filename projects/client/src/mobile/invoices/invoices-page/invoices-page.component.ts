import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { InvoicesTabDescription } from '@jl/common/core/models/invoice-tab-description';
import { InvoiceQuery } from '@jl/common/core/models/invoices-query';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { BaseInvoicesPage } from '@jl/common/mobile/base/invoices.base';

/** Tab options. */
enum Tabs {
  /** Documents. */
  Unpaid = 'Unpaid',
  /** Notes. */
  Paid = 'Paid',
}

const TABS: InvoicesTabDescription[] = [
  { name: Tabs.Unpaid, status: InvoiceQuery.STATUS_UNPAID },
  { name: Tabs.Paid, status: InvoiceQuery.STATUS_PAID },
];

/** Invoices page component. */
@Component({
  selector: 'jlcl-invoices-page',
  templateUrl: './invoices-page.component.html',
  styleUrls: ['./invoices-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesPageComponent extends BaseInvoicesPage {

  /**
   * @constructor
   *
   * @param modalCtrl Modal controller.
   * @param cdr Change detection reference.
   * @param fb Form builder.
   * @param invoiceService Invoice service.
   * @param route Current route.
   * @param router Router.
   */
  public constructor(
    modalCtrl: ModalController,
    cdr: ChangeDetectorRef,
    fb: FormBuilder,
    invoicesService: InvoiceService,
    route: ActivatedRoute,
    router: Router,
  ) {
    super(TABS, modalCtrl, cdr, fb, invoicesService, route, router);
  }
}

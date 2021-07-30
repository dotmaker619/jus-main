
import { Component, ViewEncapsulation } from '@angular/core';
import { Link } from '@jl/common/core/models';

import { BaseAttorneyApp } from '../base-attorney-app';

/** Attorney desktop app component. */
@Component({
  selector: 'jlat-attorney-desktop-app',
  templateUrl: 'attorney-desktop-app.component.html',
  styleUrls: ['attorney-desktop-app.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AttorneyDesktopAppComponent extends BaseAttorneyApp {
  /** User navigation list. */
  public readonly navigationLinks: Link[] = [
    { link: '/dashboard', label: 'Dashboard' },
    { link: '/leads', label: 'Leads' },
    { link: '/matters', label: 'Matters' },
    { link: '/clients', label: 'Clients' },
    { link: '/documents', label: 'Documents' },
    { link: '/invoices', label: 'Invoices' },
  ];
}

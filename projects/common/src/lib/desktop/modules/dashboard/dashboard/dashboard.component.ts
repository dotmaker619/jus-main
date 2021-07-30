import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DashboardBase } from '@jl/common/shared/base-components/dashboard/dashboard.base';

/**
 * Dashboard component.
 */
@Component({
  selector: 'jlc-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent extends DashboardBase {
}

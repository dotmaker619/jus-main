import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

/** Staff payment plan info. */
@Component({
  selector: 'jlc-staff-payment-plan-info',
  templateUrl: './staff-payment-plan-info.component.html',
  styleUrls: ['./staff-payment-plan-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffPaymentPlanInfoComponent {

  /** Price. */
  @Input()
  public price: number;

}

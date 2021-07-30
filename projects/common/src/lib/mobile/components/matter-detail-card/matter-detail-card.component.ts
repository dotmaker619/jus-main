import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Matter } from '@jl/common/core/models';
import { RateType } from '@jl/common/core/models/rate-type';

/** Matter detail card. */
@Component({
  selector: 'jlc-matter-detail-card',
  templateUrl: './matter-detail-card.component.html',
  styleUrls: ['./matter-detail-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatterDetailCardComponent {

  /** Matter. */
  @Input()
  public set matter(m: Matter) {
    this.matterValue = m;
    this.shouldDisplayTotalFeesCell = m && m.rateType === this.RateType.Hourly;
  }
  /**
   * Whether 'client' or 'attorney' should be display in the layout
   */
  @Input()
  public isInfoForAttorney = true;

  /** Matter. */
  public matterValue: Matter;

  /** Rate type enum. */
  public RateType = RateType;

  /** Is collapsed by default. */
  @Input()
  public isCollapsed = false;

  /** Should display cell with info about total earned fees. */
  public shouldDisplayTotalFeesCell = false;
}

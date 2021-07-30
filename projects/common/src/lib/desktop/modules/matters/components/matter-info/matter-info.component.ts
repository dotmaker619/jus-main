import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Matter } from '@jl/common/core/models/matter';
import { RateType } from '@jl/common/core/models/rate-type';

/** Matter info table component. */
@Component({
  selector: 'jlc-matter-info',
  templateUrl: './matter-info.component.html',
  styleUrls: ['./matter-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatterInfoComponent {

  /** Matter. */
  @Input()
  public matter: Matter;

  /** Rate type enum. */
  public RateType = RateType;

}

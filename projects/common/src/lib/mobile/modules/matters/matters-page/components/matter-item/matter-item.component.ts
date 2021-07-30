import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Matter } from '@jl/common/core/models';

/** Matter item component. */
@Component({
  selector: 'jlc-matter-item',
  templateUrl: './matter-item.component.html',
  styleUrls: ['./matter-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatterItemComponent {

  /** Matter. */
  @Input()
  public matter: Matter;

  /** Default router link. */
  @Input()
  public routerLink: string | string[];
}

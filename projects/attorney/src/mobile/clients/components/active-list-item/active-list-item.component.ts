import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Matter } from '@jl/common/core/models';

/**
 * Item for active clients list.
 */
@Component({
  selector: 'jlat-active-list-item',
  templateUrl: './active-list-item.component.html',
  styleUrls: ['./active-list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveListItemComponent {
  /** Matter. */
  @Input()
  public matter: Matter;
}

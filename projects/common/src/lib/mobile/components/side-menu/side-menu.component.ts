import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { LinkWithBadge } from '@jl/attorney/shared/models/link-with-badge';
import { User } from '@jl/common/core/models/user';

/** Side menu content component. */
@Component({
  selector: 'jlc-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponent {

  /** Side menu links. */
  @Input()
  public links: LinkWithBadge[];

  /** User to display on side menu. */
  @Input()
  public user: User;

  /**
   * TrackBy function for menu items.
   * @param _ Index.
   * @param item Menu item.
   */
  public trackMenuItem(_: number, item: LinkWithBadge): string {
    return item.link;
  }
}

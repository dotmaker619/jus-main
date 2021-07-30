import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { LinkWithBadge } from '@jl/attorney/shared/models/link-with-badge';
import { User } from '@jl/common/core/models/user';

/** Header menu component. */
@Component({
  selector: 'jlc-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderMenuComponent {

  /** Menu links. */
  @Input()
  public menuLinks: LinkWithBadge[];

  /** Current user. */
  @Input()
  public user: User;

  /** Default icon for categories. */
  public readonly avatarFallbackUrl = '/assets/avatar.png';

  /** @constructor */
  public constructor() { }

}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Attorney } from '@jl/common/core/models/attorney';
import { Observable } from 'rxjs';

import { LinkWithBadge } from '../../models/link-with-badge';

/** Header menu in popover. */
@Component({
  selector: 'jlat-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderMenuComponent {

  /** Attorney. */
  @Input()
  public attorney: Attorney;

  /** Menu links. */
  @Input()
  public menuLinks$: Observable<LinkWithBadge[]>;

  /** Default icon for categories. */
  public readonly avatarFallbackUrl = '/assets/icons/avatar.png';

  /** @constructor */
  public constructor() { }

}

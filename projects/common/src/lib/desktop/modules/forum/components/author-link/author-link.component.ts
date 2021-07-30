import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Author } from '@jl/common/core/models/author';
import { Role } from '@jl/common/core/models/role';

/**
 * Author link component.
 * Renders <a> if user is attorney else renders <span>.
 */
@Component({
  selector: 'jlc-author-link',
  templateUrl: './author-link.component.html',
  styleUrls: ['./author-link.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorLinkComponent {
  /** Author. */
  @Input() public author: Author;

  /** Author's user type */
  @Input() public authorUserType: Role;

  /** Roles. */
  public roles = Role;

}

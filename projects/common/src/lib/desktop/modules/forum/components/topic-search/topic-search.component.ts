import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Role } from '@jl/common/core/models/role';
import { User } from '@jl/common/core/models/user';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { Observable } from 'rxjs';

/**
 * Topic search component.
 */
@Component({
  selector: 'jlc-topic-search',
  templateUrl: './topic-search.component.html',
  styleUrls: ['./topic-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicSearchComponent {
  /**
   * Current user info.
   */
  public readonly currentUser$: Observable<User>;

  /**
   * Full name of a user.
   */
  @Input()
  public username: string;

  /**
   * Emitter for query.
   */
  @Output()
  public searchQueryChange = new EventEmitter<string>();

  /**
   * @constructor
   *
   * @param userService Service to retrieve user info.
   */
  public constructor(
    private readonly userService: CurrentUserService,
  ) {
    this.currentUser$ = this.userService.currentUser$;
  }

  /**
   * Check for attorney user.
   *
   * @param role Current user role.
   */
  public isAttorney(role: Role): boolean {
    return role === Role.Attorney;
  }

  /**
   * Emit new value.
   */
  public onInputChange(value: string): void {
    if (!value) {
      return;
    }
    this.searchQueryChange.emit(value);
  }
}

import { Component, ChangeDetectionStrategy, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { User } from '@jl/common/core/models/user';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** User selectlist component. */
@Component({
  selector: 'jlc-user-selectlist',
  templateUrl: './user-selectlist.component.html',
  styleUrls: ['./user-selectlist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UserSelectlistComponent),
    multi: true,
  }],
})
export class UserSelectlistComponent implements ControlValueAccessor {
  /** Available users to select. */
  @Input()
  public options: User[] = [];

  /** Whether to show the pagination button. */
  @Input()
  public canLoadMore = false;

  /** Items that can not be unselected. */
  @Input()
  public preselected: User[] = [];

  /** Emits when user requested more users for the list. */
  @Output()
  public readonly loadMore = new EventEmitter<void>();

  /** Selected users. */
  public readonly selectedUsers$ = new BehaviorSubject<User[]>([]);

  /** Trackby function. */
  public readonly trackById = trackById;

  private readonly onTouchedCallbacks: Array<() => void> = [];
  private readonly onChangeCallbacks: Array<(val: User[]) => void> = [];
  private touched = false;

  /** @inheritdoc */
  public writeValue(users: User[]): void {
    this.selectedUsers$.next(users.slice() || []);
  }

  /** @inheritdoc */
  public registerOnChange(fn: (val: User[]) => void): void {
    this.onChangeCallbacks.push(fn);
  }

  /** @inheritdoc */
  public registerOnTouched(fn: () => void): void {
    this.onTouchedCallbacks.push(fn);
  }

  /** Handle toggling user option. */
  public onToggleUser(user: User): void {
    const selectedUsers = this.selectedUsers$.value;
    const userIdx = selectedUsers.findIndex((a) => a.id === user.id);
    if (userIdx !== -1) {
      selectedUsers.splice(userIdx, 1);
    } else {
      selectedUsers.push(user);
    }

    if (!this.touched) {
      this.touched = true;
      this.onTouchedCallbacks.forEach(cb => cb());
    }
    this.onChangeCallbacks.forEach(cb => cb(selectedUsers.slice()));
  }

  /**
   * Shows whether the user is selected already.
   * @param user User to check.
   */
  public isSelected(user: User): Observable<boolean> {
    return this.selectedUsers$.pipe(
      map(users => users.find(a => user.id === a.id) != null),
    );
  }

  /** Emit event to load more users. */
  public onLoadMoreClick(): void {
    this.loadMore.emit();
  }

  /** Can person be selected. */
  public isEditable(user: User): boolean {
    return this.preselected.find(({ id }) => user.id === id) == null;
  }
}

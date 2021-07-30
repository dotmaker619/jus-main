import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Attorney } from '@jl/common/core/models/attorney';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { UsersService } from '@jl/common/core/services/users.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { switchMap, map, startWith, first, filter, switchMapTo, tap } from 'rxjs/operators';

/** Followed attroneys page. */
@Component({
  selector: 'jlcl-followed-attorneys-page',
  templateUrl: './followed-attorneys-page.component.html',
  styleUrls: ['./followed-attorneys-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowedAttorneysPageComponent {
  /**
   * List of followed attorneys.
   */
  public readonly attorneys$: Observable<Attorney[]>;
  /**
   * Loading controller.
   */
  public readonly isLoading$ = new BehaviorSubject(false);

  private readonly updateAttorney$ = new Subject<void>();

  /**
   * @constructor
   *
   * @param usersService Users service.
   * @param alertService Alert service.
   */
  public constructor(
    private readonly usersService: UsersService,
    private readonly alertService: AlertService,
  ) {
    this.attorneys$ = this.initAttorneysStream();
  }

  /**
   * TrackBy function for the attorneys list.
   *
   * @param _ Idx.
   * @param item Attorney.
   */
  public trackAttorney(_: number, item: Attorney): number {
    return item.id;
  }

  /**
   * Handle 'click' of Unfollow button.
   *
   * @param attorneyId Attorney id.
   */
  public onUnfollowClick(attorneyId: number): void {
    const unfollowRequest$ = this.usersService.unfollowAttorney(attorneyId)
      .pipe(first());

    this.confirmUnfollow().pipe(
      first(),
      filter((isConfirmed) => isConfirmed),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(unfollowRequest$),
    ).subscribe(() => this.updateAttorney$.next());
  }

  private confirmUnfollow(): Observable<boolean> {
    return this.alertService.showConfirmation({
      buttonText: 'Yes',
      cancelButtonText: 'No',
      header: 'Unfollow Attorney?',
      message: 'Are you sure you want to unfollow this attorney?',
      isDangerous: true,
    });
  }

  private initAttorneysStream(): Observable<Attorney[]> {
    return this.updateAttorney$
      .pipe(
        startWith(null),
        switchMap(() => this.usersService.followedAttorneys()),
        map((pagination) => pagination.items),
        onMessageOrFailed(() => this.isLoading$.next(false)),
      );
  }
}

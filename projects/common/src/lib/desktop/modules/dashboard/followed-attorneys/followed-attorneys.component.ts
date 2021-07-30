import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Attorney } from '@jl/common/core/models/attorney';
import { UsersService } from '@jl/common/core/services/users.service';
import { DialogsService } from '@jl/common/shared';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

/**
 * Component with followed attorney list display.
 */
@Component({
  selector: 'jlc-followed-attorneys',
  templateUrl: './followed-attorneys.component.html',
  styleUrls: ['./followed-attorneys.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowedAttorneysComponent implements OnInit {

  /**
   * List of followed attorneys.
   */
  public attorneys$: Observable<Attorney[]>;
  /**
   * Define if loading is active.
   */
  public loading$ = new BehaviorSubject<boolean>(false);
  private updateAttorney$ = new BehaviorSubject<boolean>(true);
  private unfollowAttorney$ = new Subject<number>();

  /**
   * @constructor
   * @param usersService
   * @param dialogsService
   */
  public constructor(
    private usersService: UsersService,
    private dialogsService: DialogsService,
  ) { }

  /**
   * Trigger unfollow of the  attorney.
   * @param attorneyId
   */
  public unfollowAttorneyHandler(attorneyId: number): void {
    this.dialogsService.showConfirmationDialog({
      title: 'Unfollow Attorney?',
      message: 'Are you sure you want to unfollow this attorney?',
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.unfollowAttorney$.next(attorneyId);
    });
  }

  /**
   * @inheritDoc
   */
  public ngOnInit(): void {
    this.unfollowAttorney$
      .pipe(
        tap(() => this.loading$.next(true)),
        switchMap(attorneyId => this.usersService.unfollowAttorney(attorneyId)),
      )
      .subscribe(this.updateAttorney$);
    this.attorneys$ = this.updateAttorney$
      .pipe(
        tap(() => this.loading$.next(true)),
        switchMap(() => this.usersService.followedAttorneys()),
        map(pagination => pagination.items),
        tap(() => this.loading$.next(false)),
      );
  }

}

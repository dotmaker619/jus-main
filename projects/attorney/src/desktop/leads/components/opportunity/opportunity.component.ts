import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { Client, Topic, Post } from '@jl/common/core/models';
import { Attorney } from '@jl/common/core/models/attorney';
import { Role } from '@jl/common/core/models/role';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { UsersService } from '@jl/common/core/services/users.service';
import { DialogsService } from '@jl/common/shared';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

const IS_NOT_CLIENT_OPTIONS = {
  title: 'Error',
  message: 'It\'s not a client user.',
};

/**
 * Opportunity tab component.
 */
@Component({
  selector: 'jlat-opportunity',
  templateUrl: './opportunity.component.html',
  styleUrls: ['./opportunity.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityComponent {
  /**
   * List of clients for current attorney.
   */
  public readonly clients$: Observable<Client[]>;

  /** Opportunities. */
  public readonly opportunities$: Observable<Topic[]>;

  /** Current attorney. */
  public readonly attorney$: Observable<Attorney>;

  /** Attorney's location. */
  public location$: Observable<string[]>;

  /** Attorney's specialties. */
  public specialties$: Observable<string[]>;

  /** Keywords. */
  public keywords$: Observable<string[]>;

  /**
   * @constructor
   * @param userService
   * @param usersService Users service.
   * @param topicsService Topics service.
   * @param router Router.
   * @param activatedRoute Activated route.
   * @param dialogsService Dialogs service.
   */
  public constructor(
    private readonly userService: CurrentUserService,
    private readonly usersService: UsersService,
    private readonly topicsService: TopicsService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly dialogsService: DialogsService,
  ) {
    this.clients$ = this.usersService.getClients();
    this.opportunities$ = this.topicsService.getOpportunities({ ordering: '-created' });

    this.attorney$ = this.userService.getCurrentAttorney().pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.location$ = this.attorney$.pipe(
      map(attorney => {
        if (attorney.practiceJurisdictions) {
          return attorney.practiceJurisdictions.map(state => state.name);
        }
      }),
    );

    this.specialties$ = this.attorney$.pipe(
      map(attorney => {
        if (attorney.specialties) {
          return attorney.specialties.map(specialty => specialty.title);
        }
      }),
    );

    this.keywords$ = this.attorney$.pipe(map(attorney => attorney.keywords ? attorney.keywords.split(', ') : null));
  }

  /**
   * On start chatting clicked.
   * @param post Post.
   */
  public onStartChattingClicked(post: Post): void {
    if (post == null) {
      return;
    }
    if (post.userType !== Role.Client) {
      this.dialogsService.showInformationDialog(IS_NOT_CLIENT_OPTIONS);
      return;
    }
    const queryParams: Params = {
      clientId: post.author.id.toString(),
    };
    this.router.navigate(['./active'], { queryParams, relativeTo: this.activatedRoute });
  }
}

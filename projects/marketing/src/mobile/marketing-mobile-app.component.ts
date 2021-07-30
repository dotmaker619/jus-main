import { trigger, transition, style, animate } from '@angular/animations';
import { Component } from '@angular/core';
import { Link } from '@jl/common/core/models';
import { Role } from '@jl/common/core/models/role';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Marketing app component.
 */
@Component({
  selector: 'jlmar-marketing-mobile-app',
  templateUrl: 'marketing-mobile-app.component.html',
  styleUrls: ['marketing-mobile-app.component.css'],
  animations: [
    trigger(
      'enterMenuList', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms', style({ height: '0', opacity: 0 })),
      ]),
    ]),
    trigger(
      'fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms'),
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class MarketingMobileAppComponent {

  private logoutButtons: Link[] = [
    { link: '/auth/login', label: 'Login' },
    { link: '/auth/register', label: 'Register' },
  ];

  private marketingLinks: Link[] = [
    { link: '/', label: 'Home' },
    { link: '/attorney-search', label: 'Find an Attorney' },
    { link: '/forum', label: 'Jus-Law Forums' },
    { link: '/news', label: 'Jus-Law News' },
    { link: '/social', label: 'Social' },
    { link: this.appConfig.aboutUsPageUrl, isExternal: true, label: 'About Us' },
  ];

  /** Is navigation list opened. */
  public readonly isHeaderExpanded$ = new BehaviorSubject<boolean>(false);

  /** Navigation links. */
  public readonly navigationLinks$: Observable<Link[]>;

  /** Navigation buttons. */
  public readonly navigationButtons$: Observable<Link[]>;

  /**
   * @constructor
   * @param appConfig App config.
   * @param userService User service.
   */
  public constructor(
    private readonly appConfig: AppConfigService,
    public readonly userService: CurrentUserService,
  ) {
    this.navigationLinks$ = this.generateNavigationLinks();
    this.navigationButtons$ = this.generateNavigationButtons();
  }

  private generateNavigationLinks(): Observable<Link[]> {
    return this.userService.currentUser$.pipe(
      map((user) => {
        if (!user) {
          return this.marketingLinks;
        }

        const userSpecificRoutes: Link[] = [
          { link: '/', label: `Go to ${Role.toReadable(user.role)} functionality` },
          { link: '/auth/logout', label: 'Logout' },
        ];
        return this.marketingLinks.concat(userSpecificRoutes);
      }),
    );
  }

  private generateNavigationButtons(): Observable<Link[] | null> {
    return this.userService.currentUser$.pipe(
      map(user => user ? null : this.logoutButtons),
    );
  }

  /** Close menu on click. */
  public closeMenu(): void {
    if (this.isHeaderExpanded$.value) {
      this.isHeaderExpanded$.next(false);
    }
  }

  /** External link to about us page. */
  public get aboutUsUrl(): string {
    return this.appConfig.aboutUsPageUrl;
  }

  /** Toggle menu. */
  public onToggleMenu(): void {
    this.isHeaderExpanded$.next(!this.isHeaderExpanded$.value);
  }
}

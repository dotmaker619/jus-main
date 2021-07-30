import { Component, ChangeDetectionStrategy, ElementRef, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { DestroyableBase } from '@jl/common/core';
import { Role } from '@jl/common/core/models/role';
import { AuthService } from '@jl/common/core/services/auth.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { NEVER, throwError, of } from 'rxjs';
import { catchError, takeUntil, switchMap, mapTo } from 'rxjs/operators';

/**
 * Application root component.
 */
@Component({
  selector: 'jlat-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends DestroyableBase implements OnInit {

  /**
   * @constructor
   * @param platform
   * @param statusBar
   * @param elementRef
   * @param deepLinksService
   * @param ngZone
   * @param router
   */
  public constructor(
    private readonly platform: Platform,
    private readonly statusBar: StatusBar,
    private readonly elementRef: ElementRef,
    private readonly deepLinksService: Deeplinks,
    private readonly ngZone: NgZone,
    private readonly router: Router,
  ) {
    super();
    this.platform.ready().then(() => {
      const computedStyle = getComputedStyle(this.elementRef.nativeElement);
      // Trim necessary, because getPropertyValue returns color with spaces
      const pageTitleColor = computedStyle.getPropertyValue('--page-title-color').trim();
      statusBar.backgroundColorByHexString(pageTitleColor);

      // Need to call statusBar.overlaysWebView(false) to enable color changing on iOS.
      if (this.platform.is('ios')) {
        this.statusBar.overlaysWebView(false);
      }
    });
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    this.runDeepLinksWatching();
  }

  private runDeepLinksWatching(): void {
    if (!this.platform.is('cordova')) {
      return;
    }
    this.platform.ready().then(() => {
      this.deepLinksService.route({}) // No some specific routes. We try to use got route "as is" with Angular router.
        .pipe(
          catchError(error => {
            if ('$link' in error) {
              /**
               * This is "link no match error". Try to navigate with Angular router.
               * Have to run in Zone because Deeplinks service works outside of it.
               * Display dialog if requested url didn't match any route of the app.
               */
              this.ngZone.run(() => this.router.navigateByUrl(error.$link.path))
                .catch(routerError =>
                  console.warn('Could not match deep link to any application route', routerError.$link.path, routerError));
              // To continue watching deep links.
              return NEVER;
            }
            return throwError(error);
          }),
          takeUntil(this.destroy$),
        )
        .subscribe();
    });
  }
}

import { NgModule, Inject } from '@angular/core';
import { Routes, RouterModule, Router, Route, NavigationEnd } from '@angular/router';
import { Role } from '@jl/common/core/models/role';
import { AuthService } from '@jl/common/core/services/auth.service';
import { combineLatest, fromEvent } from 'rxjs';
import { filter, first, map, distinctUntilChanged, debounceTime, startWith } from 'rxjs/operators';

import { AnotherAppGuard } from '../core/guards/another-app.guard';
import { CommonSharedModule } from '../shared/shared.module';

import { SplashScreenComponent } from './splash-screen/splash-screen.component';

const WINDOW_TOKEN = 'windowObject';

/** Device type. */
enum DeviceType {
  /** Mobile device. */
  Mobile = 'mobile',
  /** Desktop. */
  Desktop = 'desktop',
}

function widthToDeviceType(width: number): DeviceType {
  if (width < 724) {
    return DeviceType.Mobile;
  }
  return DeviceType.Desktop;
}

const splashScreenRoute: Route = {
  path: '**',
  component: SplashScreenComponent,
};

// Marketing routes. Available for all types of users. May be considered as shared.
const marketingRoutes: Record<DeviceType, Route> = {
  desktop: {
    path: '',
    canLoad: [AnotherAppGuard],
    loadChildren: () => import('@jl/marketing/desktop/marketing-desktop-app.module').then(m => m.MarketingDesktopAppModule),
  },
  mobile: {
    path: '',
    canLoad: [AnotherAppGuard],
    loadChildren: () => import('@jl/marketing/mobile/marketing-mobile-app.module').then(m => m.MarketingMobileAppModule),
  },
};

type RouteOptions = Record<Role, Record<DeviceType, Route[]>>;
const routeOptions: RouteOptions = {
  unauthorized: {
    desktop: [marketingRoutes.desktop],
    mobile: [marketingRoutes.mobile],
  },
  attorney: {
    desktop: [
      {
        path: '',
        loadChildren: () => import('@jl/attorney/desktop/attorney-desktop-app.module').then(m => m.AttorneyDesktopAppModule),
      },
      marketingRoutes.desktop,
    ],
    mobile: [
      {
        path: '',
        loadChildren: () => import('@jl/attorney/mobile/attorney-mobile-app.module').then(m => m.AttorneyMobileAppModule),
      },
      marketingRoutes.mobile,
    ],
  },
  client: {
    desktop: [
      {
        path: '',
        loadChildren: () => import('@jl/client/desktop/client-desktop-app.module').then(m => m.ClientDesktopAppModule),
      },
      marketingRoutes.desktop,
    ],
    mobile: [
      {
        path: '',
        loadChildren: () => import('@jl/client/mobile/client-mobile-app.module').then(m => m.ClientMobileAppModule),
      },
      marketingRoutes.mobile,
    ],
  },
  support: {
    desktop: [
      {
        path: '',
        loadChildren: () => import('@jl/staff/desktop/staff-desktop-app.module').then(m => m.StaffDesktopAppModule),
      },
      marketingRoutes.desktop,
    ],
    mobile: [
      {
        path: '',
        loadChildren: () => import('@jl/staff/mobile/staff-mobile-app.module').then(m => m.StaffMobileAppModule),
      },
      marketingRoutes.mobile,
    ],
  },
};

const routes: Routes = [
  splashScreenRoute, // To have time to prepare routes
];

/**
 * Application's routing module.
 *
 * @description We have a complex navigation logic depending on a *device* and *role*.
 * Initially, with the purpose to have time to prepare the routes, only a *splash screen* is visible to a user.
 * After loading the required data, main route (path: '')
 *  would be replaced with: **marketing**, **client** or **attorney** module.
 * All the modules have two versions of them - for desktop and for mobile device.
 * It is loaded dynamically because the designs for mobile/desktop significantly differs
 *  and mobile modules are strongly dependent on Ionic's components, desktop modules aren't.
 * (Also, one should keep in mind that the logic (screens, navigation etc) between roles differs too)
 */
@NgModule({
  declarations: [SplashScreenComponent],
  imports: [RouterModule.forRoot(routes), CommonSharedModule],
  providers: [
    { provide: WINDOW_TOKEN, useValue: window },
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {

  /** Current main route. */
  public updateRoutes(newRoutes: Routes): void {
    this.router.resetConfig(newRoutes);

    // Update the route to get on prepared page
    this.router.navigateByUrl(this.router.url);
  }

  /**
   * @constructor
   * @param authService Auth service.
   * @param platformService Platform service.
   * @param router Router.
   */
  public constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    @Inject(WINDOW_TOKEN) private window: Window,
  ) {
    const deviceType$ = fromEvent(this.window, 'resize')
      .pipe(
        map(event => (event.target as Window).innerWidth),
        startWith(window.innerWidth),
        map(widthToDeviceType),
        distinctUntilChanged(),
        debounceTime(500),
      );
    /**
     * Wait for initial navigation to happen
     *  so that we would be able to replace splash screen with a corrent set of routes
     */
    const navigationEnd$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      first(),
    );
    combineLatest([ //
      this.authService.userType$,
      deviceType$,
      navigationEnd$,
    ]).subscribe(
      ([role, deviceType]) =>
        this.updateRoutes(routeOptions[role][deviceType]),
    );
  }
}

# Attorney

This library contains all the view logic for an application for Attorneys.

## Using

Simply lazy load one of main modules to obtain the application
e.g:

```
const attorneyDesktopRoute: Route = {
  path: '',
  loadChildren: () => import('@jl/attorney/desktop/attorney-desktop-app.module').then(m => m.AttorneyDesktopAppModule),
};

const attorneyMobileRoute: Route = {
  path: '',
  loadChildren: () => import('@jl/attorney/mobile/attorney-mobile-app.module').then(m => m.AttorneyMobileAppModule),
};
```
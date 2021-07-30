# Client

This library contains all the view logic for an application for Clients.

## Using

Simply lazy load one of main modules to obtain the application
e.g:

```
const clientRoute: Route = {
  path: '',
  loadChildren: () => import('@jl/client/desktop/client-desktop-app.module').then(m => m.ClientDesktopAppModule),
};
```
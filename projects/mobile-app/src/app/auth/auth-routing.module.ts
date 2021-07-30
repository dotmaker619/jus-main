import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LogoutComponent} from '@jl/common/shared/components/logout/logout.component';

import {ClientUserFallbackComponent} from './client-user-fallback/client-user-fallback.component';
import {LoginComponent} from './login/login.component';
import {PasswordResetConfirmationComponent} from './password-reset-confirmation/password-reset-confirmation.component';
import {PasswordResetComponent} from './password-reset/password-reset.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'logout',
    component: LogoutComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'password-reset',
    component: PasswordResetComponent,
  },
  {
    path: 'password-change-confirm',
    component: PasswordResetConfirmationComponent,
  },
  {
    path: 'client-fallback',
    component: ClientUserFallbackComponent,
  },
];

/** Routing for auth module */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanLeavePageGuard } from '@jl/common/core/guards/can-leave-page.guard';
import { LogoutComponent } from '@jl/common/shared/components/logout/logout.component';

import { AuthComponent } from './auth.component';
import { CanAuthorizeGuard } from './guards/can-authorize.guard';
import { LoginComponent } from './login/login.component';
import { PasswordResetConfirmationComponent } from './password-reset-confirmation/password-reset-confirmation.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { PreLogoutComponent } from './pre-logout/pre-logout.component';

const routes: Routes = [
  {
    path: '', component: AuthComponent,
    children: [
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
        canActivate: [CanAuthorizeGuard],
        canDeactivate: [CanLeavePageGuard],
      },
      {
        path: 'password-reset',
        canActivate: [CanAuthorizeGuard],
        component: PasswordResetComponent,
      },
      {
        path: 'password-change-confirm',
        canActivate: [CanAuthorizeGuard],
        component: PasswordResetConfirmationComponent,
      },
      {
        path: 'pre-logout',
        component: PreLogoutComponent,
      },
    ],
  },
];

/** Routing for auth module */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule { }

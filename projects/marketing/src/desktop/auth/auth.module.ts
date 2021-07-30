import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationGuard } from '@jl/common/core/guards/register-page.guard';
import { CanAuthorizeGuard } from '@jl/common/shared/modules/auth/guards/can-authorize.guard';

import { AuthComponent } from './auth.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@jl/common/shared/modules/auth/auth.module').then(m => m.AuthModule),
      },
      {
        path: 'register',
        loadChildren: () => import('@jl/common/desktop/modules/register/register.module').then(m => m.RegisterModule),
        canActivate: [RegistrationGuard, CanAuthorizeGuard],
      },
    ],
  },
];

/** Auth module for desktop. */
@NgModule({
  declarations: [AuthComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
})
export class AuthModule { }

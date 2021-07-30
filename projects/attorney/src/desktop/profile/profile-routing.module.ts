import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountInfoComponent } from './account-info-page/account-info-page.component';
import { ProfileEditPageComponent } from './profile-edit-page/profile-edit-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'account-info',
    pathMatch: 'full',
  },
  {
    path: 'account-info',
    component: AccountInfoComponent,
  },
  {
    path: 'edit',
    component: ProfileEditPageComponent,
  },
];

/**
 * Profile routing module.
 */
@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class ProfileRoutingModule { }

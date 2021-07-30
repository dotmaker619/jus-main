import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientInfoPageComponent } from './client-info-page/client-info-page.component';
import { ProfileEditPageComponent } from './profile-edit-page/profile-edit-page.component';

/**
 * Profile routes.
 */
const routes: Routes = [
  {
    path: '',
    redirectTo: 'account',
    pathMatch: 'full',
  },
  {
    path: 'account',
    component: ClientInfoPageComponent,
  },
  {
    path: 'edit',
    component: ProfileEditPageComponent,
  },
];

/**
 * Client profile routing module.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule { }

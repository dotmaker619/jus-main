import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanLeavePageGuard } from '@jl/common/core/guards/can-leave-page.guard';

import { AttorneyRegistrationComponent } from './attorney-registration/attorney-registration.component';
import { ClientRegistrationComponent } from './client-registration/client-registration.component';
import { RegistrationSelectComponent } from './registration-select/registration-select.component';
import { StaffRegistrationComponent } from './staff-registration/staff-registration.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'select-type',
  },
  {
    path: 'select-type',
    component: RegistrationSelectComponent,
  },
  {
    path: 'attorney',
    component: AttorneyRegistrationComponent,
    canDeactivate: [CanLeavePageGuard],
  },
  {
    path: 'client',
    component: ClientRegistrationComponent,
    canDeactivate: [CanLeavePageGuard],
  },
  {
    path: 'staff',
    component: StaffRegistrationComponent,
    canDeactivate: [CanLeavePageGuard],
  },
];

/**
 * Register module routing.
 */
@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class RegisterRoutingModule { }

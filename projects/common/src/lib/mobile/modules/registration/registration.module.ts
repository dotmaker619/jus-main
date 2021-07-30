import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { DetailsCardComponent } from './components/details-card/details-card.component';
import { RegistrationComponent } from './registration.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: RegistrationComponent },
  {
    path: 'attorney',
    loadChildren: () => import('./attorney-registration/attorney-registration.module').then(m => m.AttorneyRegistrationModule),
  },
  {
    path: 'client',
    loadChildren: () => import('./client-registration/client-registration.module').then(m => m.ClientRegistrationModule),
  },
  {
    path: 'staff',
    loadChildren: () => import('./staff-registration/staff-registration.module').then(m => m.StaffRegistrationModule),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

/** Registration module for mobile. */
@NgModule({
  declarations: [RegistrationComponent, DetailsCardComponent],
  imports: [
    CommonModule,
    CommonSharedModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
})
export class RegistrationModule { }

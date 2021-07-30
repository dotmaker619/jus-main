import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { AttorneyProfilePageComponent } from './attorney-profile-page/attorney-profile-page.component';

export const routes: Routes = [
  { path: 'profile/:id', component: AttorneyProfilePageComponent },
];

/** Attorneys module. */
@NgModule({
  declarations: [AttorneyProfilePageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    CommonMobileModule,
    CommonSharedModule,
  ],
})
export class AttorneysModule { }

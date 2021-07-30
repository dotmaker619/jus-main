import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { AttorneyProfilePageComponent } from './attorney-profile-page/attorney-profile-page.component';

const routes = [
  { path: 'profile/:id', component: AttorneyProfilePageComponent },
];

/** Attorneys module. */
@NgModule({
  declarations: [AttorneyProfilePageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    MatTabsModule,
    AgmCoreModule,
  ],
})
export class AttorneysModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { CommonMobileModule } from '../../mobile.module';

import { SocialPageComponent } from './social-page/social-page.component';
import { SocialPostDetailsPageComponent } from './social-post-details-page/social-post-details-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: SocialPageComponent },
  { path: ':id', component: SocialPostDetailsPageComponent },
];

/** Social module. */
@NgModule({
  declarations: [
    SocialPageComponent,
    SocialPostDetailsPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    CommonMobileModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SocialModule { }

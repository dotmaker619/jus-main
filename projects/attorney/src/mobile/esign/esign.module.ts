import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { ConsentPageComponent } from './consent-page/consent-page.component';

const routes: Routes = [
  { path: 'consent', component: ConsentPageComponent },
];

/**
 * ESign module.
 */
@NgModule({
  declarations: [ConsentPageComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
  ],
})
export class EsignModule { }

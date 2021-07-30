import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { ESignConsentComponent } from './pages/consent-page/consent-page.component';

const routes: Routes = [
  { path: 'consent', component: ESignConsentComponent },
];

/** ESign module. */
@NgModule({
  declarations: [
    ESignConsentComponent,
  ],
  imports: [
    CommonModule,
    CommonSharedModule,
    RouterModule.forChild(routes),
  ],
})
export class ESignModule { }

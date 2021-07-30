import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { CommonMobileModule } from '../../mobile.module';

import { NewsDetailsComponent } from './news-details/news-details.component';
import { NewsPageComponent } from './news-page/news-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: NewsPageComponent },
  { path: ':id', component: NewsDetailsComponent },
];

/** News module. */
@NgModule({
  declarations: [
    NewsPageComponent,
    NewsDetailsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    CommonMobileModule,
    IonicModule,
  ],
})
export class NewsModule { }

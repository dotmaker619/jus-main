import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttorneySharedModule } from '@jl/attorney/shared/shared.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { CommonDesktopModule } from '../../desktop.module';

import { NewsListItemComponent } from './components/news-list-item/news-list-item.component';
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
    NewsListItemComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    CommonDesktopModule,
    AttorneySharedModule,
  ],
})
export class NewsModule { }

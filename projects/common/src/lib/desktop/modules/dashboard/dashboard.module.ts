import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { ClientSharedModule } from '@jl/client/shared/client-shared.module';
import { environment } from '@jl/env/environment';
import { NgxPermissionsModule } from 'ngx-permissions';

import { CommonDesktopModule } from '../../desktop.module';

import { AttorneySearchResultsComponent } from './attorney-search-results/attorney-search-results.component';
import { AttorneySearchComponent } from './components/attorney-search/attorney-search.component';
import { FeaturedAttorneysComponent } from './components/featured-attorneys/featured-attorneys.component';
import { FollowedAttorneyDetailComponent } from './components/followed-attorney-detail/followed-attorney-detail.component';
import { ForumCategoriesComponent } from './components/forum-categories/forum-categories.component';
import { RecentActivityComponent } from './components/recent-activity/recent-activity.component';
import { SponsoredAttorneysComponent } from './components/sponsored-attorneys/sponsored-attorneys.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FollowedAttorneysComponent } from './followed-attorneys/followed-attorneys.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
  },
  {
    path: 'followed-attorneys',
    component: FollowedAttorneysComponent,
  },
  {
    path: 'attorney-search',
    component: AttorneySearchResultsComponent,
  },
];

/** Client dashboard module */
@NgModule({
  declarations: [
    DashboardComponent,
    ForumCategoriesComponent,
    RecentActivityComponent,
    FeaturedAttorneysComponent,
    FollowedAttorneysComponent,
    FollowedAttorneyDetailComponent,
    AttorneySearchComponent,
    AttorneySearchResultsComponent,
    SponsoredAttorneysComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ClientSharedModule,
    MatTabsModule,
    AgmCoreModule.forRoot(environment.googleMap),
    ReactiveFormsModule,
    NgxPermissionsModule.forChild(),
    CommonDesktopModule,
  ],
})
export class DashboardModule { }

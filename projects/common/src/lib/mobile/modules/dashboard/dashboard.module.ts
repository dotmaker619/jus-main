import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ClientSharedModule } from '@jl/client/shared/client-shared.module';
import { environment } from '@jl/env/environment';
import { NgxPermissionsModule } from 'ngx-permissions';

import { CommonMobileModule } from '../../mobile.module';

import { AttorneySearchResultsMobileComponent } from './attorney-search-results-mobile/attorney-search-results-mobile.component';
import { AttorneyCardComponent } from './components/attorney-card/attorney-card.component';
import { AttorneySearchComponent } from './components/attorney-search/attorney-search.component';
import { FeaturedAttorneysComponent } from './components/featured-attorneys/featured-attorneys.component';
import { ForumCategoriesComponent } from './components/forum-categories/forum-categories.component';
import { RecentActivityComponent } from './components/recent-activity/recent-activity.component';
import { SponsoredAttorneysComponent } from './components/sponsored-attorneys/sponsored-attorneys.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
  },
  {
    path: 'attorney-search',
    component: AttorneySearchResultsMobileComponent,
  },
];

/** Dashboard module. */
@NgModule({
  declarations: [
    DashboardComponent,
    AttorneySearchComponent,
    FeaturedAttorneysComponent,
    ForumCategoriesComponent,
    RecentActivityComponent,
    AttorneySearchResultsMobileComponent,
    AttorneyCardComponent,
    SponsoredAttorneysComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    ClientSharedModule,
    CommonMobileModule,
    MatTabsModule,
    AgmCoreModule.forRoot(environment.googleMap),
    FormsModule,
    ReactiveFormsModule,
    NgxPermissionsModule.forChild(),
  ],
})
export class DashboardModule { }

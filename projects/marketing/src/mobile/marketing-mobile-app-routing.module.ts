import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanLeavePageGuard } from '@jl/common/core/guards/can-leave-page.guard';
import { NotFoundComponent } from '@jl/common/shared/components/not-found/not-found.component';
import { PrivacyPolicePageComponent } from '@jl/common/shared/pages/privacy-police-page/privacy-police-page.component';
import { TermsOfUsePageComponent } from '@jl/common/shared/pages/terms-of-use-page/terms-of-use-page.component';

import { CanLeavePageMobileGuard } from './guards/can-leave-page-mobile.guard';
import { MarketingMobileAppComponent } from './marketing-mobile-app.component';

export const routes: Routes = [
  {
    path: '',
    component: MarketingMobileAppComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@jl/common/mobile/modules/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
      },
      {
        path: 'forum',
        loadChildren: () => import('@jl/common/mobile/modules/forum/forum.module').then(m => m.ForumModule),
      },
      {
        path: 'attorneys',
        loadChildren: () => import('@jl/common/mobile/modules/attorneys/attorneys.module').then(m => m.AttorneysModule),
      },
      {
        path: 'news',
        loadChildren: () => import('@jl/common/mobile/modules/news/news.module').then(m => m.NewsModule),
      },
      {
        path: 'social',
        loadChildren: () => import('@jl/common/mobile/modules/social/social.module').then(m => m.SocialModule),
      },
      {
        path: 'terms-of-use',
        component: TermsOfUsePageComponent,
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicePageComponent,
      },
      {
        path: 'not-found',
        component: NotFoundComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/',
  },
];

/** Routing module for marketing module. */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    { provide: CanLeavePageGuard, useClass: CanLeavePageMobileGuard },
  ],
})
export class MarketingMobileAppRoutingModule { }

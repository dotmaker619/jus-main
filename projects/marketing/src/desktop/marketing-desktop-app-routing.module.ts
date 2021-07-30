import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from '@jl/common/shared/components/not-found/not-found.component';
import { PrivacyPolicePageComponent } from '@jl/common/shared/pages/privacy-police-page/privacy-police-page.component';
import { TermsOfUsePageComponent } from '@jl/common/shared/pages/terms-of-use-page/terms-of-use-page.component';

import { MarketingDesktopAppComponent } from './marketing-desktop-app.component';

export const routes: Routes = [
  {
    path: '',
    component: MarketingDesktopAppComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
      },
      {
        path: 'attorneys',
        loadChildren: () => import('@jl/common/desktop/modules/attorneys/attorneys.module').then(m => m.AttorneysModule),
      },
      {
        path: '',
        loadChildren: () => import('@jl/common/desktop/modules/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'forum',
        loadChildren: () => import('@jl/common/desktop/modules/forum/forum.module').then(m => m.ForumModule),
      },
      {
        path: 'news',
        loadChildren: () => import('@jl/common/desktop/modules/news/news.module').then(m => m.NewsModule),
      },
      {
        path: 'social',
        loadChildren: () => import('./social/social.module').then(m => m.SocialModule),
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
})
export class MarketingDesktopAppRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from '@jl/common/shared/components/not-found/not-found.component';
import { PrivacyPolicePageComponent } from '@jl/common/shared/pages/privacy-police-page/privacy-police-page.component';
import { TermsOfUsePageComponent } from '@jl/common/shared/pages/terms-of-use-page/terms-of-use-page.component';

import { ClientMobileAppComponent } from './client-mobile-app.component';

const routes: Routes = [
  {
    path: '',
    component: ClientMobileAppComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@jl/common/mobile/modules/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'forum',
        loadChildren: () => import('@jl/common/mobile/modules/forum/forum.module').then(m => m.ForumModule),
      },
      {
        path: 'notifications',
        loadChildren: () => import('@jl/common/mobile/modules/notifications/notifications.module').then(m => m.MobileNotificationsModule),
      },
      {
        path: 'matters',
        loadChildren: () => import('./matters/matters.module').then(m => m.MobileMattersModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
      },
      {
        path: 'attorneys',
        loadChildren: () => import('@jl/common/mobile/modules/attorneys/attorneys.module').then(m => m.AttorneysModule),
      },
      {
        path: 'followed-attorneys',
        loadChildren: () => import('./followed-attorneys/followed-attorneys.module').then(m => m.FollowedAttorneysModule),
      },
      {
        path: 'chats',
        loadChildren: () => import('./chats/chats.module').then(m => m.ChatsModule),
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
        path: 'invoices',
        loadChildren: () => import('./invoices/invoices.module').then(m => m.MobileInvoicesModule),
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
];

/**
 * Application base routing module.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@jl/common/core/guards/auth.guard';
import { NotFoundComponent } from '@jl/common/shared/components/not-found/not-found.component';
import { PrivacyPolicePageComponent } from '@jl/common/shared/pages/privacy-police-page/privacy-police-page.component';
import { TermsOfUsePageComponent } from '@jl/common/shared/pages/terms-of-use-page/terms-of-use-page.component';

import { ClientDesktopAppComponent } from './client-desktop-app.component';

const routes: Routes = [
  {
    path: '',
    component: ClientDesktopAppComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@jl/common/desktop/modules/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'notifications',
        canActivate: [AuthGuard],
        loadChildren: () => import('@jl/common/desktop/modules/notifications/notifications.module').then(m => m.NotificationsModule),
      },
      {
        path: 'chats',
        canActivate: [AuthGuard],
        loadChildren: () => import('./chats/chats.module').then(m => m.ChatsModule),
      },
      {
        path: 'matters',
        canActivate: [AuthGuard],
        loadChildren: () => import('@jl/common/desktop/modules/matters/matters.module').then(m => m.MattersModule),
      },
      {
        path: 'attorneys',
        loadChildren: () => import('@jl/common/desktop/modules/attorneys/attorneys.module').then(m => m.AttorneysModule),
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
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
        path: 'invoices',
        loadChildren: () => import('./invoices/invoices.module').then(m => m.InvoicesModule),
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicePageComponent,
      },
      {
        path: 'terms-of-use',
        component: TermsOfUsePageComponent,
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

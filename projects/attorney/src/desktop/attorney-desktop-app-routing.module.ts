import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttorneySubscriptionRequiredGuard } from '@jl/common/core/guards/attorney-subscription-required.guard';
import { NotFoundComponent } from '@jl/common/shared/components/not-found/not-found.component';
import { PrivacyPolicePageComponent } from '@jl/common/shared/pages/privacy-police-page/privacy-police-page.component';
import { TermsOfUsePageComponent } from '@jl/common/shared/pages/terms-of-use-page/terms-of-use-page.component';

import { SubscriptionModuleGuard } from '../shared/guards/subscription-module.guard';
import { NoActiveSubscriptionPageComponent } from '../shared/no-active-subscription-page/no-active-subscription-page.component';
import { AttorneySharedModule } from '../shared/shared.module';
import {
  SubscriptionIsNotAllowedPageComponent,
} from '../shared/subscription-is-not-allowed-page/subscription-is-not-allowed-page.component';

import { AttorneyDesktopAppComponent } from './attorney-desktop-app.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: '',
    component: AttorneyDesktopAppComponent,
    children: [
      {
        path: 'dashboard',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'matters',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('@jl/common/desktop/modules/matters/matters.module').then(m => m.MattersModule),
      },
      {
        path: 'forum',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('@jl/common/desktop/modules/forum/forum.module').then(m => m.ForumModule),
      },
      {
        path: 'leads',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./leads/leads.module').then(m => m.LeadsModule),
      },
      {
        path: 'notifications',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('@jl/common/desktop/modules/notifications/notifications.module').then(m => m.NotificationsModule),
      },
      {
        path: 'attorneys',
        loadChildren: () => import('@jl/common/desktop/modules/attorneys/attorneys.module').then(m => m.AttorneysModule),
      },
      {
        path: 'customizations',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./customizations/customizations.module').then(m => m.CustomizationsModule),
      },
      {
        path: 'profile',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
      },
      {
        path: 'attorneys',
        loadChildren: () => import('@jl/common/desktop/modules/attorneys/attorneys.module').then(m => m.AttorneysModule),
      },
      {
        path: 'invoices',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('@jl/common/desktop/modules/invoices/invoices.module').then(m => m.InvoicesModule),
      },
      {
        path: 'news',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('@jl/common/desktop/modules/news/news.module').then(m => m.NewsModule),
      },
      {
        path: 'social',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./social/social.module').then(m => m.SocialModule),
      },
      {
        path: 'events',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./events/events.module').then(m => m.EventsModule),
      },
      {
        path: 'clients',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./clients/clients.module').then(m => m.ClientsModule),
      },
      {
        path: 'esign',
        loadChildren: () => import('./esign/esign.module').then(m => m.ESignModule),
      },
      {
        path: 'documents',
        loadChildren: () => import('@jl/common/desktop/modules/documents/documents.module').then(m => m.DocumentsModule),
      },
      {
        path: 'subscription',
        canLoad: [SubscriptionModuleGuard],
        canActivate: [SubscriptionModuleGuard],
        loadChildren: () => import('@jl/common/shared/modules/attorney-subscription/subscription.module').then(m => m.SubscriptionModule),
      },
      {
        path: 'social',
        loadChildren: () => import('./social/social.module').then(m => m.SocialModule),
      },
      {
        path: 'connect',
        loadChildren: () => import('./direct-deposit/direct-deposit.module').then(m => m.DirectDepositModule),
      },
      {
        path: 'subscription-is-not-allowed',
        component: SubscriptionIsNotAllowedPageComponent,
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
    path: 'no-active-subscription',
    component: NoActiveSubscriptionPageComponent,
  },
];

/** Tablet workspace routing module. */
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    AttorneySharedModule,
  ],
  exports: [
    RouterModule,
  ],
})
export class AttorneyDesktopAppRoutingModule { }

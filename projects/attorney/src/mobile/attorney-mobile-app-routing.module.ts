import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttorneySubscriptionRequiredGuard } from '@jl/common/core/guards/attorney-subscription-required.guard';
import { NotFoundComponent } from '@jl/common/shared/components/not-found/not-found.component';
import { PrivacyPolicePageComponent } from '@jl/common/shared/pages/privacy-police-page/privacy-police-page.component';
import { TermsOfUsePageComponent } from '@jl/common/shared/pages/terms-of-use-page/terms-of-use-page.component';

import { SubscriptionModuleGuard } from '../shared/guards/subscription-module.guard';

import { AttorneyMobileAppComponent } from './attorney-mobile-app.component';
import { SubscriptionNotAllowedPageComponent } from './subscription-not-allowed-page/subscription-not-allowed-page.component';

const routes: Routes = [
  {
    path: '',
    component: AttorneyMobileAppComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.MobileDashboardModule),
      },
      {
        path: 'leads',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./leads/leads.module').then(m => m.MobileLeadsModule),
      },
      {
        path: 'matters',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./matters/matters.module').then(m => m.MobileMattersModule),
      },
      {
        path: 'profile',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./profile/profile.module').then(m => m.MobileProfileModule),
      },
      {
        path: 'clients',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./clients/clients.module').then(m => m.MobileClientsModule),
      },
      {
        path: 'attorneys',
        loadChildren: () => import('@jl/common/mobile/modules/attorneys/attorneys.module').then(m => m.AttorneysModule),
      },
      {
        path: 'customizations',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./customization/customization.module').then(m => m.MobileCustomizationModule),
      },
      {
        path: 'documents',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('@jl/common/mobile/modules/documents/documents.module').then(m => m.MobileDocumentsModule),
      },
      {
        path: 'events',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('./events/events.module').then(m => m.MobileEventsModule),
      },
      {
        path: 'invoices',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('@jl/common/mobile/modules/invoices/invoices.module').then(m => m.MobileInvoicesModule),
      },
      {
        path: 'notifications',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('@jl/common/mobile/modules/notifications/notifications.module').then(m => m.MobileNotificationsModule),
      },
      {
        path: 'subscription',
        canLoad: [SubscriptionModuleGuard],
        loadChildren: () => import('./subscriptions/subscriptions.module').then(m => m.MobileSubscriptionsModule),
      },
      {
        path: 'news',
        loadChildren: () => import('@jl/common/mobile/modules/news/news.module').then(m => m.NewsModule),
      },
      {
        path: 'social',
        loadChildren: () => import('./social/social.module').then(m => m.SocialModule),
      },
      {
        path: 'attorneys',
        loadChildren: () => import('@jl/common/mobile/modules/attorneys/attorneys.module').then(m => m.AttorneysModule),
      },
      {
        path: 'connect',
        loadChildren: () => import('./direct-deposit/direct-deposit.module').then(m => m.DirectDepositModule),
      },
      {
        path: 'subscription-is-not-allowed',
        component: SubscriptionNotAllowedPageComponent,
      },
      {
        path: 'forum',
        canActivate: [AttorneySubscriptionRequiredGuard],
        loadChildren: () => import('@jl/common/mobile/modules/forum/forum.module').then(m => m.ForumModule),
      },
      {
        path: 'esign',
        loadChildren: () => import('./esign/esign.module').then(m => m.EsignModule),
      },
      {
        path: 'not-found',
        component: NotFoundComponent,
      },
      {
        path: 'terms-of-use',
        component: TermsOfUsePageComponent,
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicePageComponent,
      },
    ],
  },
];

/** Mobile workspace routing module. */
@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class AttorneyMobileAppRoutingModule { }

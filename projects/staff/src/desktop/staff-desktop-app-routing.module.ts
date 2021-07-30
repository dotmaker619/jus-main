import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from '@jl/common/shared/components/not-found/not-found.component';
import { PrivacyPolicePageComponent } from '@jl/common/shared/pages/privacy-police-page/privacy-police-page.component';
import { TermsOfUsePageComponent } from '@jl/common/shared/pages/terms-of-use-page/terms-of-use-page.component';

import { CanPayStaffFeeGuard } from '../shared/guards/can-pay-staff-fee.guard';
import { CanUseStaffFunctionalityGuard } from '../shared/guards/can-use-staff-functionality.guard';

import { StaffDesktopAppComponent } from './staff-desktop-app.component';

const routes: Routes = [
  {
    path: 'payment',
    canActivate: [CanPayStaffFeeGuard],
    loadChildren: () => import('./staff-payment/staff-payment.module').then(m => m.StaffPaymentModule),
  },
  {
    path: '',
    component: StaffDesktopAppComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'matters' },
      {
        path: 'matters',
        canActivate: [CanUseStaffFunctionalityGuard],
        loadChildren: () => import('@jl/common/desktop/modules/matters/matters.module').then(m => m.MattersModule),
      },
      {
        path: 'profile',
        canActivate: [CanUseStaffFunctionalityGuard],
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
      },
      {
        path: 'notifications',
        canActivate: [CanUseStaffFunctionalityGuard],
        loadChildren: () => import('@jl/common/desktop/modules/notifications/notifications.module').then(m => m.NotificationsModule),
      },
      {
        path: 'invoices',
        canActivate: [CanUseStaffFunctionalityGuard],
        loadChildren: () => import('@jl/common/desktop/modules/invoices/invoices.module').then(m => m.InvoicesModule),
      },
      {
        path: 'documents',
        canActivate: [CanUseStaffFunctionalityGuard],
        loadChildren: () => import('@jl/common/desktop/modules/documents/documents.module').then(m => m.DocumentsModule),
      },
      {
        path: 'forum',
        canActivate: [CanUseStaffFunctionalityGuard],
        loadChildren: () => import('@jl/common/desktop/modules/forum/forum.module').then(m => m.ForumModule),
      },
      {
        path: 'attorneys',
        canActivate: [CanUseStaffFunctionalityGuard],
        loadChildren: () => import('@jl/common/desktop/modules/attorneys/attorneys.module').then(m => m.AttorneysModule),
      },
      {
        path: 'terms-of-use',
        canActivate: [CanUseStaffFunctionalityGuard],
        component: TermsOfUsePageComponent,
      },
      {
        path: 'privacy-policy',
        canActivate: [CanUseStaffFunctionalityGuard],
        component: PrivacyPolicePageComponent,
      },
      {
        path: 'not-found',
        component: NotFoundComponent,
      },
    ],
  },
];

/** Desktop routing module for staff. */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffDesktopAppRoutingModule { }

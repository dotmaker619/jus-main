import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SocialPageComponent } from '@jl/common/desktop/components/social-page/social-page.component';
import { SocialPostDetailsPageComponent } from '@jl/common/desktop/components/social-post-details-page/social-post-details-page.component';
import { CommonDesktopModule } from '@jl/common/desktop/desktop.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: SocialPageComponent },
  { path: ':id', component: SocialPostDetailsPageComponent },
];

/**
 * Social module.
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    CommonDesktopModule,
  ],
})
export class SocialModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { StaffDesktopAppRoutingModule } from './staff-desktop-app-routing.module';
import { StaffDesktopAppComponent } from './staff-desktop-app.component';

/** Desktop app module for staff. */
@NgModule({
  declarations: [StaffDesktopAppComponent],
  imports: [
    CommonModule,
    StaffDesktopAppRoutingModule,
    CommonSharedModule,
  ],
})
export class StaffDesktopAppModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';

import { StaffMobileAppRoutingModule } from './staff-mobile-app-routing.module';
import { StaffMobileAppComponent } from './staff-mobile-app.component';

/** Mobile app mobile for staff. */
@NgModule({
  declarations: [StaffMobileAppComponent],
  imports: [
    CommonModule,
    CommonMobileModule,
    StaffMobileAppRoutingModule,
    IonicModule,
  ],
})
export class StaffMobileAppModule { }

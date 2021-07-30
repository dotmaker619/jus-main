import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { MarketingMobileAppRoutingModule } from './marketing-mobile-app-routing.module';
import { MarketingMobileAppComponent } from './marketing-mobile-app.component';

/** Marketing module contains all the pages available for all users even unauthorized. */
@NgModule({
  imports: [CommonModule, MarketingMobileAppRoutingModule, IonicModule],
  declarations: [MarketingMobileAppComponent],
})
export class MarketingMobileAppModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { MarketingDesktopAppRoutingModule } from './marketing-desktop-app-routing.module';
import { MarketingDesktopAppComponent } from './marketing-desktop-app.component';

/** Marketing module contains all the pages available for all users even unauthorized. */
@NgModule({
  imports: [CommonModule, MarketingDesktopAppRoutingModule, CommonSharedModule],
  declarations: [MarketingDesktopAppComponent],
})
export class MarketingDesktopAppModule { }

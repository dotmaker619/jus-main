import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { OpportunityItemComponent } from './components/opportunity-item/opportunity-item.component';

/**
 * Shared module for mobile workspace.
 */
@NgModule({
  declarations: [
    OpportunityItemComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    CommonSharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommonMobileModule,
  ],
  exports: [
    OpportunityItemComponent,
  ],
})
export class AttorneyMobileSharedModule { }

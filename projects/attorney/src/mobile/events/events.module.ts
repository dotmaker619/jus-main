import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { AttorneySharedModule } from '../../shared/shared.module';
import { AttorneyMobileSharedModule } from '../shared/shared.module';

import { EditEventModalComponent } from './component/edit-event-modal/edit-event-modal.component';
import { EventsPageComponent } from './events-page/events-page.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: EventsPageComponent,
  },
];

/** Events module for mobile workspace. */
@NgModule({
  declarations: [
    EventsPageComponent,
    EditEventModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    AttorneySharedModule,
    CommonSharedModule,
    CommonMobileModule,
    AttorneyMobileSharedModule,
  ],
  entryComponents: [
    EditEventModalComponent,
  ],
})
export class MobileEventsModule { }

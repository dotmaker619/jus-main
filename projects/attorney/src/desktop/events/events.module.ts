import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonDesktopModule } from '@jl/common/desktop/desktop.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { AttorneySharedModule } from '../../shared/shared.module';

import { EventFormPageComponent } from './event-form-page/event-form-page.component';
import { EventsPageComponent } from './events-page/events-page.component';

const routes = [
  { path: '', component: EventsPageComponent },
  { path: 'create', component: EventFormPageComponent },
  { path: 'edit/:id', component: EventFormPageComponent },
];

/** Events module. */
@NgModule({
  declarations: [EventsPageComponent, EventFormPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    ReactiveFormsModule,
    AttorneySharedModule,
    CommonDesktopModule,
  ],
})
export class EventsModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DropdownComponent } from './components/dropdown/dropdown.component';
import { DropdownContentDirective } from './directives/dropdown-content.directive';
import { DropdownToggleDirective } from './directives/dropdown-toggle.directive';

/** Dropdown module. */
@NgModule({
  declarations: [DropdownComponent, DropdownToggleDirective, DropdownContentDirective],
  imports: [
    CommonModule,
  ],
  exports: [DropdownComponent, DropdownToggleDirective, DropdownContentDirective],
})
export class DropdownModule { }

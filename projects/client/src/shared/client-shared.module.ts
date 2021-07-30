import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonSharedModule as CommonSharedModule } from '@jl/common/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

/**
 * Shared module for client.
 */
@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    MatTableModule,
    CommonSharedModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPermissionsModule.forChild(),
    MatMenuModule,
  ],
  exports: [
    CommonSharedModule,
  ],
})
export class ClientSharedModule { }

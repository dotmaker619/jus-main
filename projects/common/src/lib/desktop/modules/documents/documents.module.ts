import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material';
import { Routes, RouterModule } from '@angular/router';
import { CommonDesktopModule } from '@jl/common/desktop/desktop.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { ClientDocsComponent } from './components/client-docs/client-docs.component';
import { PrivateDocsComponent } from './components/private-docs/private-docs.component';
import { TemplateDocsComponent } from './components/template-docs/template-docs.component';
import { DocumentsPageComponent } from './documents-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: DocumentsPageComponent },
  { path: '**', redirectTo: '' },

];

/** Attorney documents page module. */
@NgModule({
  declarations: [DocumentsPageComponent, PrivateDocsComponent, ClientDocsComponent, TemplateDocsComponent],
  imports: [
    CommonModule,
    MatTabsModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommonDesktopModule,
  ],
})
export class DocumentsModule { }

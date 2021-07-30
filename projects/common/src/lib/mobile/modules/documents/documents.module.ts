import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { DocumentTemplatesPageComponent } from './document-templates-page/document-templates-page.component';
import { DocumentsPageComponent } from './documents-page/documents-page.component';
import { MatterDocumentsPageComponent } from './matter-documents-page/matter-documents-page.component';
import { PersonalDocumentsPageComponent } from './personal-documents-page/personal-documents-page.component';

export const routes: Routes = [
  {
    path: '',
    component: DocumentsPageComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'personal' },
      { path: 'personal', component: PersonalDocumentsPageComponent },
      { path: 'matter', component: MatterDocumentsPageComponent },
      { path: 'templates', component: DocumentTemplatesPageComponent },
    ],
  },
];

/** Documents module. */
@NgModule({
  declarations: [
    DocumentsPageComponent,
    MatterDocumentsPageComponent,
    PersonalDocumentsPageComponent,
    DocumentTemplatesPageComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    CommonMobileModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class MobileDocumentsModule { }

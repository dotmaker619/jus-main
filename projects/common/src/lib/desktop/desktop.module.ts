import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CommonSharedModule } from '../shared/shared.module';

import { BillingsTableComponent } from './components/billings-table/billings-table.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { JlpCarouselComponent } from './components/carousel/carousel.component';
import { ExportStatisticsDialogComponent } from './components/export-statistics/export-statistics.component';
import { InvoicesTableComponent } from './components/invoices-table/invoices-table.component';
import { PeopleFilterInputComponent } from './components/people-filter-input/people-filter-input.component';
import { PostDetailsComponent } from './components/post-details/post-details.component';
import { SocialPageComponent } from './components/social-page/social-page.component';
import { SocialPostDetailsPageComponent } from './components/social-post-details-page/social-post-details-page.component';
import { SocialPostsListComponent } from './components/social-posts-list/social-posts-list.component';
import { UserSelectlistItemComponent } from './components/user-selectlist/user-selectlist-item/user-selectlist-item.component';
import { UserSelectlistComponent } from './components/user-selectlist/user-selectlist.component';
import { EditDocumentDialogComponent } from './modals/edit-document-dialog/edit-document-dialog.component';

/**
 * Common module for desktop app.
 */
@NgModule({
  imports: [
    CommonModule,
    CommonSharedModule,
    MatMenuModule,
    RouterModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
  ],
  declarations: [
    BillingsTableComponent,
    PostDetailsComponent,
    SocialPostsListComponent,
    SocialPageComponent,
    SocialPostDetailsPageComponent,
    UserSelectlistComponent,
    UserSelectlistItemComponent,
    PeopleFilterInputComponent,
    JlpCarouselComponent,
    EditDocumentDialogComponent,
    InvoicesTableComponent,
    ExportStatisticsDialogComponent,
    BreadcrumbsComponent,
  ],
  exports: [
    BillingsTableComponent,
    PostDetailsComponent,
    SocialPostsListComponent,
    SocialPageComponent,
    SocialPostDetailsPageComponent,
    UserSelectlistComponent,
    UserSelectlistItemComponent,
    PeopleFilterInputComponent,
    JlpCarouselComponent,
    EditDocumentDialogComponent,
    InvoicesTableComponent,
    BreadcrumbsComponent,
  ],
  entryComponents: [
    EditDocumentDialogComponent,
    InvoicesTableComponent,
    ExportStatisticsDialogComponent,
  ],
})
export class CommonDesktopModule {

}

import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxMaskModule } from 'ngx-mask';

import { SharedModule } from '../shared';

import { BillableTimeCardComponent } from './components/billable-time-card/billable-time-card.component';
import { CardComponent } from './components/card/card.component';
import { CheckboxListCardComponent } from './components/checkbox-list-card/checkbox-list-card.component';
import { ClientInfoFormComponent } from './components/client-info-form/client-info-form.component';
import { CreateIndividualAccountComponent } from './components/create-individual-account/create-individual-account.component';
import { CreateOrganizationAccountComponent } from './components/create-organization-account/create-organization-account.component';
import { EditableProfileImageComponent } from './components/editable-profile-image/editable-profile-image.component';
import { EventCardComponent } from './components/event-card/event-card.component';
import { ExpandableCardComponent } from './components/expandable-card/expandable-card.component';
import { HeaderWithIconComponent } from './components/header-with-icon/header-with-icon.component';
import { InvoiceDetailsCardComponent } from './components/invoice-details-card/invoice-details-card.component';
import { InvoiceItemComponent } from './components/invoice-item/invoice-item.component';
import { InvoicesListComponent } from './components/invoices-list/invoices-list.component';
import { MatterDetailCardComponent } from './components/matter-detail-card/matter-detail-card.component';
import { MobileAccountInfoComponent } from './components/mobile-account-info-page/mobile-account-info-page.component';
import { MobileAttorneyProfileFormComponent } from './components/mobile-attorney-profile-form/mobile-attorney-profile-form.component';
import { MobileFileDropComponent } from './components/mobile-file-drop/mobile-file-drop.component';
import { PostDetailsComponent } from './components/post-details/post-details.component';
import { PostListItemComponent } from './components/post-list-item/post-list-item.component';
import { SelectableUserItemComponent } from './components/selectable-user-item/selectable-user-item.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { SkeletonListComponent } from './components/skeleton-list/skeleton-list.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { TabButtonComponent } from './components/tab-button/tab-button.component';
import { TimeLogsListComponent } from './components/time-logs-list/time-logs-list.component';
import { VerificatedAttorneyBadgeComponent } from './components/verificated-attorney-badge/verificated-attorney-badge.component';
import { DuplicateFileModalComponent } from './modals/duplicate-file-modal/duplicate-file-modal.component';
import { EditDocumentModalComponent } from './modals/edit-document-modal/edit-document-modal.component';
import { EditFolderModalComponent } from './modals/edit-folder-modal/edit-folder-modal.component';
import { ExportStatisticsModalComponent } from './modals/export-statistics-modal/export-statistics-modal.component';
import { LogTimeModalMobileComponent } from './modals/log-time-modal-mobile/log-time-modal-mobile.component';
import { MobileChangePasswordModalComponent } from './modals/mobile-change-password-form/mobile-change-password-modal.component';
import { PointsOnMapModalComponent } from './modals/points-on-map-modal/points-on-map-modal.component';
import { UploadFileModalComponent } from './modals/upload-file-modal/upload-file-modal.component';

/**
 * Common module for mobile app.
 */
@NgModule({
  declarations: [
    TabButtonComponent,
    TabBarComponent,
    SkeletonListComponent,
    MatterDetailCardComponent,
    CardComponent,
    HeaderWithIconComponent,
    BillableTimeCardComponent,
    CheckboxListCardComponent,
    MobileFileDropComponent,
    DuplicateFileModalComponent,
    EditFolderModalComponent,
    LogTimeModalMobileComponent,
    UploadFileModalComponent,
    ClientInfoFormComponent,
    EditableProfileImageComponent,
    MobileAttorneyProfileFormComponent,
    CreateIndividualAccountComponent,
    CreateOrganizationAccountComponent,
    MobileChangePasswordModalComponent,
    VerificatedAttorneyBadgeComponent,
    EventCardComponent,
    PointsOnMapModalComponent,
    PostDetailsComponent,
    PostListItemComponent,
    SelectableUserItemComponent,
    EditDocumentModalComponent,
    InvoiceItemComponent,
    InvoicesListComponent,
    ExportStatisticsModalComponent,
    InvoiceDetailsCardComponent,
    ExpandableCardComponent,
    SideMenuComponent,
    MobileAccountInfoComponent,
    TimeLogsListComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forChild(),
    AgmCoreModule,
  ],
  exports: [
    ClientInfoFormComponent,
    TabButtonComponent,
    TabBarComponent,
    SkeletonListComponent,
    MatterDetailCardComponent,
    CardComponent,
    HeaderWithIconComponent,
    BillableTimeCardComponent,
    CheckboxListCardComponent,
    MobileFileDropComponent,
    DuplicateFileModalComponent,
    EditFolderModalComponent,
    LogTimeModalMobileComponent,
    UploadFileModalComponent,
    MobileAttorneyProfileFormComponent,
    CreateIndividualAccountComponent,
    CreateOrganizationAccountComponent,
    VerificatedAttorneyBadgeComponent,
    EventCardComponent,
    PointsOnMapModalComponent,
    PostDetailsComponent,
    PostListItemComponent,
    SelectableUserItemComponent,
    EditDocumentModalComponent,
    InvoicesListComponent,
    ExportStatisticsModalComponent,
    InvoiceDetailsCardComponent,
    ExpandableCardComponent,
    EditableProfileImageComponent,
    SideMenuComponent,
    MobileAccountInfoComponent,
    TimeLogsListComponent,
  ],
  entryComponents: [
    DuplicateFileModalComponent,
    EditFolderModalComponent,
    LogTimeModalMobileComponent,
    UploadFileModalComponent,
    MobileChangePasswordModalComponent,
    PointsOnMapModalComponent,
    EditDocumentModalComponent,
    ExportStatisticsModalComponent,
  ],
})
export class CommonMobileModule {

}

import { AgmCoreModule } from '@agm/core';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatMenuModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CreateTopicComponent } from '@jl/common/shared/components/create-topic/create-topic.component';
import { JusLawDatePipe } from '@jl/common/shared/pipes/jus-law-date.pipe';
import { JusLawShortNamePipe } from '@jl/common/shared/pipes/jus-law-short-name.pipe';
import { environment } from '@jl/env/environment';
import { NgxMaskModule } from 'ngx-mask';
import { NgxPermissionsModule } from 'ngx-permissions';
import { QuillModule } from 'ngx-quill';

import { AccountInfoComponent } from './components/account-info/account-info.component';
import { AttorneyProfileFormComponent } from './components/attorney-profile-form/attorney-profile-form.component';
import { BadgeComponent } from './components/badge/badge.component';
import { ChangePasswordDialogComponent } from './components/change-password-dialog/change-password-dialog.component';
import { ChangePasswordFormComponent } from './components/change-password-form/change-password-form.component';
import { ChatListItemComponent } from './components/chat-list-item/chat-list-item.component';
import { ChatMessageFormComponent } from './components/chat/chat-message-form/chat-message-form.component';
import { ChatAnnounceMessageComponent } from './components/chat/chat-message/chat-announce-message/chat-announce-message.component';
import { ChatAttachmentComponent } from './components/chat/chat-message/chat-attachment/chat-attachment.component';
import { ChatMessageComponent } from './components/chat/chat-message/chat-message.component';
import { ChatTextMessageComponent } from './components/chat/chat-message/chat-text-message/chat-text-message.component';
import {
  ChatUnsupportedMessageComponent,
} from './components/chat/chat-message/chat-unsupported-message/chat-unsupported-message.component';
import { ChatComponent } from './components/chat/chat.component';
import { ClientAdditionalInfoComponent } from './components/client-additional-info/client-additional-info.component';
import { CopyDocumentDialogComponent } from './components/copy-document-dialog/copy-document-dialog.component';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';
import { DisplayHTMLComponent } from './components/display-html/display-html.component';
import { DocumentsTreeComponent } from './components/documents-tree/documents-tree.component';
import { EditFolderDialogComponent } from './components/edit-folder-dialog/edit-folder-dialog.component';
import { EditInvoiceDialogComponent } from './components/edit-invoice-dialog/edit-invoice-dialog.component';
import { EmailListInputComponent } from './components/email-list-input/email-list-input.component';
import { EventInfoComponent } from './components/event-info/event-info.component';
import { FileDropComponent } from './components/file-drop/file-drop.component';
import {
  FormControlValidationMessageComponent,
} from './components/form-control-validation-message/form-control-validation-message.component';
import { HeaderMenuComponent } from './components/header-menu/header-menu.component';
import { HeaderComponent } from './components/header/header.component';
import { HtmlEditorComponent } from './components/html-editor/html-editor.component';
import { ImageUploaderComponent } from './components/image-uploader/image-uploader.component';
import { LoadingComponent } from './components/loading/loading.component';
import { LoginPageContainerComponent } from './components/login-page-container/login-page-container.component';
import { LogoComponent } from './components/logo/logo.component';
import { LogoutComponent } from './components/logout/logout.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NotificationsSettingsComponent } from './components/notifications-settings/notifications-settings.component';
import { PaymentMethodFormComponent } from './components/payment-method-form/payment-method-form.component';
import { PaymentNotAvailableComponent } from './components/payment-not-available/payment-not-available.component';
import { PdfEditorComponent } from './components/pdf-editor/pdf-editor.component';
import { ProfileImageEditComponent } from './components/profile-image-edit/profile-image-edit.component';
import { ProfileImageComponent } from './components/profile-image/profile-image.component';
import { RecordVoiceDialogComponent } from './components/record-voice-dialog/record-voice-dialog.component';
import { RegistrationActionAnnounceComponent } from './components/registration-action-announce/registration-action-announce.component';
import { SelectPaymentPlanFormComponent } from './components/select-payment-plan-form/select-payment-plan-form.component';
import { StaffPaymentPlanInfoComponent } from './components/staff-payment-plan-info/staff-payment-plan-info.component';
import { SubheaderComponent } from './components/subheader/subheader.component';
import { TimeLogInputComponent } from './components/time-log-input/time-log-input.component';
import { UploadDocumentDialogComponent } from './components/upload-document-dialog/upload-document-dialog.component';
import { UploadEditedDocumentDialogComponent } from './components/upload-edited-file-dialog/upload-edited-file-dialog.component';
import { ValidationMessageComponent } from './components/validation-message/validation-message.component';
import { ApiValidationDirective } from './directives/api-validation.directive';
import { DownloadDirective } from './directives/download.directive';
import { InputStatusDirective } from './directives/input-status.directive';
import { InputTimeDirective } from './directives/input-time.directive';
import { LocationAutocompleteDirective } from './directives/location-autocomplete.directive';
import { NoPropagationDirective } from './directives/no-propagation.directive';
import { DialogsModule } from './modules/dialogs/dialogs.module';
import { LogTimeDialogComponent } from './modules/dialogs/log-time-dialog/log-time-dialog.component';
import { DropdownModule } from './modules/dropdown/dropdown.module';
import { PrivacyPolicePageComponent } from './pages/privacy-police-page/privacy-police-page.component';
import { TermsOfUsePageComponent } from './pages/terms-of-use-page/terms-of-use-page.component';
import { JusLawFormatMinutesPipe } from './pipes/jus-law-format-minutes.pipe';
import { JusLawNamedOffsetFromNowPipe } from './pipes/jus-law-named-offset-from-now.pipe';
import { JuslawFormatSecondsPipe } from './pipes/juslaw-format-seconds.pipe';
import { JusLawSafePipe } from './pipes/safe';

/**
 * Configuration for quill toolbar.
 *
 * For more information check this:
 * @see {@link https://quilljs.com/docs/modules/toolbar/#container|QuillJs}
 * @see {@link https://github.com/KillerCodeMonkey/ngx-quill#quilleditorcomponent|Angular lib Github}
 */
const quillToolbarConfig = [
  ['bold', 'italic', 'underline', 'strike'], // Text style.
  ['blockquote'], // Quote / code block.
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Headers
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'script': 'sub' }, { 'script': 'super' }], // Superscript / subscript
  [{ 'indent': '-1' }, { 'indent': '+1' }], // Outdent / indent
  [{ 'size': ['small', 'normal', 'large', 'huge'] }],  // Size dropdown
  [{ 'color': [] }, { 'background': [] }], // Default font and background colors.
  [{ 'align': [] }], // Default align config
  ['link', 'image'], // Link and image.
];

/**
 * Shared module of the application.
 * Contains shareable components.
 */
@NgModule({
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    IonicModule,
    DialogsModule,
    NgxMaskModule.forChild(),
    CdkTreeModule,
    NgxPermissionsModule.forChild(),
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AgmCoreModule.forRoot(environment.googleMap),
    RouterModule,
    QuillModule.forRoot({
      modules: {
        toolbar: quillToolbarConfig,
      },
      // If you want to use another theme you have to include styles for it in angular.json
      theme: 'snow',
    }),
  ],
  declarations: [
    LoadingComponent,
    FormControlValidationMessageComponent,
    JusLawDatePipe,
    JusLawFormatMinutesPipe,
    JusLawShortNamePipe,
    ApiValidationDirective,
    ValidationMessageComponent,
    InputStatusDirective,
    ChatMessageFormComponent,
    PaymentMethodFormComponent,
    NotificationsSettingsComponent,
    LogoutComponent,
    ProfileImageEditComponent,
    AccountInfoComponent,
    ChangePasswordDialogComponent,
    ChangePasswordFormComponent,
    AttorneyProfileFormComponent,
    ChatMessageComponent,
    ChatTextMessageComponent,
    ChatComponent,
    JusLawNamedOffsetFromNowPipe,
    EventInfoComponent,
    DocumentsTreeComponent,
    UploadDocumentDialogComponent,
    EditFolderDialogComponent,
    LogTimeDialogComponent,
    InputTimeDirective,
    LocationAutocompleteDirective,
    DownloadDirective,
    ChatAttachmentComponent,
    ChatUnsupportedMessageComponent,
    CreateTopicComponent,
    PrivacyPolicePageComponent,
    TermsOfUsePageComponent,
    LogoComponent,
    LoginPageContainerComponent,
    FileDropComponent,
    SubheaderComponent,
    HeaderComponent,
    HeaderMenuComponent,
    ClientAdditionalInfoComponent,
    SelectPaymentPlanFormComponent,
    RegistrationActionAnnounceComponent,
    DisplayHTMLComponent,
    JusLawSafePipe,
    JuslawFormatSecondsPipe,
    NoPropagationDirective,
    RecordVoiceDialogComponent,
    HtmlEditorComponent,
    ImageUploaderComponent,
    ChatListItemComponent,
    PdfEditorComponent,
    UploadEditedDocumentDialogComponent,
    CopyDocumentDialogComponent,
    DateTimePickerComponent,
    EditInvoiceDialogComponent,
    ChatAnnounceMessageComponent,
    EmailListInputComponent,
    PaymentNotAvailableComponent,
    BadgeComponent,
    TimeLogInputComponent,
    ProfileImageComponent,
    StaffPaymentPlanInfoComponent,
    NotFoundComponent,
  ],
  exports: [
    LoadingComponent,
    FormControlValidationMessageComponent,
    InputTimeDirective,
    JusLawDatePipe,
    JusLawFormatMinutesPipe,
    JusLawShortNamePipe,
    ApiValidationDirective,
    InputStatusDirective,
    ChatComponent,
    ChatMessageFormComponent,
    PaymentMethodFormComponent,
    DropdownModule,
    NotificationsSettingsComponent,
    ProfileImageEditComponent,
    AccountInfoComponent,
    ChangePasswordFormComponent,
    DialogsModule,
    AttorneyProfileFormComponent,
    JusLawNamedOffsetFromNowPipe,
    EventInfoComponent,
    DocumentsTreeComponent,
    UploadDocumentDialogComponent,
    EditFolderDialogComponent,
    LocationAutocompleteDirective,
    DownloadDirective,
    CreateTopicComponent,
    LogoComponent,
    LoginPageContainerComponent,
    FileDropComponent,
    LogTimeDialogComponent,
    SubheaderComponent,
    HeaderComponent,
    ClientAdditionalInfoComponent,
    SelectPaymentPlanFormComponent,
    RegistrationActionAnnounceComponent,
    DisplayHTMLComponent,
    JusLawSafePipe,
    JuslawFormatSecondsPipe,
    NoPropagationDirective,
    HtmlEditorComponent,
    ImageUploaderComponent,
    ChatListItemComponent,
    PdfEditorComponent,
    UploadEditedDocumentDialogComponent,
    CopyDocumentDialogComponent,
    DateTimePickerComponent,
    EditInvoiceDialogComponent,
    EmailListInputComponent,
    PaymentNotAvailableComponent,
    BadgeComponent,
    TimeLogInputComponent,
    NotFoundComponent,
    ProfileImageComponent,
    StaffPaymentPlanInfoComponent,
  ],
  entryComponents: [
    ChangePasswordDialogComponent,
    UploadDocumentDialogComponent,
    EditFolderDialogComponent,
    LogTimeDialogComponent,
    RecordVoiceDialogComponent,
    UploadEditedDocumentDialogComponent,
    CopyDocumentDialogComponent,
    EditInvoiceDialogComponent,
  ],
})
export class CommonSharedModule { }

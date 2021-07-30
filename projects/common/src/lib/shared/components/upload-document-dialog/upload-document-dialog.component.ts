import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, Validators, } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { JusLawFile } from '@jl/common/core/models/juslaw-file';
import { Role } from '@jl/common/core/models/role';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { ESignService } from '@jl/common/core/services/esign.service';
import { ExternalResourcesService } from '@jl/common/core/services/external-resources.service';
import { JuslawFiles } from '@jl/common/core/utils/juslaw-files';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { first, catchError, switchMap, take, } from 'rxjs/operators';

import { AbstractDialog } from '../../modules/dialogs/abstract-dialog';
import { DialogsService } from '../../modules/dialogs/dialogs.service';

/** Options for the dialog. */
export interface UploadDocumentDialogOptions {
  /** Matter id in case file is uploaded to matter. */
  matterId?: number;
  /** Define is a matter shared. */
  isMatterShared?: boolean;
  /** Folders options. */
  folders: JuslawDocument[];
}

/** Result options. */
export enum UploadDocumentDialogResult {
  /** File is uploaded. */
  Success,
  /** Cancel. */
  None = undefined,
}

/** Dialog for uploading files. */
@Component({
  selector: 'jlc-upload-document-dialog',
  templateUrl: './upload-document-dialog.component.html',
  styleUrls: ['./upload-document-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDocumentDialogComponent extends AbstractDialog<UploadDocumentDialogOptions, UploadDocumentDialogResult>
  implements OnInit {
  /** User role. */
  public readonly Role = Role;
  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Validation error. */
  public readonly validationError$ = new BehaviorSubject<string>(null);
  /** Options for folder select. */
  public get folders(): JuslawDocument[] {
    return this.options.folders || [];
  }
  /** File creating form. */
  public readonly formGroup = this.fb.group({
    folder: [null, [Validators.required]],
  });
  /** Matter id from the dialog options. */
  public get matterId(): number {
    return this.options.matterId || null;
  }
  /** Is application mode. */
  public readonly isApplication = this.platform.is('cordova');
  /** Validators for drag&drop component. */
  public readonly fileValidators = [
    JuslawFiles.validateForRestrictedTypes,
    JuslawFiles.validateForSizeLimitation,
  ];
  /** TrackBy function. */
  public readonly trackById = trackById;

  /** Uploaded file */
  public file: File | null = null;

  /**
   * @constructor
   *
   * @param documentsService Docs service.
   * @param fb Form builder.
   * @param platform Platform.
   * @param dialogService Dialog service.
   * @param esignService Esign service.
   * @param externalResourcesService External resources service.
   */
  public constructor(
    private documentsService: DocumentsService,
    private fb: FormBuilder,
    private platform: Platform,
    private esignService: ESignService,
    private dialogService: DialogsService,
    private externalResourcesService: ExternalResourcesService,
  ) {
    super();
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    // Set first folder selected by default.
    if (this.folders[0]) {
      this.formGroup.controls.folder.setValue(this.folders[0].id);
    } else {
      console.warn('No folders for uploading a file.');
    }
  }

  /**
   * Check if "Send with Docusign" option is available.
   */
  public get isDocusignAvailable(): boolean {
    return this.matterId && !this.options.isMatterShared;
  }

  /** Save the documents. */
  public onSubmit(): void {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid || this.isLoading$.value) {
      return;
    }
    this.isLoading$.next(true);

    this.documentsService.uploadDocuments(
      [this.file],
      this.matterId,
      this.formGroup.controls.folder.value,
    ).pipe(
      take(1),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchError((error: Error) => {
        this.validationError$.next(error.message);
        return EMPTY;
      }),
    ).subscribe(() => {
      this.close(UploadDocumentDialogResult.Success);
    });
  }

  /** Close the dialog. */
  public onCancelClick(): void {
    this.close();
  }

  /** Send selected document to docusign. */
  public onDocusignButtonClick(): void {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.valid) {
      this.isLoading$.next(true);
      this.esignService.sendMatterDocsToESign([this.file], this.matterId).pipe(
        first(),
        switchMap(({ editLink }) => {
          this.isLoading$.next(false);

          this.close(UploadDocumentDialogResult.Success);

          return this.finishDocusign(editLink);
        }),
        catchError((error: string) => {
          this.validationError$.next(error);
          this.isLoading$.next(false);
          return EMPTY;
        }),
      ).subscribe();
    }
  }

  /**
   * Finish docusign.
   *
   * @param editLink Link to edit doc.
   */
  public async finishDocusign(editLink: string): Promise<void> {
    const shouldRedirect = await this.dialogService.showConfirmationDialog({
      cancelButtonText: 'Later',
      confirmationButtonClass: 'primary',
      confirmationButtonText: 'OK',
      message: 'You will be redirected to DocuSign profile to complete the process.',
      title: 'Success',
    });

    if (shouldRedirect) {
      this.externalResourcesService.openExternalLink(editLink);
    }
  }

  /**
   * Set attached file.
   *
   * @param docs Attached documents.
   */
  public onAttachedFileChange(docs: JusLawFile<File>[]): void {
    if (docs && docs.length) {
      this.file = docs[0].file;
    } else {
      this.file = null;
    }
  }

  /**
   * Present errors to a user.
   *
   * @param errors Errors.
   */
  public onErrors(errors: string[]): void {
    this.dialogService.showInformationDialog({
      title: 'Couldn\'t upload a file',
      message: errors.join('\n'),
    });
  }
}

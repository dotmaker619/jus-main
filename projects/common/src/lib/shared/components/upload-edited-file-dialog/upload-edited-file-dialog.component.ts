import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, } from '@angular/forms';
import { JlpFile } from '@jl/common/core/models/jlp-file';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { getNameWithoutType, extractFileExtension } from '@jl/common/core/utils/files';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

import { AbstractDialog } from '../../modules/dialogs/abstract-dialog';
import { DialogsService } from '../../modules/dialogs/dialogs.service';

/** Options for the dialog. */
export interface UploadDocumentDialogOptions {
  /** Matter id. */
  matterId?: number;

  /** Folders options. */
  folders: JuslawDocument[];

  /** File in blob format after edit existing file. */
  file: JlpFile;
}

/** Dialog for uploading files. */
@Component({
  selector: 'jlc-upload-edited-file-dialog',
  templateUrl: './upload-edited-file-dialog.component.html',
  styleUrls: ['./upload-edited-file-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadEditedDocumentDialogComponent extends AbstractDialog<UploadDocumentDialogOptions, boolean> {
  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Validation error. */
  public readonly validationError$ = new BehaviorSubject<string>(null);
  /** File creating form. */
  public readonly formGroup = this.fb.group({
    name: ['', [Validators.required]],
    folder: [null, [Validators.required]],
  });
  /** Options for folder select. */
  public get folders(): JuslawDocument[] {
    return this.options.folders || [];
  }
  /** Matter id from the dialog options. */
  public get matterId(): number {
    return this.options.matterId || null;
  }
  /** Passed blob. */
  public get editedFile(): JlpFile {
    return this.options.file;
  }

  /**
   * @constructor
   *
   * @param documentsService Docs service.
   * @param fb Form builder.
   * @param dialogService Dialog service.
   */
  public constructor(
    private documentsService: DocumentsService,
    private fb: FormBuilder,
    private dialogService: DialogsService,
  ) {
    super();
  }

  /** @inheritdoc */
  public afterPropsInit(): void {
    // Set first folder selected by default.
    this.formGroup.controls.name.setValue(
      getNameWithoutType(this.editedFile),
    );
    if (this.folders[0]) {
      this.formGroup.controls.folder.setValue(this.folders[0].id);
    } else {
      console.warn('No folders for uploading a file.');
    }
  }

  /** Save the documents. */
  public onSubmit(): void {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }
    this.isLoading$.next(true);
    this.editedFile.name = `${this.formGroup.controls.name.value}.${extractFileExtension(this.editedFile)}`;

    this.documentsService.uploadDocuments(
      [this.editedFile],
      this.matterId,
      this.formGroup.controls.folder.value,
    ).pipe(
      take(1),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchError((error: Error) => {
        this.validationError$.next(error.message);
        return EMPTY;
      }),
    ).subscribe(() => this.close(true));
  }

  /** Close the dialog. */
  public onCancelClick(): void {
    this.close(false);
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

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { Role } from '@jl/common/core/models/role';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

import { DialogsService } from '../..';
import { AbstractDialog } from '../../modules/dialogs/abstract-dialog';

/** Options for the dialog. */
interface CopyDocumentDialogOptions {
  /** File to copy. */
  document: JuslawDocument;
  /** Folders options. */
  folders: JuslawDocument[];
}

/**
 * Modal to copy documents.
 */
@Component({
  selector: 'jlc-copy-document-dialog',
  templateUrl: './copy-document-dialog.component.html',
  styleUrls: ['./copy-document-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyDocumentDialogComponent extends AbstractDialog<CopyDocumentDialogOptions> {
  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);
  /** Validation error. */
  public validationError$ = new BehaviorSubject<string>(null);
  /** File creating form. */
  public formGroup: FormGroup;
  /** Options for folder select. */
  public get folders(): JuslawDocument[] {
    return this.options.folders || [];
  }
  /** Document. */
  public get document(): JuslawDocument {
    return this.options.document;
  }
  /** Is submit button disabled. */
  public get isSubmitDisabled(): boolean {
    return this.document && this.document.parent === this.formGroup.controls.folder.value;
  }

  /**
   * @constructor
   *
   * @param documentsService Docs service.
   * @param fb Form builder.
   * @param dialogService Dialog service.
   */
  public constructor(
    fb: FormBuilder,
    private readonly documentsService: DocumentsService,
    private readonly dialogService: DialogsService,
  ) {
    super();
    this.formGroup = fb.group({
      folder: [null, [Validators.required]],
    });
  }

  /** @inheritdoc */
  public afterPropsInit(): void {
    // Set first folder selected by default.
    if (this.folders[0]) {
      this.formGroup.controls.folder.setValue(this.folders[0].id);
    } else {
      console.warn('No folders for uploading a file.');
    }
  }

  /** Save the documents. */
  public onSubmit(): void {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || this.isLoading$.value) {
      return;
    }
    this.isLoading$.next(true);

    this.documentsService.duplicateDocument(this.document, this.formGroup.controls.folder.value).pipe(
      take(1),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchError((error: Error) => {
        this.validationError$.next(error.message);
        return EMPTY;
      }),
    ).subscribe(() => this.close());
  }

  /** Close the dialog. */
  public onCancelClick(): void {
    this.close();
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

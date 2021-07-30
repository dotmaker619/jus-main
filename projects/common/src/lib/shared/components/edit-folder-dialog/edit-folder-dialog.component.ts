import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiValidationError, TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { Matter } from '@jl/common/core/models/matter';
import { catchValidationError } from '@jl/common/core/rxjs';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { finalize, first, tap } from 'rxjs/operators';

import { AbstractDialog } from '../../modules/dialogs/abstract-dialog';

/** Create matter dialog result. */
export enum EditFolderDialogResult {
  /** Folder created or edited. */
  Success = 1,
  /** Cancel. */
  None = undefined,
}

/** Create matter dialog options. */
export interface EditFolderDialogOptions {
  /** Matter id. */
  matterId?: number;
  /** Parent folder id. */
  parentId?: number;
  /** Document. */
  document?: JuslawDocument;
}

/** Create folder dialog. */
@Component({
  selector: 'jlc-edit-folder-dialog',
  templateUrl: './edit-folder-dialog.component.html',
  styleUrls: ['./edit-folder-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFolderDialogComponent extends AbstractDialog<EditFolderDialogOptions, EditFolderDialogResult> implements OnInit {

  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Validation error. */
  public validationError$ = new BehaviorSubject<TEntityValidationErrors<JuslawDocument>>(null);

  /** Folder creation form group. */
  public formGroup = this.fb.group({
    title: [null, [Validators.required]],
  });

  /**
   * @constructor
   *
   * @param documentsService Docs service.
   * @param fb Form builder.
   */
  public constructor(
    private documentsService: DocumentsService,
    public fb: FormBuilder,
  ) {
    super();
  }

  /** Get matter id from the options. */
  public get matterId(): number {
    return this.options && this.options.matterId || null;
  }

  /** Get parent id from the options. */
  public get parentId(): number {
    return this.options && this.options.parentId;
  }

  /** Get document from the options. */
  public get doc(): JuslawDocument {
    return this.options && this.options.document;
  }

  /** Get dialog title. */
  public get dialogTitle(): string {
    return this.doc ? `Rename Folder ${this.doc.title}` : 'Create a Folder';
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    this.formGroup.controls.title.setValue(this.doc && this.doc.title);
  }

  /** Save a folder and close the dialog. */
  public onSaveClick(): void {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.isLoading$.next(true);

      let request: Observable<void>;

      if (this.doc) {
        request = this.documentsService.renameDocument(this.doc, this.formGroup.controls.title.value).pipe(
          tap(() => this.close(EditFolderDialogResult.Success)),
        );
      } else {
        request = this.documentsService.createFolder({
          title: this.formGroup.controls.title.value,
          matter: { id: this.matterId } as Matter,
          parent: this.parentId,
        } as JuslawDocument).pipe(
          tap(() => this.close(EditFolderDialogResult.Success)),
        );
      }

      request.pipe(
        first(),
        finalize(() => this.isLoading$.next(false)),
        catchValidationError((error: ApiValidationError<JuslawDocument>) => {
          this.validationError$.next(error.validationData);
          return EMPTY;
        }),
      ).subscribe();

    }
  }

  /** Close the dialog. */
  public onCancelClick(): void {
    this.close();
  }

}

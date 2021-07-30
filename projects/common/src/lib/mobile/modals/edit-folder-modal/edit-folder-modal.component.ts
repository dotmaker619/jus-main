import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Matter } from '@jl/common/core/models';
import { TEntityValidationErrors, ApiValidationError } from '@jl/common/core/models/api-error';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { catchValidationError } from '@jl/common/core/rxjs';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, of, BehaviorSubject, EMPTY } from 'rxjs';
import { first, switchMap, tap } from 'rxjs/operators';

const CREATE_FOLDER_TITLE = 'Create a Folder';
const EDIT_FOLDER_TITLE = 'Rename Folder';

/** Modal for creating a folder. Used in mobile workspace. */
@Component({
  selector: 'jlc-edit-folder-modal',
  templateUrl: './edit-folder-modal.component.html',
  styleUrls: ['./edit-folder-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFolderModalComponent {
  /** Matter id. */
  @Input()
  public matter: Matter;

  /** Parent id. */
  @Input()
  public parentId: number;

  /** Document. If presented - editing mode.*/
  @Input()
  public folder?: JuslawDocument;

  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Form for creating a folder. */
  public form$: Observable<FormGroup>;

  /** Validation error. */
  public validationError$ = new BehaviorSubject<TEntityValidationErrors<JuslawDocument>>(null);

  /**
   * @constructor
   *
   * @param formBuilder Form builder.
   * @param documentsService Documents service.
   * @param modalController Modal controller.
   * @param alertService Alert service.
   */
  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly documentsService: DocumentsService,
    private readonly modalController: ModalController,
    private readonly alertService: AlertService,
  ) {
    this.form$ = this.initFormStream();
  }

  /** Modal title. */
  public get modalTitle(): string {
    return this.folder == null ? CREATE_FOLDER_TITLE : EDIT_FOLDER_TITLE;
  }

  /** Init form stream. */
  public initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      title: [null, Validators.required],
    });

    return of(form).pipe(
      tap(() => {
        if (this.folder) {
          form.controls.title.setValue(this.folder.title);
        }
      }),
    );
  }

  /** On submit. */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    this.isLoading$.next(true);

    const savingAction$ = this.folder ? this.editFolder(form) : this.createFolder(form);

    savingAction$.pipe(
      catchValidationError((error: ApiValidationError<JuslawDocument>) => {
        this.validationError$.next(error.validationData);
        return EMPTY;
      }),
    ).subscribe();
  }

  private editFolder(form: FormGroup): Observable<void> {
    return this.documentsService.renameDocument(
      this.folder,
      form.controls.title.value,
    ).pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Folder Renamed',
      })),
      tap(() => this.modalController.dismiss()),
    );
  }

  private createFolder(form: FormGroup): Observable<void> {
    return this.documentsService.createFolder(new JuslawDocument({
      title: form.controls.title.value,
      matter: this.matter || null,
      parent: this.parentId,
    })).pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Folder Created',
      })),
      tap(() => this.modalController.dismiss()),
    );
  }

  /** Close the modal on cancel click. */
  public onCancelClick(): void {
    this.modalController.dismiss();
  }
}

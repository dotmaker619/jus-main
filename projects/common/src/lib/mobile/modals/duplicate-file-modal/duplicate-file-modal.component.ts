import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, ReplaySubject, of, merge, BehaviorSubject } from 'rxjs';
import { switchMap, tap, mapTo, catchError } from 'rxjs/operators';

const SUCCESS_MESSAGE = 'Document Duplicated';

/** Modal for to duplicate a file into another folder. Used in mobile workspace. */
@Component({
  selector: 'jlc-duplicate-file-modal',
  templateUrl: './duplicate-file-modal.component.html',
  styleUrls: ['./duplicate-file-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuplicateFileModalComponent implements OnInit {

  /**
   * @constructor
   * @param documentsService Documents service.
   * @param modalController Modal controller.
   * @param formBuilder Form builder.
   * @param alertService Alert service.
   */
  public constructor(
    private readonly documentsService: DocumentsService,
    private readonly modalController: ModalController,
    private readonly formBuilder: FormBuilder,
    private readonly alertService: AlertService,
  ) {
    this.form$ = this.initFormStream();
    this.folders$ = this.initFoldersStream();
  }

  /** Document to duplicate. */
  @Input()
  public document: JuslawDocument;

  /** Matter id. */
  @Input()
  public matterId: number;

  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Main form. */
  public form$: Observable<FormGroup>;

  /** Folders. */
  public folders$: Observable<JuslawDocument[]>;

  private init$ = new ReplaySubject<void>(1);

  /** Trackby function. */
  public trackById = trackById;

  /** @inheritdoc */
  public ngOnInit(): void {
    this.init$.next();
  }

  /** Submit form. */
  public onSubmit(form: FormGroup): void {
    if (form.invalid || form.untouched) {
      return;
    }

    const parent = form.controls.parent.value;
    const doc = new JuslawDocument({
      ...this.document,
      title: form.controls.title.value,
    });

    this.isLoading$.next(true);
    this.documentsService.duplicateDocument(
      doc,
      parent,
    ).pipe(
      switchMap(() => this.alertService.showNotificationAlert({
        header: SUCCESS_MESSAGE,
      })),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      tap(() => this.close()),
      catchError((error: string) => this.alertService.showNotificationAlert({
        header: error,
      })),
    ).subscribe();
  }

  /**
   * On cancel button clicked.
   */
  public onCancelClick(): void {
    this.close();
  }

  /**
   * Close the dialog.
   */
  public close(): void {
    this.modalController.dismiss();
  }

  private initFoldersStream(): Observable<JuslawDocument[]> {
    return this.init$.pipe(
      switchMap(() => this.documentsService.getFolders(this.matterId)),
    );
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      parent: [null, Validators.required],
      title: [{ value: null, disabled: true }, Validators.required],
    });

    const mutateForm$ = this.init$.pipe(
      tap(() => form.setValue({
        parent: this.document.parent,
        title: this.document.title,
      })),
      mapTo(form),
    );

    return merge(of(form), mutateForm$);
  }
}

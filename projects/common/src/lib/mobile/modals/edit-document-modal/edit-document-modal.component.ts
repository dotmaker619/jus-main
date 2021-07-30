import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ChangeDetectionStrategy, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, IonContent } from '@ionic/angular';
import { DestroyableBase } from '@jl/common/core';
import { JlpFile } from '@jl/common/core/models/jlp-file';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { ReplaySubject, Observable, merge, of, NEVER, EMPTY, BehaviorSubject } from 'rxjs';
import { tap, switchMapTo, first, catchError, map } from 'rxjs/operators';

/** Available page modes */
enum EditPageMode {
  /** File was edited, users can choose a folder, change name and save file */
  Show,
  /** File is being edited, form to save is hidden. */
  Edit,
}

/**
 * Edit document modal.
 */
@Component({
  selector: 'jlc-edit-document-modal',
  templateUrl: './edit-document-modal.component.html',
  styleUrls: ['./edit-document-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('hideOpen', [
      state('open', style({
        'max-height': '300px',
        padding: '16px',
        overflow: 'visible',
      })),
      state('hide', style({
        'max-height': '0',
        padding: '0 16px',
        overflow: 'hidden',
      })),
      transition('open => hide', [
        animate('0.5s'),
      ]),
      transition('hide => open', [
        animate('0.75s'),
      ]),
    ]),
  ],
})
export class EditDocumentModalComponent extends DestroyableBase implements OnInit {
  /** Juslaw document. */
  @Input()
  public document: JuslawDocument;
  /** Folders to select. */
  @Input()
  public folders: JuslawDocument[];
  /** Ref on ion-content. */
  @ViewChild('content', { static: true })
  public content: IonContent;
  /** Save form. */
  public readonly form$: Observable<FormGroup>;
  /** Folders. */
  public readonly folders$: Observable<JuslawDocument[]>;
  /** Validation error. */
  public readonly validationError$ = new BehaviorSubject<string>(null);
  /** Control the current page mode */
  public readonly pageMode$ = new BehaviorSubject(EditPageMode.Edit);
  /** TrackBy function. */
  public readonly trackById = trackById;
  /** Loading controller. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Page modes enum. */
  public readonly pageModes = EditPageMode;

  private editedFile: JlpFile;
  private readonly init$ = new ReplaySubject<void>(1);

  /**
   * @constructor
   *
   * @param fb Form builder.
   * @param modalCtrl Modal controller.
   * @param documentsService Documents service.
   */
  public constructor(
    fb: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly documentsService: DocumentsService,
  ) {
    super();
    this.form$ = this.initFormStream(fb);
    this.folders$ = this.initFoldersStream();
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    this.init$.next();
  }

  /**
   * Handle 'save' of the 'pdf-editor' component.
   * @param file File in blob format
   */
  public onFileSave(file: JlpFile): void {
    this.editedFile = file;
    this.pageMode$.next(EditPageMode.Show);
  }

  /**
   * Handle 'click' of cancel button.
   */
  public onCancelClick(): void {
    this.close();
  }

  /**
   * Handle 'click' of the 'Edit' button.
   */
  public onEditClick(): void {
    this.pageMode$.next(EditPageMode.Edit);
  }

  /**
   * Handle 'submit' of the save form.
   */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();

    if (form.invalid || this.isLoading$.value) {
      return;
    }
    const formValue = form.value;
    this.editedFile.name = `${formValue.title}.${this.document.getFileExtension()}`;

    const matterId = this.document.matter && this.document.matter.id;
    this.isLoading$.next(true);
    this.documentsService.uploadDocuments([this.editedFile], matterId, form.controls.folder.value).pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchError((error: Error) => {
        this.validationError$.next(error.message);
        return EMPTY;
      }),
    ).subscribe(() => this.close());
  }

  private close(): void {
    this.modalCtrl.dismiss();
  }

  private initFoldersStream(): Observable<JuslawDocument[]> {
    return this.init$.pipe(map(() => this.folders));
  }

  private initFormStream(fb: FormBuilder): Observable<FormGroup> {
    const form = fb.group({
      folder: [null, Validators.required],
      title: [null, Validators.required],
    });

    const mutateForm$ = this.init$.pipe(
      tap(() => form.patchValue({
        folder: this.document.parent,
        title: this.document.trimFileExtension(),
      })),
      switchMapTo(NEVER),
    );

    return merge(of(form), mutateForm$);
  }
}

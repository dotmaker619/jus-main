import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Matter } from '@jl/common/core/models';
import { ApiValidationError } from '@jl/common/core/models/api-error';
import { Note } from '@jl/common/core/models/note';
import { catchValidationError } from '@jl/common/core/rxjs';
import { NotesService } from '@jl/common/core/services/attorney/notes.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, BehaviorSubject, EMPTY, Subject, ReplaySubject, merge, of, NEVER } from 'rxjs';
import { switchMap, first, tap, switchMapTo } from 'rxjs/operators';

/** Create note for a matter modal. Used in mobile workspace. */
@Component({
  selector: 'jlc-edit-note-modal',
  templateUrl: './edit-note-modal.component.html',
  styleUrls: ['./edit-note-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditNoteModalComponent implements OnInit {

  /** Matter. */
  @Input()
  public matter?: Matter;

  /** Note. */
  @Input()
  public note?: Note;

  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Validation errors. */
  public validationError$ = new Subject<ApiValidationError<Note>>();

  /** Note form. */
  public form$: Observable<FormGroup>;

  private init$ = new ReplaySubject(1);

  /**
   * @constructor
   * @param modalController Modal controller.
   * @param alertService Alert service.
   * @param formBuilder Form builder.
   * @param notesService Notes service.
   */
  public constructor(
    private readonly modalController: ModalController,
    private readonly alertService: AlertService,
    private readonly formBuilder: FormBuilder,
    private readonly notesService: NotesService,
  ) {
    this.form$ = this.initFormStream();
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      title: [null, Validators.required],
      text: [null, Validators.required],
    });
    const fillForm$ = this.init$.pipe(
      tap(() => this.fillFormWithValues(form)),
      switchMapTo(NEVER),
    );
    return merge(of(form), fillForm$);
  }

  /**
   * Fill form with values.
   * @param form Form to fill.
   */
  private fillFormWithValues(form: FormGroup): void {
    if (this.note == null) {
      return;
    }

    form.setValue({
      title: this.note.title,
      text: this.note.text,
    });
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    return this.init$.next();
  }

  /** Note title. */
  public get modalTitle(): string {
    return this.note ? 'Edit Note' : 'New Note';
  }

  /** On form submit. */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid) {
      return;
    }

    this.isLoading$.next(true);
    const savingAction$ = this.note ? this.editNote(form) : this.createNote(form);
    savingAction$.pipe(
      catchValidationError((error: ApiValidationError<Note>) => {
        this.validationError$.next(error);
        this.isLoading$.next(false);
        return EMPTY;
      }),
    ).subscribe(() => this.close(true));
  }

  private createNote(form: FormGroup): Observable<void> {
    return this.notesService.saveNote(new Note({
      matter: this.matter,
      text: form.controls.text.value,
      title: form.controls.title.value,
    })).pipe(
      first(),
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Note Created',
      })),
    );
  }

  private editNote(form: FormGroup): Observable<void> {
    return this.notesService.editNote(new Note({
      id: this.note.id,
      text: form.controls.text.value,
      title: form.controls.title.value,
    })).pipe(
      first(),
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Note Edited',
      })),
    );
  }

  /** On cancel click. */
  public onCancelClick(): void {
    this.close();
  }

  private close(result?: boolean): void {
    this.modalController.dismiss(result);
  }
}

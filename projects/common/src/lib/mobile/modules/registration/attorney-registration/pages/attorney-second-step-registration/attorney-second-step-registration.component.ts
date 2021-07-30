import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { AttorneyRegistration } from '@jl/common/core/models/attorney-registration';
import { JusLawFile } from '@jl/common/core/models/juslaw-file';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { RegistrationService } from '@jl/common/core/services/registration.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import {
  MobileAttorneyProfileFormComponent,
} from '@jl/common/mobile/components/mobile-attorney-profile-form/mobile-attorney-profile-form.component';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, merge, of, NEVER, BehaviorSubject, ReplaySubject } from 'rxjs';
import { first, tap, shareReplay, switchMapTo, filter } from 'rxjs/operators';

import { RegistrationStepMergerService } from '../../../services/registration-step-merger.service';

/** Second step in attorney registration. */
@Component({
  selector: 'jlc-attorney-second-step-registration',
  templateUrl: './attorney-second-step-registration.component.html',
  styleUrls: ['./attorney-second-step-registration.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttorneySecondStepRegistrationComponent {
  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Attorney registration data. */
  public readonly registrationData$: Observable<AttorneyRegistration>;
  /** Validation error. */
  public readonly validationError$: Observable<TEntityValidationErrors<AttorneyRegistration>>;
  /** Form. */
  public readonly form$: Observable<FormGroup>;
  /** Attorney profile form ref. */
  @ViewChild(MobileAttorneyProfileFormComponent, { static: false })
  public readonly attorneyProfileForm: MobileAttorneyProfileFormComponent;
  /** Files attached to a registration. */
  public attachedDocs: JusLawFile<File>[] = [];

  /** Subject for errors only on this step. */
  private secondStepValidationError$ = new ReplaySubject<TEntityValidationErrors<AttorneyRegistration>>();

  /**
   * @constructor
   * @param registrationMerger Registration merger.
   * @param formBuilder Form builder.
   * @param registrationService Registration service.
   * @param router Router.
   * @param alertService Alert service.
   */
  public constructor(
    private readonly registrationMerger: RegistrationStepMergerService<AttorneyRegistration>,
    private readonly registrationService: RegistrationService,
    private readonly formBuilder: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly alertService: AlertService,
  ) {
    this.registrationData$ = this.registrationMerger.getRegistrationData();
    this.validationError$ = merge(
      this.registrationMerger.getValidationError(),
      this.secondStepValidationError$,
    );
    this.form$ = this.initFormStream();
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      data: [],
      attachedDocs: [[]],
    });
    const fillForm$ = this.registrationData$.pipe(
      first(),
      tap(data => form.patchValue({ data })),
      // We know for sure that there are no uploaded files yet.
      tap(({ attachedFiles }) =>
        this.unpackFiles(attachedFiles as File[])),
      switchMapTo(NEVER),
    );
    return merge(of(form), fillForm$).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private unpackFiles(files: File[]): void {
    this.attachedDocs = files.map(file => ({
      file,
      isLocalFile: true,
      name: file.name,
    }));
  }

  /** Presave registration data. */
  public presaveRegistrationData(): void {
    this.form$.pipe(
      first(),
      tap(form => this.registrationMerger.setRegistrationData({
        ...form.value.data,
        attachedFiles: this.attachedDocs.map(doc => doc.file),
      })),
    ).subscribe();
  }

  /**
   * Handle form submission.
   * @param form Form.
   */
  public onSubmit(form: FormGroup): void {
    this.attorneyProfileForm.markAsTouched();
    if (form.invalid) {
      return;
    }
    const attorneyData = form.value.data;
    this.isLoading$.next(true);
    this.registrationService.validateAttorneyRegistrationStep(attorneyData, 'second').pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      tap((err) => this.secondStepValidationError$.next(err && err.validationData)),
      filter(error => error == null),
    ).subscribe(
      () => {
        this.presaveRegistrationData();
        this.router.navigate(['..', 'payment'], {
          relativeTo: this.activatedRoute,
        });
      },
    );
  }
  /**
   * Present errors to a user.
   *
   * @param errors Errors.
   */
  public onFileDropErrors(errors: string[]): void {
    this.alertService.showNotificationAlert({
      header: 'Couldn\'t upload a file',
      message: errors.join('\n'),
    });
  }

  /**
   * Handle docs change.
   * @param form Form.
   * @param docs Docs to set.
   */
  public onDocumentsChange(form: FormGroup, docs: Document[]): void {
    form.controls.attachedDocs.setValue(docs);
  }
}

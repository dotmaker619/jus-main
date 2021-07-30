import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DestroyableBase } from '@jl/common/core';
import { Matter } from '@jl/common/core/models';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { Pagination } from '@jl/common/core/models/pagination';
import { Role } from '@jl/common/core/models/role';
import { Stage } from '@jl/common/core/models/stage';
import { VoiceConsent } from '@jl/common/core/models/voice-consent';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { MediaRecordingService } from '@jl/common/core/services/abstract-media-recording.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { StagesService } from '@jl/common/core/services/attorney/stages.service';
import { ConsentsService } from '@jl/common/core/services/consents.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable, combineLatest, BehaviorSubject, merge, NEVER, of, EMPTY, throwError, from } from 'rxjs';
import {
  map,
  shareReplay,
  first,
  switchMap,
  filter,
  tap,
  withLatestFrom,
  switchMapTo,
  catchError,
  take,
  retry,
  takeUntil,
} from 'rxjs/operators';

import { InformationDialogOptions } from '../../modules/dialogs/information-dialog/information-dialog.component';

import { MatterDetailPermissions, MATTER_DETAILS_RULES, RESTRICTED_FOR_SHARED_MATTER } from './matter-details-rules';

const BILLING_NOT_AVAILABLE_OPTIONS: InformationDialogOptions = {
  title: 'Log time',
  message: `This log cannot be edited. The invoice, that includes this billing, is
  already paid or payment in progress.`,
};

/** Base class for matter details page. */
export abstract class BaseMatterDetailsPage extends DestroyableBase {
  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Subject emitting update event. */
  public readonly update$ = new BehaviorSubject<void>(null);
  /** Matter permissions. */
  public readonly permissions = MatterDetailPermissions;
  /** Matter. */
  public readonly matter$: Observable<Matter>;
  /** Matter documents. */
  public readonly documents$: Observable<JuslawDocument[]>;
  /** Number of documents. */
  public readonly documentsCount$: Observable<number>;
  /** Stage options. */
  public readonly stageOptions$: Observable<Stage[]>;
  /** Matter control form. */
  public readonly matterForm$: Observable<FormGroup>;
  /** Voice consents for the matter. */
  public readonly consents$: Observable<Pagination<VoiceConsent<string>>>;
  /** Current permissions for editing. */
  public readonly curPermissions$: Observable<MatterDetailPermissions[]>;
  /** Matter is shared for current user. */
  public readonly isMatterShared$: Observable<boolean>;
  /** Trackby function. */
  public trackById = trackById;
  /** Options for billing not available modal. */
  public readonly billingNotAvailableOptions = BILLING_NOT_AVAILABLE_OPTIONS;

  /**
   * @constructor
   * @param mattersService
   * @param userService
   * @param activatedRoute
   * @param documentsService
   * @param stagesService
   * @param formBuilder
   * @param mediaRecordingService
   * @param consentsService
   */
  public constructor(
    protected readonly mattersService: MattersService,
    protected readonly userService: CurrentUserService,
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly documentsService: DocumentsService,
    protected readonly stagesService: StagesService,
    protected readonly formBuilder: FormBuilder,
    protected readonly mediaRecordingService: MediaRecordingService,
    protected readonly consentsService: ConsentsService,
  ) {
    super();
    this.matter$ = this.initMatterStream();
    this.curPermissions$ = this.initCurrentPermissionsStream();
    this.documents$ = this.initDocumentsStream();
    this.documentsCount$ = this.documents$.pipe(
      map((docs) => this.documentsService.countFiles(docs)),
    );
    this.isMatterShared$ = this.matter$.pipe(map((matter) => matter.isSharedWithCurrentUser));
    this.stageOptions$ = this.initStageOptionsStream();
    this.matterForm$ = this.initMatterFormStream();
    this.consents$ = this.initConsentsListStream();
  }

  private initConsentsListStream(): Observable<Pagination<VoiceConsent<string>>> {
    const matterId$ = this.matter$.pipe(
      map(({ id }) => id),
    );

    return matterId$.pipe(
      switchMap(id =>
        this.consentsService.getVoiceConsentsByMatterId(id),
      ),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initMatterFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      stage: [],
    });

    const initFormValue$ = combineLatest([
      this.matter$,
      this.curPermissions$,
    ]).pipe(
      tap(([matter, isEditable]) => {
        form.controls.stage.setValue(
          matter.stage ? matter.stage.id : null,
          {
            emitEvent: false,
          },
        );

        if (isEditable) {
          form.enable();
        } else {
          form.disable();
        }
      }),
    );

    const updateStageOnChange$ = form.valueChanges.pipe(
      map(({ stage }) => stage),
      withLatestFrom(this.matter$),
      switchMap(([stageId, matter]) =>
        this.mattersService.updateMatterStage(matter, stageId)),
    );

    const formSideEffect$ = merge(
      initFormValue$,
      updateStageOnChange$,
    ).pipe(
      switchMapTo(NEVER),
    );

    return merge(of(form), formSideEffect$).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initStageOptionsStream(): Observable<Stage[]> {
    return this.matter$.pipe(
      switchMap(({ id }) => this.stagesService.getStages({ matter: id })),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private initDocumentsStream(): Observable<JuslawDocument[]> {
    return this.matter$.pipe(
      switchMap(({ id }) => this.documentsService.getDocumentsForMatter(id)),
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
    );
  }

  private initMatterStream(): Observable<Matter> {
    return combineLatest([
      this.activatedRoute.paramMap,
      this.update$,
    ]).pipe(
      map(([params]) => parseInt(params.get('id'), 10)),
      filter(id => id != null && !isNaN(id)),
      switchMap((id) => this.mattersService.getMatterById(id)),
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
    );
  }

  private initCurrentPermissionsStream(): Observable<MatterDetailPermissions[]> {
    const role$ = this.userService.currentUser$.pipe(
      map(({ role }) => role),
    );
    return combineLatest([
      role$, this.matter$,
    ]).pipe(
      map(([role, matter]) => {
        const permissions = (MATTER_DETAILS_RULES[matter.status][role] as MatterDetailPermissions[]);
        /*
         Check role as well because we want to filter permissions only for invited attorneys
          but paralegal users also have 'true' value in 'isSharedWithCurrentUser'
        */
        return matter.isSharedWithCurrentUser && role === Role.Attorney
          ? permissions.filter((permission) => !RESTRICTED_FOR_SHARED_MATTER.includes(permission))
          : permissions;
      }),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /**
   * Check whether the user has access to a permission.
   *
   * @param permission Permission.
   */
  public isAble(permission: MatterDetailPermissions): Observable<boolean> {
    return this.curPermissions$.pipe(
      first(),
      map(perms => perms.includes(permission)),
    );
  }

  /**
   * Handle click on call button.
   * @param matter Matter.
   */
  public onCallClicked(matter: Matter): void {
    this.isLoading$.next(true);
    this.userService.currentUser$.pipe(
      first(),
      map(user => user.role === Role.Client ? [user, matter.attorney] : [user, matter.client]),
      switchMap(users => this.mattersService.initiateCallForMatter(users)),
      takeUntil(this.destroy$),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe();
  }

  /**
   * Upload audio consent for matter.
   * @param file Audio file.
   * @param title File name.
   */
  public uploadConsentForMatter(file: Blob, title: string): Observable<void> {
    this.isLoading$.next(true);
    const matterId$ = this.matter$.pipe(
      first(),
      map(({ id }) => id),
    );
    return matterId$.pipe(
      switchMap((id) =>
        this.consentsService.uploadVoiceConsentForMatter(id, file, title)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      first(),
      tap(() => this.update$.next()),
    );
  }

  /**
   * Handle click on 'add consent' button.
   * Opens a dialog for recording a consent.
   */
  public recordConsent(): void {
    this.mediaRecordingService.captureAudio().pipe(
      catchError(err => { // Notify user if capturing audio is not available and then close the stream
        this.notifyError(err.message);
        return EMPTY;
      }),
      take(1),
      filter(recordAudio => !!recordAudio),
      switchMap(recordedAudio => {
        return combineLatest([
          of(recordedAudio),
          this.askUserForFileName(),
        ]).pipe(
          first(),
          switchMap(([audio, title]) => this.uploadConsentForMatter(audio, title)),
          catchError(err => {
            return from(this.notifyError(err.message)).pipe(
              switchMapTo(throwError(err)),
            );
          }),
          retry(),
        );
      }),
    ).subscribe();
  }

  private askUserForFileName(): Observable<string> {
    let requestAfterInvalidValue$ = this.requestFileNameFromUser(
      'Please, enter the record name',
      'Name of the record',
      'Name can\'t be blank, choose another name',
    );

    requestAfterInvalidValue$ = requestAfterInvalidValue$.pipe(
      switchMap((val) => val === '' ? requestAfterInvalidValue$ : of(val)),
    );

    return this.requestFileNameFromUser('Please, enter the record name', 'Name of the record')
      .pipe(
        switchMap(newTitle => newTitle === '' ? requestAfterInvalidValue$ : of(newTitle)),
      );
  }

  /** Notify user that recording is not available for the device. */
  protected abstract notifyError(message: string): Promise<void>;
  /** Request a user to type a voice consent title. */
  protected abstract requestFileNameFromUser(label: string, header: string, message?: string): Observable<string>;
}

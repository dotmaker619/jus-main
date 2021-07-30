import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { JusLawFile } from '@jl/common/core/models/juslaw-file';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { ESignService } from '@jl/common/core/services/esign.service';
import { ExternalResourcesService } from '@jl/common/core/services/external-resources.service';
import { JuslawFiles } from '@jl/common/core/utils/juslaw-files';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, ReplaySubject, BehaviorSubject, NEVER, merge, of, race, EMPTY } from 'rxjs';
import { switchMap, tap, first, catchError, switchMapTo } from 'rxjs/operators';

/**
 * Modal for uploading a file.
 */
@Component({
  selector: 'jlc-upload-file-modal',
  templateUrl: './upload-file-modal.component.html',
  styleUrls: ['./upload-file-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadFileModalComponent implements OnInit {

  /**
   * @constructor
   * @param formBuilder
   * @param documentsService
   * @param modalController
   * @param esignService
   * @param externalResourcesService
   * @param alertService
   */
  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly documentsService: DocumentsService,
    private readonly modalController: ModalController,
    private readonly esignService: ESignService,
    private readonly externalResourcesService: ExternalResourcesService,
    private readonly alertService: AlertService,
  ) {
    this.folders$ = this.initDocumentsStream();
    this.form$ = this.initFormStream();
  }

  private matterIdChange$ = new ReplaySubject<number>(1);
  /** Async error message. */
  public readonly error$ = new ReplaySubject<string>(1);

  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Form. */
  public form$: Observable<FormGroup>;

  /** Matter id. */
  @Input()
  public matterId: number;

  /** Is docusign option available. */
  @Input()
  public docusignAvailable = true;

  /** Custom array of folders to select.  */
  @Input()
  public folders: JuslawDocument[];

  /** Documents. */
  public documents: JusLawFile<File>[] = [];

  /** Folders. */
  public readonly folders$: Observable<JuslawDocument[]>;
  private readonly foldersFromParams$ = new ReplaySubject<JuslawDocument[]>(1);
  /** File validators. */
  public fileValidators = [
    JuslawFiles.validateForRestrictedTypes,
    JuslawFiles.validateForSizeLimitation,
  ];

  /** Trackby function. */
  public trackById = trackById;

  /** @inheritdoc */
  public ngOnInit(): void {
    if (this.folders != null) {
      this.foldersFromParams$.next(this.folders);
      this.foldersFromParams$.complete();
    } else {
      this.matterIdChange$.next(this.matterId);
      this.matterIdChange$.complete();
    }
  }

  private initDocumentsStream(): Observable<JuslawDocument[]> {
    const foldersByMatterId$ = this.matterIdChange$.pipe(
      switchMap((matterId) =>
        this.documentsService.getFolders(matterId)),
    );
    return race([
      foldersByMatterId$,
      this.foldersFromParams$,
    ]);
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      folder: [null, Validators.required],
    });

    const fillForm$ = this.folders$.pipe(
      tap(folders => form.controls.folder.setValue(folders[0].id)),
      switchMapTo(NEVER),
    );

    return merge(of(form), fillForm$);
  }

  /**
   * On cancel button clicked.
   */
  public onCancelClicked(): void {
    this.close();
  }

  /**
   * Close the dialog.
   */
  public close(): void {
    this.modalController.dismiss();
  }

  /**
   * On form submit.
   * @param form Form.
   */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }

    if (form.valid) {
      this.isLoading$.next(true);
      const uploadDoc$ = this.documentsService.uploadDocuments(
        this.documents.map(file => file.file),
        this.matterId || null,
        form.controls.folder.value,
      );

      uploadDoc$.pipe(
        first(),
        onMessageOrFailed(() => this.isLoading$.next(false)),
        switchMap(() => this.alertService.showNotificationAlert({
          header: 'Document Uploaded',
        })),
        catchError((error: Error) => this.alertService.showNotificationAlert({
          header: error.message,
        })),
      ).subscribe(() => {
        this.close();
      });
    }
  }

  /**
   * On errors change.
   * @param errors Errors.
   */
  public async onErrorChange(errors: string[]): Promise<void> {
    return this.alertService.showNotificationAlert({
      header: 'Some files weren\'t attached',
      message: errors.join('\n'),
    });
  }

  /** Send selected document to docusign. */
  public onDocusignButtonClick(): void {
    this.isLoading$.next(true);
    this.esignService.sendMatterDocsToESign(this.documents.map(doc => doc.file), this.matterId).pipe(
      first(),
      switchMap(({ editLink }) => this.finishDocusign(editLink)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchError((error: string) => {
        this.alertService.showNotificationAlert({
          message: error,
        });
        return EMPTY;
      }),
    ).subscribe(() => this.close());
  }

  /**
   * Finish docusign.
   *
   * @param editLink Link to edit doc.
   */
  private async finishDocusign(editLink: string): Promise<void> {
    const shouldSign = await this.alertService.showConfirmation({
      header: 'Success',
      message: 'You will be redirected to DocuSign profile to complete the process.',
      buttonText: 'OK',
      cancelButtonText: 'Later',
    }).toPromise();

    if (shouldSign) {
      this.externalResourcesService.openExternalLink(editLink);
    }
  }

}

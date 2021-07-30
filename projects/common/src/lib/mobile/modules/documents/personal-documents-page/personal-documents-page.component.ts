import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';

import { DocumentsPageMobile } from '../documents-page-mobile';

/** Personal documents page component. Used in mobile workspace. */
@Component({
  selector: 'jlc-personal-documents-page',
  templateUrl: './personal-documents-page.component.html',
  styleUrls: ['./personal-documents-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDocumentsPageComponent extends DocumentsPageMobile {
  /** Documents tree. */
  public readonly privateDocuments$: Observable<JuslawDocument[]>;
  /** Folders */
  protected readonly folders$: Observable<JuslawDocument[]>;

  /**
   * @constructor
   * @param documentsService Docs service.
   * @param modalController Modal controller.
   * @param alertService Alert controller.
   * @param activatedRoute Activated route.
   */
  public constructor(
    protected readonly documentsService: DocumentsService,
    protected readonly modalController: ModalController,
    protected readonly alertService: AlertService,
    protected readonly activatedRoute: ActivatedRoute,
  ) {
    super(
      documentsService,
      modalController,
      alertService,
      activatedRoute,
    );
    this.privateDocuments$ = this.initDocsStream();
    this.folders$ = this.getFolders();
  }

  private initDocsStream(): Observable<JuslawDocument[]> {
    return combineLatest([
      this.queryChange$,
    ]).pipe(
      switchMap(([query]) => this.documentsService.getPrivateDocs(query)),
    );
  }

  /**
   * Get folders
   */
  private getFolders(): Observable<JuslawDocument[]> {
    return this.documentsService.getFolders().pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}

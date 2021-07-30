import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { DialogsService } from '@jl/common/shared';
import { Observable, combineLatest } from 'rxjs';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';

import { DocumentsPage } from '../documents-page';

/**
 * Private documents component.
 *
 * Contains filtering options for private documents and documents-tree component.
 */
@Component({
  selector: 'jlc-private-docs',
  templateUrl: './private-docs.component.html',
  styleUrls: ['./private-docs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateDocsComponent extends DocumentsPage {

  /** Documents tree. */
  public privateDocuments$: Observable<JuslawDocument[]>;

  /** Filter form documents. */
  public filterForm = this.fb.group({
    filter: [null],
  });

  /**
   * @constructor
   * @param docsService
   * @param fb
   * @param dialogsService
   */
  public constructor(
    protected readonly docsService: DocumentsService,
    protected readonly dialogsService: DialogsService,
    private readonly fb: FormBuilder,
  ) {
    super(
      docsService,
      dialogsService,
    );
    this.privateDocuments$ = combineLatest([
      this.filterForm.valueChanges.pipe(startWith(null)),
    ]).pipe(
      debounceTime(200),
      switchMap(([value]) => this.docsService.getPrivateDocs(value && value.filter)),
    );
  }

}

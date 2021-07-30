import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { DialogsService } from '@jl/common/shared';
import { Observable, combineLatest } from 'rxjs';
import { startWith, debounceTime, switchMap, map } from 'rxjs/operators';

import { DocumentsPage } from '../documents-page';

/** Template documents page. */
@Component({
  selector: 'jlc-template-docs',
  templateUrl: './template-docs.component.html',
  styleUrls: ['./template-docs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateDocsComponent extends DocumentsPage {

  /** Documents tree. */
  public templates$: Observable<JuslawDocument[]>;

  /** Filter form documents. */
  public templatesQueryForm = this.fb.group({
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
    this.templates$ = combineLatest([
      this.templatesQueryForm.valueChanges.pipe(startWith(null)),
    ]).pipe(
      debounceTime(200),
      switchMap(([value]) => this.docsService.getTemplateDocuments(value && value.filter)),
    );
  }

  /** @inheritdoc */
  protected getFoldersToUploadFile(): Observable<JuslawDocument[]> {
    return this.docsService.getEditableTemplateFolders();
  }
}

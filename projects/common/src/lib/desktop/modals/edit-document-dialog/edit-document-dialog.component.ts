import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JuslawDocumentType } from '@jl/common/core/models/document-type';
import { JlpFile } from '@jl/common/core/models/jlp-file';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { AbstractDialog } from '@jl/common/shared';
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

interface EditDocumentDialogOptions {
  /** Document */
  document: JuslawDocument;
  /** Function to call on 'save' */
  saveCb: (doc: JlpFile) => Observable<boolean>;
}

/**
 * Modal window to edit a document.
 */
@Component({
  selector: 'jlc-edit-document-dialog',
  templateUrl: './edit-document-dialog.component.html',
  styleUrls: ['./edit-document-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDocumentDialogComponent extends AbstractDialog<EditDocumentDialogOptions> {
  /** Fired once after modal props were initialized. */
  public readonly propsInit$ = new ReplaySubject<void>(1);
  /** Loading controller. */
  public readonly isLoading$ = new BehaviorSubject(false);

  /** @inheritdoc */
  public afterPropsInit(): void {
    const docType = this.options.document.type;
    if (
      docType !== JuslawDocumentType.Document &&
      docType !== JuslawDocumentType.TemplateDocument
    ) {
      throw new Error('JusLawDocument has to be one of the types: \'Document\', \'TemplateDocument\'');
    }
    this.propsInit$.next();
  }

  /**
   * Handle 'save' of the 'pdf-editor' component.
   * @param file File in blob format
   */
  public onFileSave(file: JlpFile): void {
    this.options.saveCb(file)
      .pipe(take(1))
      .subscribe((val) => {
        if (val) {
          this.close();
        }
      });
  }
}

import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { JusLawFile } from '@jl/common/core/models/juslaw-file';

/**
 * Type for file validator.
 * @param file File we want to validate.
 * @returns Error message or null.
 */
export type FileValidator = (file: JusLawFile) => string | null;

const getFileEntryValidator = (files: JusLawFile[]): FileValidator => {
  return (file: JusLawFile): string | null => {
    const isFilePresented = files.some(
      attachedFile => attachedFile.name === file.name,
    );

    if (!isFilePresented) {
      return null;
    }
    return `${file.name} already attached.`;
  };
};

/** File drag&drop component. */
@Component({
  selector: 'jlc-file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDropComponent {

  /** Is file dragged over a dialog. */
  public isFileDragged = false;

  /** File validators. */
  @Input()
  public fileValidators: FileValidator[] = [];

  /** Show only browse button without drag&drop functionality. */
  @Input()
  public onlyBrowseButton = false;

  /** Multiple files allowed. */
  @Input()
  public multiple = null;

  /** Validation errors emitter. */
  @Output()
  public errors = new EventEmitter<string[]>();

  /** Attached files. */
  @Input()
  public set documents(docs: JusLawFile[]) {
    this.documentsValue = docs == null ? [] : docs.slice();
  }

  /** Attached files. */
  public get documents(): JusLawFile[] {
    return this.documentsValue;
  }

  /** Files change emitter. */
  @Output()
  public documentsChange = new EventEmitter<JusLawFile[]>();

  /** Documents value. */
  protected documentsValue: JusLawFile[] = [];

  private get embeddedValidators(): FileValidator[] {
    /*
     * It is a getter because `this.files` is constantly changing due to @Input() decorator,
     *  and always want current files value.
    */
    return [
      getFileEntryValidator(this.documentsValue),
    ];
  }

  /** Do nothing on drag over. */
  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFileDragged = true;
  }

  /** Do nothing on drag leave. */
  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFileDragged = false;
  }

  /** Save file on drop. */
  public onDrop(event: DragEvent): void {
    const filesToAttach = Array.from(event.dataTransfer.files);
    event.preventDefault();
    event.stopPropagation();
    this.isFileDragged = false;
    this.attachFiles(this.multiple ? filesToAttach : [filesToAttach[0]]);
  }

  /** Save file on change. */
  public onFileChange(event: Event): void {
    const input = (<HTMLInputElement>event.target);
    const uploadingFiles = Array.from(input.files);

    this.attachFiles(this.multiple ? uploadingFiles : [uploadingFiles[0]]);
    // Clear input so the next uploads will cause a change event.
    input.value = null;
  }

  private attachFiles(files: File[]): void {
    const docs = files.map(file => new JusLawFile({
      name: file.name,
      file: file,
    }));
    const validationErrors = docs.map(doc => {
      const errors = this.runValidatorsOnFile(doc);

      if (!errors.length) {
        if (this.multiple) {
          this.documentsValue.push(doc);
        } else {
          this.documentsValue = [doc];
        }
      }
      return errors;
    }).flat();

    if (validationErrors.length) {
      this.errors.next(validationErrors);
    }

    this.documentsChange.next(this.documentsValue);
  }
  /**
    * Validate files with presented validators.
    *
    * @param files Files to validate.
    */
  private runValidatorsOnFile(file: JusLawFile): string[] | null {
    const validators = this.fileValidators.concat(this.embeddedValidators);
    return validators.map(validate => validate(file)).filter(error => !!error);
  }

  /**
   * Remove file from attachments.
   *
   * @param file File to remove.
   */
  public onRemoveFileClick(file: JusLawFile): void {
    const fileToRemoveIdx = this.documentsValue.findIndex(attachedFile =>
      attachedFile.name === file.name,
    );

    this.documentsValue.splice(fileToRemoveIdx, 1);
    this.documentsChange.next(this.documentsValue);
  }
}

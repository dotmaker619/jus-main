import { Component, ChangeDetectionStrategy, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileStorageService } from '@jl/common/core/services/file-storage.service';
import { ContentChange, QuillEditor } from 'ngx-quill';
import { first } from 'rxjs/operators';

const DEFAULT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => HtmlEditorComponent),
  multi: true,
};

/**
 * Html editor component.
 */
@Component({
  selector: 'jlc-html-editor',
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DEFAULT_VALUE_ACCESSOR],
})
export class HtmlEditorComponent implements ControlValueAccessor {
  /**
   * Input type=file ref
   */
  @ViewChild('imageUploader', { static: false })
  public imageElRef: ElementRef<HTMLInputElement>;

  /**
   * Content.
   */
  public content: string;

  /**
   * Editor styles configuration.
   * To add style use css property name.
   */
  public readonly editorStyles = {
    height: '200px',
  };

  /**
   * @constructor
   *
   * @param fileStorageService File storage service.
   */
  public constructor(
    private readonly fileStorageService: FileStorageService,
  ) { }

  /** On touched callback. */
  public onTouched(): void { }

  /** On change callback. */
  public onChange(_: any): void { }

  /** @inheritdoc */
  public writeValue(val: string): void {
    this.content = val;
  }

  /** @inheritdoc */
  public registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  /** @inheritdoc */
  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Handle 'onContentChanged' of 'quill-editor'
   * @param event Change event.
   */
  public onEditorValueChange(event: ContentChange): void {
    this.onChange(event.html);
  }

  /**
   * Fired after quill editor is created.
   *
   * @param quill Quill editor instance.
   */
  public onEditorCreated(quill: QuillEditor): void {
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('image', () => this.uploadFile(quill));
  }

  /*
    Default quill image handler saves image at base64 format.
    We want to upload images to s3 directly and save url in <img> tag.
  */
  private uploadFile(quill: QuillEditor): void {
    const input = this.imageElRef.nativeElement;

    input.onchange = (event: Event) => {
      const files = (event.target as HTMLInputElement).files;
      const file = files && files.item(0);
      if (file) {
        this.fileStorageService.uploadAttorneyPostImage(file).pipe(
          first(),
        ).subscribe((imgSrc) => {
          quill.insertEmbed(quill.getSelection().index, 'image', imgSrc);
        });
      }
    };

    input.click();
  }
}

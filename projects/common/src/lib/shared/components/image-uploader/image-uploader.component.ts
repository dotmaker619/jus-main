import { Component, ChangeDetectionStrategy, forwardRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

const VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ImageUploaderComponent),
  multi: true,
};

/**
 * Component to upload image.
 */
@Component({
  selector: 'jlc-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VALUE_ACCESSOR],
})
export class ImageUploaderComponent implements ControlValueAccessor {
  /**
   * Selected file.
   */
  public value: File;
  /**
   * If image selected.
   */
  public isSelected = false;
  /**
   * Image source.
   */
  public readonly imgSrc$ = new BehaviorSubject<string | SafeUrl>(null);

  private onChange(_: File): void { }
  private onTouched(): void { }

  /**
   * @constructor
   *
   * @param domSanitizer DOM sanitizer.
   */
  public constructor(
    private readonly domSanitizer: DomSanitizer,
  ) { }

  /**
   * Listen to 'change' event.
   * @param event Filelist.
   */
  @HostListener('change', ['$event.target.files'])
  public emitFiles(event: FileList): void {
    const file = event && event.item(0);
    if (file) {
      this.onChange(file);
      this.isSelected = true;
      this.imgSrc$.next(this.getFileUrl(file));
    }
  }

  /**
   * Handle 'click' event of 'Remove' button
   */
  public removeImage(): void {
    this.onChange(null);
    this.isSelected = false;
    this.imgSrc$.next(null);
  }

  /** @inheritdoc */
  public writeValue(value: any): void {
    if (value != null) {
      this.imgSrc$.next(value);
    }
  }

  /** @inheritdoc */
  public registerOnChange(fn: (_: File) => void): void {
    this.onChange = fn;
  }

  /** @inheritdoc */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Get safe url of file.
   */
  private getFileUrl(file: File): SafeUrl {
    return this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
  }
}

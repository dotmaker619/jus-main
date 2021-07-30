import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { JusLawFile } from '@jl/common/core/models/juslaw-file';
import { FileDropComponent, FileValidator } from '@jl/common/shared/components/file-drop/file-drop.component';

/** File drop component for mobile workspace. */
@Component({
  selector: 'jlc-mobile-file-drop',
  templateUrl: './mobile-file-drop.component.html',
  styleUrls: ['./mobile-file-drop.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileFileDropComponent extends FileDropComponent {
  /** File validators. */
  @Input()
  public fileValidators: FileValidator[] = [];

  /** Validation errors emitter. */
  @Output()
  public errors = new EventEmitter<string[]>();

  /** Attached files. */
  @Input()
  public documents: JusLawFile[] = [];

  /** Files change emitter. */
  @Output()
  public documentsChange = new EventEmitter<JusLawFile[]>();

  /** Multiple files. */
  @Input()
  public multiple = false;

  /** Toggle visibility of the default button which opens file system. */
  @Input()
  public showButton = true;

  /** Reference on input[type='file] */
  @ViewChild('inputFile', { static: true })
  public inputFile: ElementRef<HTMLInputElement>;

  /**
   * Trackby function.
   * @param _ Idx.
   * @param doc File.
   */
  public trackByFileName(_: number, doc: JusLawFile): string {
    return doc.name;
  }

  /**
   * Calls click() method of input.
   */
  public clickOnInput(): void {
    this.inputFile.nativeElement.click();
  }

  /**
   * Checks if it's needed to display the default button.
   */
  public shouldDisplayButton(): boolean {
    return (this.multiple || this.documentsValue.length === 0) && this.showButton;
  }
}

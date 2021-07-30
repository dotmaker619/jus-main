import { Directive, ElementRef, HostListener } from '@angular/core';
import { FileService } from '@jl/common/core/services/file.service';

/**
 * Custom directive to allow download files using `<a download>` element for Cordova application.
 */
@Directive({
  // tslint:disable-next-line: directive-selector
  selector: 'a[download][jusLawDownload],a[attr.download][jusLawDownload]',
})
export class DownloadDirective {

  /**
   * @constructor
   * @param elementRef Element reference.
   */
  public constructor(
    private readonly elementRef: ElementRef<HTMLAnchorElement>,
    private fileService: FileService,
  ) {
  }

  /**
   * On "click" event handler.
   * @param event Click event.
   */
  @HostListener('click', ['$event'])
  public onClicked(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const anchorElement = this.elementRef.nativeElement;
    // Get file name from download attribute or extract it from URL.
    const targetFileName = anchorElement.getAttribute('download');
    if (targetFileName == null || targetFileName.trim().length === 0) {
      throw new Error('You should specify file name through "download" attribute');
    }
    anchorElement.setAttribute('disabled', 'disabled');
    this.fileService.downloadFile(anchorElement.href, targetFileName)
      .finally(() => anchorElement.removeAttribute('disabled'));
  }
}

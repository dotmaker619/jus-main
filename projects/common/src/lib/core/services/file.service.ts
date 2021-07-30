import { DOCUMENT } from '@angular/common';
import { Injectable, Inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/** File service. */
@Injectable({
  providedIn: 'root',
})
export class FileService {

  constructor(
    private domSanitizer: DomSanitizer,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  /**
   * Get safe url of file.
   */
  public getFileUrl(file: File): SafeUrl {
    return this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
  }

  /**
   * Save file by blob
   * @param urlOrFile
   * @param targetFileName
   */
  public downloadFile(urlOrFile: string | Blob, targetFileName: string): Promise<void> {
    const url = urlOrFile instanceof Blob
      ? URL.createObjectURL(urlOrFile)
      : urlOrFile;
    return new Promise((resolve) => {
      const tempLink = this.document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = url;
      tempLink.setAttribute('download', targetFileName);
      /**
       * Safari thinks _blank anchor are pop ups. We only want to set _blank
       * target if the browser does not support the HTML5 download attribute.
       * This allows you to download files in desktop safari if pop up blocking
       * is enabled.
       */
      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
      }
      this.document.body.appendChild(tempLink);
      tempLink.click();
      this.document.body.removeChild(tempLink);
      setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(url);
        resolve();
      }, 100);
    });
  }
}

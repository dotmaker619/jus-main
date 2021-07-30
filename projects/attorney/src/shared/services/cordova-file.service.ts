import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Platform } from '@ionic/angular';
import { FileService } from '@jl/common/core/services/file.service';

const FILE_EXISTS_ERROR_CODE = 12;

/**
 * Cordova specific file service implementation.
 */
export class CordovaFileService extends FileService {
  /**
   * @constructor
   * @param domSanitizer Dom Sanitize.
   * @param document Document reference.
   * @param httpClient Http client.
   * @param nativeFileService Cordova file service.
   */
  public constructor(
    domSanitizer: DomSanitizer,
    @Inject(DOCUMENT) document: Document,
    private readonly httpClient: HttpClient,
    private readonly nativeFileService: File,
    private readonly socialSharingService: SocialSharing,
    private readonly platform: Platform,
  ) {
    super(domSanitizer, document);
  }

  /**
   * @inheritdoc
   */
  public downloadFile(urlOrFile: string | Blob, targetFileName: string): Promise<void> {
    const dataToSave: Promise<Blob | ArrayBuffer> = typeof urlOrFile === 'string'
      ? this.httpClient.get(urlOrFile, { observe: 'body', responseType: 'arraybuffer' }).toPromise()
      : Promise.resolve(urlOrFile);

    return dataToSave.then(data => this.saveDataToFileWithFileExistsCheck(data, targetFileName));
  }

  /**
   * Save data to local system file.
   * @param data Saved data.
   * @param targetFileName Target file name (extension is required).
   */
  private saveDataToFile(data: Blob | ArrayBuffer, targetFileName: string): Promise<void> {
    const targetDirectoryPath = this.platform.is('ios')
      ? this.nativeFileService.tempDirectory
      : this.nativeFileService.cacheDirectory;
    return this.nativeFileService.resolveDirectoryUrl(targetDirectoryPath)
      .then(targetDirectory => this.nativeFileService.writeFile(targetDirectory.nativeURL, targetFileName, data) as Promise<FileEntry>)
      .then(file => {
        /**
         * Android and iOS use different format of file path.
         * Android uses it as is, but for iOS we should decode encoded string.
         */
        const filePath = this.platform.is('ios')
          ? decodeURIComponent(file.nativeURL)
          : file.nativeURL;
        return this.socialSharingService.share('', '', filePath)
          .finally(() => file.remove(() => {}, () => {})); // Try to remove file. If failed then ignore error - OS will clear it someday.
      });
  }

  /**
   * Try to save a file with requested file name. If failed then prepare new file name and retry with it.
   * @param data Saved data.
   * @param originalTargetFileName Original file name to save a data.
   * @param curAttemptFileName File name of current saving attempt.
   * @param attemptNumber Attempt number.
   */
  private saveDataToFileWithFileExistsCheck(
    data: Blob | ArrayBuffer,
    originalTargetFileName: string,
    curAttemptFileName: string = null,
    attemptNumber: number = 1): Promise<void> {
    const targetFileName = attemptNumber === 1
      ? originalTargetFileName
      : curAttemptFileName;
    return this.saveDataToFile(data, targetFileName)
      .catch(error => {
        if (error.code === FILE_EXISTS_ERROR_CODE) {
          // Such file already exists. Try with new name.
          const [ name, ext ] = originalTargetFileName.split('.');
          const newTargetFileName = `${name} (${attemptNumber}).${ext}`;
          return this.saveDataToFileWithFileExistsCheck(data, originalTargetFileName, newTargetFileName, attemptNumber + 1);
        }
        throw error;
      });
  }
}

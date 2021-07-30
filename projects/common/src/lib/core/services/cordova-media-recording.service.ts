import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { MediaCapture, MediaFile, CaptureError } from '@ionic-native/media-capture/ngx';
import { Observable, of, throwError, EMPTY } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { MediaRecordingService } from './abstract-media-recording.service';

/** Error codes on media capturing. */
enum MediaCaptureErrorCode {
  /** Media capturing cancelled. */
  Canceled = 3,
  /** No activity found for voice-recording. */
  NoRecorder = 20,
}

/**
 * Returns stream with error instance if code is bad.
 * @param code Error code.
 */
function getError(code?: MediaCaptureErrorCode): Observable<never> {
  let error: Error;
  if (code === MediaCaptureErrorCode.Canceled) {
    return EMPTY;
  } else if (code === MediaCaptureErrorCode.NoRecorder) {
    error = new Error('Unfortunately, your device either doesn\'t have or has an unappropriate application to perform voice recording');
  } else {
    error = new Error('Unfortunately, either you did not provide permissions \
    for your microphone or your device does not support voice recording');
  }

  return throwError(error);
}

interface MediaCaptureError {
  /** Error code. */
  code: MediaCaptureErrorCode;
  /** Error message. */
  message?: string;
}

// Map of used file extensions to MIME types.
const extensionToMimeType = {
  'wav': 'audio/wav',
};

/** Native media recording service. */
@Injectable({ providedIn: 'root' })
export class CordovaMediaRecordingService extends MediaRecordingService {
  /**
   * @constructor
   * @param mediaCapture Media capture service.
   * @param file File plugin.
   */
  public constructor(
    private readonly mediaCapture: MediaCapture,
    private readonly file: File,
  ) {
    super();
  }

  /** @inheritdoc */
  public captureAudio(): Observable<Blob | null> {
    return of(null).pipe(
      switchMap(() => this.mediaCapture.captureAudio()),
      switchMap((dataOrError) => this.isData(dataOrError) ? of(dataOrError[0]) : getError()),
      switchMap(data => this.mediaFileToBlob(data)),
      catchError(({code}: MediaCaptureError) => getError(code)),
    );
  }

  private isData(data: MediaFile[] | CaptureError): data is MediaFile[] {
    return (data instanceof Array);
  }

  private async mediaFileToBlob(data: MediaFile): Promise<Blob> {
    /**
     * File prefix is required due to the issue decoding file using CordovaFile when no there's no prefix.
     * iOS does not include required prefix in filepath, so we're adding it manually.
     * @see https://stackoverflow.com/questions/45910519/ionic-3-native-file-code-5-message-encoding-err
     */
    const filePrefix = 'file://';
    /**
     * Using decodeURIComponent to ensure that there will be not escaped symbols,
     *  because some devices encode URI parts as URI components
     *  (for example some android devices escape comma sign as %2C, and decodeURI does not decode it).
     */
    const path = decodeURIComponent(data.fullPath);
    const prefixedPath = path.includes(filePrefix) ? path : filePrefix.concat(path);
    const name = data.name;
    const fileExtension = name.substr(name.lastIndexOf('.') + 1);
    const dir = prefixedPath.substr(0, prefixedPath.lastIndexOf('/') + 1);
    const arrayBuffer = await this.file.readAsArrayBuffer(dir, name);

    /**
     * Since iOS may return `undefined` type of MediaFile, I added a manual mapping to MIME type.
     * Unfortunately, I haven't found any active issues on cordova-media-capture-plugin repo.
     */
    const mimeType = data.type || extensionToMimeType[fileExtension];
    if (mimeType == null) {
      throw new Error('Unexpected file extension on voice recording!');
    }
    return new Blob([arrayBuffer], { type: mimeType });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { JlpFile } from '../models/jlp-file';

type S3DestinationBucket =
  'user_avatars' |
  'forum_icons' |
  'documents' |
  'esign' |
  'chats_images' |
  'attorney_registration_attachments' |
  'voice_consents' |
  'attorney_posts';

interface S3DirectBody {
  /**
   * Destination bucket.
   */
  dest: S3DestinationBucket;
  /**
   * File name.
   */
  filename: string;
  /**
   * Content type.
   */
  content_type: string;
}

/** Config that comes from API */
interface S3DirectUploadInfo {
  /** Url for uploading file to s3. */
  'form_action': string;

  /** Configuration set up on API. */
  [key: string]: any;
}

/**
 * File storage service.
 */
@Injectable({
  providedIn: 'root',
})
export class FileStorageService {
  private s3directUrl = new URL('s3direct/get_params/', this.appConfig.apiUrl).toString();

  /**
   * @constructor
   * @param http Http client.
   * @param appConfig Application config service.
   */
  public constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
  ) { }

  /**
   * Upload file to s3.
   * @param dest Destination option.
   * @param file File to upload.
   * @param filename File name.
   */
  private uploadFile(dest: S3DestinationBucket, file: Blob, filename: string): Observable<string> {
    /**
     * Using **Blob** parameter instead of **File** because
     *  Cordova File plugin overrides default browser's File API
     * @see https://github.com/apache/cordova-plugin-file/issues/265
     */
    const body = {
      dest,
      filename,
      content_type: file.type,
    } as S3DirectBody;

    const formData = new FormData();

    return this.http.post<S3DirectUploadInfo>(this.s3directUrl, body).pipe(
      switchMap((redirectInfo) => {
        // Set all the configurations from redirectInfo to formData object.
        const s3body = Object.keys(redirectInfo).reduce((prev: FormData, cur) => {
          if (cur === 'form_action') {
            // Don't add 'form_action' because it breaks the uploading on prod.
            return prev;
          }
          // Add all the other fields.
          prev.append(cur, redirectInfo[cur]);
          return prev;
        }, formData);

        // !!! Important to add a file as the last field of form data. https://stackoverflow.com/a/15235866
        formData.append('file', file, filename);

        // Set response type 'text' because s3 returns XML.
        // Using Object type to avoid errors connected with responseType
        const options: Object = { observe: 'body', responseType: 'text' };

        return this.http.post<string>(redirectInfo.form_action, s3body, options);
      }),
      map((resultXml: string) => {
        const parser = new DOMParser();
        const xmlDocument = parser.parseFromString(resultXml, 'application/xml').documentElement;
        const location = xmlDocument.querySelector('Location').textContent;
        return location;
      }),
    );
  }

  /**
   * Upload avatar.
   * @param file Avatar file.
   * @returns URL to uploaded file.
   */
  public uploadAvatar(file: File): Observable<string> {
    return this.uploadFile('user_avatars', file, file.name);
  }

  /**
   * Upload files to be able to use them with E-sign.
   * @param files Files to upload.
   */
  public uploadForEsign(files: File[]): Observable<string[]> {
    if (!files || !files.length) {
      return of([]);
    }
    const dest: S3DestinationBucket = 'esign';
    return forkJoin(files.map(file => this.uploadFile(dest, file, file.name)));
  }

  /**
   * Upload files for matter.
   * @param files Files to upload.
   */
  public uploadMatterDocs(files: (File | JlpFile)[]): Observable<string[]> {
    if (!files || !files.length) {
      return of([]);
    }
    const dest: S3DestinationBucket = 'documents';
    return forkJoin(files.map(file => this.uploadFile(dest, file, file.name)));
  }

  /**
   * Upload files for chat.
   * @param file File to upload.
   */
  public uploadChatAttachment(file: File): Observable<string> {
    const dest: S3DestinationBucket = 'chats_images';
    return this.uploadFile(dest, file, file.name);
  }

  /**
   * Upload documents for attorney registration.
   * @param files Files to upload.
   * @returns File URLs.
   */
  public uploadAttorneyRegistrationAttachments(files: File[]): Observable<string[]> {
    if (!files || !files.length) {
      return of([]);
    }
    const dest: S3DestinationBucket = 'attorney_registration_attachments';
    return forkJoin(files.map(file => this.uploadFile(dest, file, file.name)));
  }

  /**
   * Upload voice consent audio file to a storage.
   * @param audio Voice consent audio blob.
   * @returns File url.
   */
  public uploadVoiceConsent(audio: Blob, name?: string): Observable<string> {
    return this.uploadFile('voice_consents', audio, name);
  }

  /**
   * Upload image of attorney social post.
   * @param image Image file.
   */
  public uploadAttorneyPostImage(image: File): Observable<string> {
    return this.uploadFile('attorney_posts', image, image.name);
  }
}

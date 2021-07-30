import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

import { MediaRecordError } from '../models/media-record-error';

/** Service for recording audio in browser. */
@Injectable({
  providedIn: 'root',
})
export class WebApiMediaRecordingService {
  private recorder: MediaRecorder;
  private readonly record$ = new Subject<Blob>();
  /**
   * Request permissions for audio.
   */
  private requestPermissionsForAudio(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }

  /** Start recording audio */
  public async startRecordingAudio(): Promise<void> {
    const stream = await this.requestPermissionsForAudio();
    const audioChunks: Blob[] = [];
    this.recorder = new MediaRecorder(stream);
    const audioType = this.recorder.mimeType;
    this.recorder.start();

    this.recorder.addEventListener('dataavailable', event => {
      audioChunks.push(event.data);
    });

    this.recorder.addEventListener('stop', () => {
      this.record$.next(new Blob(audioChunks, {
        type: audioType,
      }));
    });

  }

  /** Stop recording. */
  public stopRecordingAudio(): Promise<Blob> {
    if (this.recorder == null) {
      return Promise.reject(MediaRecordError.RecordIsNotStarted);
    }
    this.recorder.stop();
    this.recorder = null;

    return this.record$.pipe(first()).toPromise();
  }
}

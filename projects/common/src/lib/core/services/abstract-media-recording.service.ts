import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/** Abstract media recording service. */
@Injectable({
  providedIn: 'root',
})
export abstract class MediaRecordingService {
  /** Capture audio file. */
  public abstract captureAudio(): Observable<Blob>;
}

import { Injectable } from '@angular/core';
import { MediaRecordingService } from '@jl/common/core/services/abstract-media-recording.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { RecordVoiceDialogComponent } from '../components/record-voice-dialog/record-voice-dialog.component';
import { DialogsService } from '../modules/dialogs/dialogs.service';

/** Media recording service. */
@Injectable({
  providedIn: 'root',
})
export class BrowserMediaRecordingService extends MediaRecordingService {
  /**
   * @constructor
   * @param dialogsService Dialogs service.
   */
  public constructor(
    private readonly dialogsService: DialogsService,
  ) {
    super();
  }

  /** @inheritdoc */
  public captureAudio(): Observable<Blob> {
    return of(null).pipe(
      switchMap(() =>
        this.dialogsService.openDialog(
          RecordVoiceDialogComponent,
        ),
      ),
    );
  }

}

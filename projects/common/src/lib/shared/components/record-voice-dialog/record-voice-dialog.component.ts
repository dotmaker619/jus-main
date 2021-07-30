import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseRecordVoiceDialog } from '@jl/common/shared/base-components/matters/record-voice-dialog.base';

/** Record voice dialog component. */
@Component({
  selector: 'jlc-record-voice-dialog',
  templateUrl: './record-voice-dialog.component.html',
  styleUrls: ['./record-voice-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordVoiceDialogComponent extends BaseRecordVoiceDialog {
  /**
   * Handle click on close.
   */
  public onCloseClick(): void {
    this.close(this.record);
  }
}

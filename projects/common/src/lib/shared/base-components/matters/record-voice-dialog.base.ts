import { FileService } from '@jl/common/core/services/file.service';
import { WebApiMediaRecordingService } from '@jl/common/core/services/web-api-media-recording.service';
import { getFileExtension } from '@jl/common/core/utils/file-extension';
import { ReplaySubject, interval, from, EMPTY, Subject } from 'rxjs';
import { skip, takeUntil, tap, first, switchMapTo, catchError } from 'rxjs/operators';

import { AbstractDialog } from '../../modules/dialogs/abstract-dialog';

interface RecordVoiceDialogOptions {
  /** Dialog title. */
  title: string;
}

/** Recorder state. */
export enum VoiceRecorderState {
  /** Recording. */
  Recording = 'Recording',
  /** Recorded. */
  Recorded = 'Recorded',
  /** Ready. */
  ReadyForRecording = 'ReadyForRecording',
  /** Ready for recording with native tools. */
  ReadyForNativeRecording = 'ReadyForNativeRecording',
  /** Error. */
  Error = 'Error',
  /** Loading. */
  Loading = 'Loading',
  /** Permissions for recording required. */
  PermissionsForRecordRequired = 'PermissionsForRecordRequired',
}
const DIALOG_MESSAGES: Record<
  Exclude<VoiceRecorderState, VoiceRecorderState.Loading | VoiceRecorderState.Recording>
  , string> = {
  ReadyForRecording: 'Click the mic when you are ready',
  ReadyForNativeRecording: 'The native app will be opened to capture the audio',
  Recorded: 'Do you want to save a record?',
  Error: 'Sorry, the audio can not be captured from your device',
  PermissionsForRecordRequired: 'Please, provide permissions for your microphone in your browser',
};

/**
 * Base class for voice recording modal.
 */
export class BaseRecordVoiceDialog extends AbstractDialog<RecordVoiceDialogOptions, Blob | undefined> {

  /** Record. */
  protected record: Blob;
  /** Time recording. */
  public readonly seconds$ = new ReplaySubject<number>(1);
  /** Recorder state. */
  public readonly recorderState$ = new ReplaySubject<VoiceRecorderState>(1);
  /** States. */
  public readonly states = VoiceRecorderState;
  /** Dialog messages. */
  public readonly dialogMessages = DIALOG_MESSAGES;

  /**
   * @constructor
   * @param modalController
   * @param recordingService
   */
  public constructor(
    protected readonly fileService: FileService,
    private readonly recordingService: WebApiMediaRecordingService,
  ) {
    super();
    this.recorderState$.next(VoiceRecorderState.ReadyForRecording);
  }

  /** Record url. */
  public get recordUrl(): string {
    return URL.createObjectURL(this.record);
  }

  /** Toggle voice recording. */
  public async stopRecording(): Promise<void> {
    this.recorderState$.next(VoiceRecorderState.Loading);
    try {
      const record = await this.recordingService.stopRecordingAudio();
      this.record = record;
      this.recorderState$.next(VoiceRecorderState.Recorded);
    } catch (error) {
      this.recorderState$.next(VoiceRecorderState.Error);
    }
  }
  /** Toggle voice recording. */
  public startRecording(): void {
    this.recorderState$.next(VoiceRecorderState.Loading);

    const recorderStateChanged$ = this.recorderState$.pipe(
      skip(1), // Emit last cached value.
      first(),
    );

    // Show the length of record.
    const timeUpdate$ = interval(1000).pipe(
      takeUntil(recorderStateChanged$),
      tap(second => this.seconds$.next(second)),
    );

    from(
      this.recordingService.startRecordingAudio(),
    ).pipe(
      tap(() => this.recorderState$.next(VoiceRecorderState.Recording)),
      switchMapTo(timeUpdate$),
      catchError(() => {
        this.recorderState$.next(VoiceRecorderState.PermissionsForRecordRequired);
        return EMPTY;
      }),
    ).subscribe();
  }

  /** Clear current record. */
  public clearRecord(): void {
    this.record = null;
    this.seconds$.next(null);
    this.recorderState$.next(VoiceRecorderState.ReadyForRecording);
  }

  /** Handle click on save button. */
  public downloadRecord(): void {
    const fileName = `record.${getFileExtension(this.record)}`;
    this.fileService.downloadFile(this.record, fileName);
  }
}

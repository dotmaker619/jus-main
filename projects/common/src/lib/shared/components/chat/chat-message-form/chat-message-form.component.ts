import { Component, ChangeDetectionStrategy, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/**
 * Chat send message form.
 */
@Component({
  selector: 'jlc-chat-message-form',
  templateUrl: './chat-message-form.component.html',
  styleUrls: ['./chat-message-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageFormComponent {
  /** Is form disabled and spinner is displayed. */
  @Input()
  public loading = false;
  /**
   * Emit sending message.
   */
  @Output()
  public formSubmit = new EventEmitter<string>();

  /**
   * Emit files to upload.
   */
  @Output()
  public fileAttach = new EventEmitter<File[]>();

  /**
   * Message input element ref.
   */
  @ViewChild('messageInput', { static: true })
  public messageInputRef: ElementRef<HTMLInputElement>;

  /**
   * @constructor
   * @param formBuilder Form builder service.
   */
  public constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      message: ['', Validators.required],
    });
  }

  /**
   * Form control.
   */
  public form: FormGroup;

  /**
   * On form submitted.
   */
  public onFormSubmitted(form: FormGroup): void {
    // Return focus to the input to prevent close Keyboard.
    this.messageInputRef.nativeElement.focus();
    form.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    this.formSubmit.emit(form.value.message);
    this.form.reset();
  }

  /**
   * Emit files that we want to upload.
   */
  public onAttachedFileChange(fileList: FileList): void {
    const files = Array.from(fileList);
    this.fileAttach.next(files);
  }
}

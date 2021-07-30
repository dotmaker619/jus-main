import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Matter, Client } from '@jl/common/core/models';
import { Attorney } from '@jl/common/core/models/attorney';
import { MatterPost } from '@jl/common/core/models/matter-post';
import { Role } from '@jl/common/core/models/role';
import { MatterPostService } from '@jl/common/core/services/attorney/matter-post.service';
import { MatterTopicService } from '@jl/common/core/services/attorney/matter-topic.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, finalize, switchMap, first } from 'rxjs/operators';

/**
 * Modal to create new message for mobile workspace.
 */
@Component({
  selector: 'jlc-new-message-modal',
  templateUrl: './new-message-modal.component.html',
  styleUrls: ['./new-message-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewMessageModalComponent {
  /**
   * Matter object.
   */
  @Input()
  public matter: Matter;
  /**
   * Matter topic form.
   */
  public readonly matterTopicForm$: Observable<FormGroup>;
  /**
   * Recipient.
   */
  public readonly recipient$: Observable<Attorney | Client>;
  /**
   * Is loading.
   */
  public readonly isLoading$ = new BehaviorSubject(false);

  /**
   * @constructor
   *
   * @param matterTopicService Matter topic service.
   * @param matterPostService Matter post service.
   * @param authService Auth service.
   * @param modalCtrl Modal controller.
   * @param fb Form builder.
   */
  public constructor(
    private readonly matterTopicService: MatterTopicService,
    private readonly matterPostService: MatterPostService,
    private readonly authService: AuthService,
    private readonly modalCtrl: ModalController,
    private readonly fb: FormBuilder,
  ) {
    this.matterTopicForm$ = this.initFormStream();
    this.recipient$ = this.initRecipientStream();
  }

  /**
   * On form submitted.
   */
  public onFormSubmitted(form: FormGroup): void {
    form.markAllAsTouched();

    if (form.invalid) {
      return;
    }
    this.isLoading$.next(true);

    this.createMatterTopicAndMatterPost(form)
      .pipe(
        first(),
        finalize(() => this.isLoading$.next(false)),
      )
      .subscribe(() => this.close());
  }

  /**
   * On cancel click.
   */
  public onCancelClick(): void {
    this.close();
  }

  private close(): void {
    this.modalCtrl.dismiss();
  }

  private initFormStream(): Observable<FormGroup> {
    return of(this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      message: ['', [Validators.required]],
    }));
  }

  private initRecipientStream(): Observable<Client | Attorney> {
    return this.authService.userType$
      .pipe(
        first(),
        map(role => this.getRecipient(role)),
      );
  }

  private createMatterTopicAndMatterPost(form: FormGroup): Observable<MatterPost> {
    const { title, message } = form.value;

    return this.matterTopicService.createMatterTopic(this.matter.id, title)
      .pipe(
        first(),
        switchMap(matterTopic =>
          this.matterPostService.createMatterPost(matterTopic.id, message),
        ),
      );
  }

  private getRecipient(role: Role): Client | Attorney {
    if (role === Role.Attorney) {
      return this.matter.client;
    } else if (role === Role.Client) {
      return this.matter.attorney;
    } else {
      throw Error(`Can not get recipient for user with role: ${role}`);
    }
  }
}

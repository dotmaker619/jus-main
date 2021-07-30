import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Client } from '@jl/common/core/models';
import { Attorney } from '@jl/common/core/models/attorney';
import { Matter } from '@jl/common/core/models/matter';
import { MatterPost } from '@jl/common/core/models/matter-post';
import { Role } from '@jl/common/core/models/role';
import { MatterPostService } from '@jl/common/core/services/attorney/matter-post.service';
import { MatterTopicService } from '@jl/common/core/services/attorney/matter-topic.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { AbstractDialog } from '@jl/common/shared';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, finalize, map } from 'rxjs/operators';

interface MatterTopicDialogOptions {
  /** Matter */
  matter: Matter;
}

/** Matter topic dialog result */
export enum MatterTopicDialogResult {
  /** Nothing happened */
  None,
  /** Post created successfully */
  Success,
}

/** Matter topic dialog component. */
@Component({
  selector: 'jlc-matter-topic-dialog',
  templateUrl: './matter-topic-dialog.component.html',
  styleUrls: ['./matter-topic-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatterTopicDialogComponent extends AbstractDialog<MatterTopicDialogOptions, MatterTopicDialogResult> {
  /** Matter topic form */
  public readonly matterTopicForm: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    message: new FormControl('', [Validators.required]),
  });

  /** Recipient */
  public readonly recipient$ = this.authService.userType$.pipe(map(role => this.getRecipient(role)));
  /** Is loading */
  public readonly isLoading$: Observable<boolean>;

  private readonly isLoading = new BehaviorSubject(false);

  /** @constructor */
  public constructor(
    private matterTopicService: MatterTopicService,
    private matterPostService: MatterPostService,
    private authService: AuthService,
  ) {
    super();

    this.isLoading$ = this.isLoading.asObservable();
  }

  /** On send click */
  public onSendClick(): void {
    this.matterTopicForm.markAllAsTouched();

    if (this.matterTopicForm.valid) {
      this.isLoading.next(true);

      this.createMatterTopicAndMatterPost()
        .pipe(finalize(() => this.isLoading.next(false)))
        .subscribe(() => this.close(MatterTopicDialogResult.Success));
    }
  }

  /** On cancel click */
  public onCancelClick(): void {
    this.close(MatterTopicDialogResult.None);
  }

  private createMatterTopicAndMatterPost(): Observable<MatterPost> {
    const { title, message } = this.matterTopicForm.value;

    return this.matterTopicService.createMatterTopic(this.options.matter.id, title)
      .pipe(
        switchMap(matterTopic =>
          this.matterPostService.createMatterPost(matterTopic.id, message),
        ),
      );
  }

  private getRecipient(role: Role): Client | Attorney {
    if (role === Role.Attorney) {
      return this.options.matter.client;
    } else if (role === Role.Client) {
      return this.options.matter.attorney;
    } else {
      throw Error(`Can not get recipient for user with role: ${role}`);
    }
  }
}

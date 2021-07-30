import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SocialPost } from '@jl/common/core/models/social-post';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { FileStorageService } from '@jl/common/core/services/file-storage.service';
import { SocialService } from '@jl/common/core/services/social.service';
import { AbstractDialog, DialogsService } from '@jl/common/shared';
import { Observable, merge, of, NEVER, BehaviorSubject, from, ReplaySubject } from 'rxjs';
import { tap, switchMapTo, switchMap, filter, first, map, startWith } from 'rxjs/operators';

/**
 * Create/edit social post component.
 */
@Component({
  selector: 'jlat-save-post',
  templateUrl: './save-post.component.html',
  styleUrls: ['./save-post.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavePostComponent extends AbstractDialog<SocialPost, boolean> implements OnInit {
  /** Post form. */
  public readonly socialPostForm$: Observable<FormGroup>;
  /** Loading controller. */
  public readonly isLoading$ = new BehaviorSubject(false);
  /** Whether creation process or edit. */
  public readonly isEdit$: Observable<boolean>;

  private readonly init$ = new ReplaySubject<void>(1);

  /**
   * @constructor
   *
   * @param fb Form builder.
   * @param socialService Social service.
   * @param fileStorageService File storage service.
   * @param dialogsService Dialogs service.
   */
  public constructor(
    private readonly fb: FormBuilder,
    private readonly socialService: SocialService,
    private readonly fileStorageService: FileStorageService,
    private readonly dialogsService: DialogsService,
  ) {
    super();
    this.socialPostForm$ = this.initFormStream();
    this.isEdit$ = this.init$.pipe(
      map(() => !!this.options),
      startWith(false),
    );
  }

  /** Close dialog. */
  public onCloseClicked(): void {
    this.dialogsService.showConfirmationDialog({
      cancelButtonText: 'Go Back',
      confirmationButtonText: 'Discard',
      confirmationButtonClass: 'danger',
      title: 'Discard Post?',
      message: 'You haven’t finished your post yet. Are you sure you want to leave and discard your draft?',
    }).then((val) => val && this.close());
  }

  /**@inheritdoc */
  public ngOnInit(): void {
    this.init$.next();
  }

  /**
   * Handle 'submit' of post form.
   *
   * @param form Social post form.
   */
  public onFormSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid) {
      return;
    }

    const uploadImage$ = this.socialService.prepareImageForPost(form.value.image);

    from(this.dialogsService.showConfirmationDialog({
      cancelButtonText: 'Cancel',
      confirmationButtonText: 'Publish',
      title: 'Publish post?',
      message: 'Are you sure you want to publish the post?',
    })).pipe(
      filter((val) => val),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(uploadImage$),
      switchMap((imgUrl) => this.socialService.savePost(new SocialPost({
        id: this.options && this.options.id || null,
        body: form.value.body,
        preview: form.value.preview,
        title: form.value.title,
        image: imgUrl,
      }))),
      switchMap(() => this.showSuccessModal()),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe(() => this.close(true));
  }

  private showSuccessModal(): Promise<void> {
    return this.dialogsService.showSuccessDialog({
      title: 'Success',
      message: 'Post has been created successfully',
    });
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.fb.group({
      image: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      preview: ['', [Validators.required, Validators.maxLength(150)]],
      body: ['', [Validators.required]],
    });

    const fillForm$ = this.init$.pipe(
      first(),
      filter(() => !!this.options),
      tap(() => {
        form.patchValue({
          image: this.options.image,
          title: this.options.title,
          preview: this.options.preview,
          body: this.options.body,
        });
      }),
      switchMapTo(NEVER),
    );

    return merge(of(form), fillForm$);
  }
}

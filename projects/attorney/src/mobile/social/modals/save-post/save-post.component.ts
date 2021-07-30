import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { SocialPost } from '@jl/common/core/models/social-post';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { FileStorageService } from '@jl/common/core/services/file-storage.service';
import { SocialService } from '@jl/common/core/services/social.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, merge, of, NEVER, BehaviorSubject, ReplaySubject } from 'rxjs';
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
export class SavePostComponent implements OnInit {
  /** Social post. */
  @Input()
  public readonly post: SocialPost;
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
   * @param modalCtrl Modal controller.
   * @param socialService Social service.
   * @param fileStorageService File storage service.
   * @param alertService Alert service.
   */
  public constructor(
    private readonly fb: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly socialService: SocialService,
    private readonly fileStorageService: FileStorageService,
    private readonly alertService: AlertService,
  ) {
    this.socialPostForm$ = this.initFormStream();
    this.isEdit$ = this.init$.pipe(
      map(() => !!this.post),
      startWith(false),
    );
  }

  /** Close dialog. */
  public onCancelClick(): void {
    this.alertService.showConfirmation({
      buttonText: 'Discard',
      cancelButtonText: 'Go Back',
      header: 'Discard Post?',
      isDangerous: true,
      message: 'You haven’t finished your post yet. Are you sure you want to leave and discard your draft?',
    }).pipe(
      first(),
      filter(val => val),
    ).subscribe(() => this.close());
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

    this.alertService.showConfirmation({
      cancelButtonText: 'Cancel',
      buttonText: 'Publish',
      header: 'Publish post?',
      message: 'Are you sure you want to publish the post?',
    }).pipe(
      filter((val) => val),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(uploadImage$),
      switchMap((imgUrl) => this.socialService.savePost(new SocialPost({
        id: this.post && this.post.id || null,
        body: form.value.body,
        preview: form.value.preview,
        title: form.value.title,
        image: imgUrl,
      }))),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe(() => this.close(true));
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
      filter(() => !!this.post),
      tap(() => {
        form.patchValue({
          image: this.post.image,
          title: this.post.title,
          preview: this.post.preview,
          body: this.post.body,
        });
      }),
      switchMapTo(NEVER),
    );

    return merge(of(form), fillForm$);
  }

  private close(isUpdated: boolean = false): void {
    this.modalCtrl.dismiss(isUpdated);
  }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ForumCategory, Topic } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { catchValidationError } from '@jl/common/core/rxjs';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { ForumService } from '@jl/common/core/services/forum.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, BehaviorSubject, of, Subject, NEVER, EMPTY } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

/** Create topic page. */
@Component({
  selector: 'jlc-create-topic-page',
  templateUrl: './create-topic-page.component.html',
  styleUrls: ['./create-topic-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTopicPageComponent {
  /** Forum categories. */
  public readonly categories$: Observable<ForumCategory[]>;

  /** Form. */
  public readonly form$: Observable<FormGroup>;

  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Validation error. */
  public readonly validationError$ = new Subject<TEntityValidationErrors<Topic>>();

  /**
   * @constructor
   * @param formBuidler Form builder.
   * @param forumService Forum service.
   * @param topicsService Topics service.
   * @param router Router.
   * @param alertService Alert service.
   */
  public constructor(
    private readonly formBuidler: FormBuilder,
    private readonly forumService: ForumService,
    private readonly topicsService: TopicsService,
    private readonly router: Router,
    private readonly alertService: AlertService,
  ) {
    this.categories$ = this.initCategoriesStream();
    this.form$ = this.initFormStream();
  }

  /** Handle form submit. */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }

    this.isLoading$.next(true);
    this.topicsService.createTopic(
      new Topic({
        category: form.value.category.id,
        message: form.value.message,
        title: form.value.title,
      }),
    ).pipe(
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchValidationError(error => {
        this.validationError$.next(error.validationData);
        return EMPTY;
      }),
      first(),
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Topic Created',
      })),
    ).subscribe(() => this.router.navigate(['..']));
  }

  private initCategoriesStream(): Observable<ForumCategory[]> {
    return this.forumService.getForumCategories({});
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuidler.group({
      title: [null, Validators.required],
      category: [null, Validators.required],
      message: [null, Validators.required],
    });

    return of(form);
  }
}

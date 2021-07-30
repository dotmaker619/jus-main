import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectOption, Topic } from '@jl/common/core/models';
import {
  ApiValidationError,
  TEntityValidationErrors,
} from '@jl/common/core/models/api-error';
import { catchValidationError } from '@jl/common/core/rxjs';
import { ForumService } from '@jl/common/core/services/forum.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { triggerValidation } from '@jl/common/core/utils/form-trigger';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

/** Component with topic creation form. */
@Component({
  selector: 'jlc-create-topic',
  templateUrl: './create-topic.component.html',
  styleUrls: ['./create-topic.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTopicComponent {
  /** Selected category. */
  @Input()
  set categoryId(value: number) {
    this.form.controls.legalCategory.setValue(value);
  }
  /** Main form. */
  public form: FormGroup = new FormGroup({
    topicTitle: new FormControl(null, [Validators.required]),
    message: new FormControl(null, [Validators.required]),
    legalCategory: new FormControl(this.categoryId, [Validators.required]),
  });

  /** Legal categories. */
  public forumCategories$: Observable<SelectOption[]>;
  /** Validation error */
  public validationError$ = new BehaviorSubject<TEntityValidationErrors<Topic>>(null);

  /**
   * @constructor
   * @param forumService
   * @param popupService
   * @param topicsService
   * @param router
   */
  public constructor(
    private forumService: ForumService,
    private topicsService: TopicsService,
    private router: Router,
  ) {
    this.forumCategories$ = this.forumService.getForumCategories({}).pipe(
      map(categories =>
        categories.map(category => ({
          label: category.title,
          value: category.id,
        })),
      ),
    );
  }

  /**
   * Create new topic.
   */
  public onSubmit(): void {
    this.form.markAllAsTouched();
    triggerValidation(this.form);
    const data = this.form.value;
    const topic = new Topic({
      title: data.topicTitle,
      category: data.legalCategory,
      message: data.message,
    });
    this.topicsService.createTopic(topic)
      .pipe(
        take(1),
        catchValidationError((error: ApiValidationError<Topic>) => {
          const { validationData } = error;
          this.validationError$.next(validationData);
          return EMPTY;
        }),
        map(newTopic => newTopic.id),
      )
      .subscribe(
        newTopicId => this.router.navigate(['/forum/topic/', newTopicId]),
      );
  }

  /** Track by value function. */
  public trackByValue(_: number, opt: SelectOption): string | number {
    return opt.value;
  }
}

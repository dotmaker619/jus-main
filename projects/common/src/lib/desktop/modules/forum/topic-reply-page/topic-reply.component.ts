import { Location } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumCategory, Post, Topic, Link } from '@jl/common/core/models';
import { ForumService } from '@jl/common/core/services/forum.service';
import { PostService } from '@jl/common/core/services/post.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { DialogsService } from '@jl/common/shared';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';

/** Topic reply page. */
@Component({
  selector: 'jlc-topic-reply',
  templateUrl: './topic-reply.component.html',
  styleUrls: ['./topic-reply.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicReplyComponent implements OnInit {
  /** Reply form. */
  public replyForm = new FormGroup({
    message: new FormControl(null, [Validators.required]),
  });

  /** Id of the topic. */
  public currentTopicId: number;
  /** Id of the post to edit if passed. */
  public currentPostId: number;
  /** Current topic. */
  public currentTopic$: Observable<Topic>;

  /** Current category. */
  public currentCategory$: Observable<ForumCategory>;

  /** List of breadcrumb links. */
  public breadcrumbs$: Observable<Link<string[]>[]>;

  /**
   * @constructor
   * @param activatedRoute
   * @param router
   * @param location
   * @param postService
   * @param topicService
   * @param forumService
   * @param dialogsService
   */
  public constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private postService: PostService,
    private topicService: TopicsService,
    private forumService: ForumService,
    private dialogsService: DialogsService,
  ) { }

  /**
   * Send new post on form submit.
   */
  public onSubmit(): void {
    const data = new Post({
      topicId: this.currentTopicId,
      text: this.replyForm.value['message'],
    });

    if (this.currentPostId) {
      this.postService
        .updatePostById(this.currentPostId, data)
        .pipe(
          take(1),
        )
        .subscribe(post =>
          this.router.navigate(['../../', post.position], { relativeTo: this.activatedRoute }),
        );
    } else {
      this.postService
        .publishPost(data)
        .pipe(
          take(1),
        )
        .subscribe(post =>
          this.router.navigate(['../', post.position], { relativeTo: this.activatedRoute }),
        );
    }
  }

  /**
   * Ask user if he want's to leave this page.
   */
  public onCancel(): void {
    this.dialogsService.showConfirmationDialog({
      title: 'Do you want to leave this page?',
      message: 'If you leave this pages, changes will not be saved.',
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.location.back();
    });
  }
  /**
   * @inheritDoc
   */
  public ngOnInit(): void {
    this.currentTopicId = parseInt(this.activatedRoute.snapshot.paramMap.get('topicId'), 10);
    this.currentPostId = parseInt(this.activatedRoute.snapshot.paramMap.get('postId'), 10);
    if (this.currentPostId) {
      this.postService.getPostById(this.currentPostId).subscribe(post => {
        this.replyForm.setValue({ message: post.text });
      });
    }

    this.currentTopic$ = this.topicService.getTopicById(this.currentTopicId);
    this.currentCategory$ = this.currentTopic$.pipe(
      switchMap(topic => this.forumService.getCategoryById(topic.category)),
    );
    this.breadcrumbs$ = combineLatest([
      this.currentCategory$,
      this.currentTopic$,
    ]).pipe(
      map(([category, topic]) => [
        { label: 'Jus-Law Forums', link: ['/forum'] },
        { label: category.title, link: ['/forum', 'category', category.id.toString()] },
        { label: topic.title, link: ['/forum', 'topic', topic.id.toString()] },
        {
          label: `Post ${this.currentPostId}`,
          link: ['/forum', 'topic', topic.id.toString(), 'edit', this.currentPostId.toString()],
        },
      ]),
    );
  }
}

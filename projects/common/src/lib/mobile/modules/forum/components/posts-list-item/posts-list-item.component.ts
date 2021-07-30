import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Post } from '@jl/common/core/models';
import { Role } from '@jl/common/core/models/role';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { Observable, combineLatest, ReplaySubject } from 'rxjs';
import { map, first, tap } from 'rxjs/operators';

const CAN_SEND_MESSAGES_ROLES = [
  Role.Attorney, Role.Client,
];

/** Post item component. */
@Component({
  selector: 'jlc-posts-list-item',
  templateUrl: './posts-list-item.component.html',
  styleUrls: ['./posts-list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsListItemComponent {
  /** Post. */
  @Input()
  public set post(p: Post) {
    this.post$.next(p);
  }

  /** Post options click emitter. */
  @Output()
  public readonly postClick = new EventEmitter<Post>();

  /** Post. */
  public readonly post$ = new ReplaySubject<Post>(1);

  /** Can user send message to the author of the post. */
  public readonly canSendMessage$: Observable<boolean>;

  /** Can user edit post. */
  public readonly canEditPost$: Observable<boolean>;

  /** Is user attorney. */
  public readonly isAttorney$: Observable<boolean>;

  /**
   * @constructor
   *
   * @param navCtrl Nav Controller.
   * @param userService User service.
   */
  public constructor(
    private readonly navCtrl: NavController,
    private readonly userService: CurrentUserService,
  ) {
    const postData$ = combineLatest([
      this.userService.currentUser$,
      this.post$,
    ]);

    this.canSendMessage$ = postData$.pipe(
      map(([user, post]) =>
        user && user.role !== post.userType && CAN_SEND_MESSAGES_ROLES.includes(user.role),
      ),
    );

    this.canEditPost$ = postData$.pipe(
      map(([user, post]) => user && user.id === post.author.id),
    );

    this.isAttorney$ = this.userService.currentUser$.pipe(
      map((user) => user.role === Role.Attorney),
    );
  }

  /**
   * Handle click on post options.
   * @param post Post.
   */
  public onPostOptionsClick(post: Post): void {
    this.postClick.emit(post);
  }

  /**
   * Handle 'click' of 'Chat' button.
   * @param post Post
   */
  public onChatClick(post: Post): void {
    this.isAttorney$.pipe(
      first(),
      tap((isAttorney) => {
        if (isAttorney) {
          this.navCtrl.navigateRoot(['/leads/active'], {
            queryParams: {
              clientId: post.author.id,
              topicId: post.topicId,
            },
          });
        } else {
          this.navCtrl.navigateRoot(['/chats'], {
            queryParams: {
              attorneyId: post.author.id,
              topicId: post.topicId,
            },
          });
        }
      }),
    ).subscribe();
  }

  /**
   * Obtain profile link from the post info.
   * @param post Post.
   */
  public getProfileLink(post: Post): string[] {
    return post.userType === Role.Attorney ?
      ['/attorneys', 'profile', post.author.id.toString()] : [];
  }
}

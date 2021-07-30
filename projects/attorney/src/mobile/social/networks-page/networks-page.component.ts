import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NetworkChatInfo } from '@jl/common/core/models/network-chat-info';
import { NetworkChatService } from '@jl/common/core/services/chats/network-chat.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable, Subject, combineLatest, ReplaySubject } from 'rxjs';
import { shareReplay, startWith, switchMap, debounceTime } from 'rxjs/operators';

/** Networks page. */
@Component({
  selector: 'jlat-networks-page',
  templateUrl: './networks-page.component.html',
  styleUrls: ['./networks-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworksPageComponent {
  /** Group chats. */
  public readonly chats$: Observable<NetworkChatInfo[]>;
  /** Trackby function. */
  public readonly trackById = trackById;

  private readonly update$ = new ReplaySubject<void>(1);
  private readonly searchQueryChange$ = new Subject<string>();

  /**
   * @constructor
   * @param groupChatsService Group chats service.
   */
  public constructor(
    private readonly networkChatService: NetworkChatService,
  ) {
    this.chats$ = this.initChatsStream();
  }

  /** Update chats on view enter. */
  public ionViewDidEnter(): void {
    this.update$.next();
  }

  /**
   * Handle search query change.
   * @param query Search query.
   */
  public onSearchQueryChange(query: string): void {
    this.searchQueryChange$.next(query);
  }

  private initChatsStream(): Observable<NetworkChatInfo[]> {
    return combineLatest([
      this.searchQueryChange$.pipe(startWith('')),
      this.update$,
    ]).pipe(
      debounceTime(300),
      switchMap(([query]) => this.networkChatService.getCurrentChats(query)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}

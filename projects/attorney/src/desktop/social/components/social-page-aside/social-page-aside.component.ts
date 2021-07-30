import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NetworkChatInfo } from '@jl/common/core/models/network-chat-info';
import { NetworkChatService } from '@jl/common/core/services/chats/network-chat.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { DialogsService } from '@jl/common/shared';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, debounceTime, startWith, switchMap, tap, shareReplay, withLatestFrom } from 'rxjs/operators';

import { CreateNetworkDialogComponent } from '../../dialogs/create-network-dialog/create-network-dialog.component';

/** Social page visual state. */
enum SocialPageAsideState {
  /** Loading chats. */
  Loading = 'Loading',
  /** Searching chats. */
  Searching = 'Searching',
  /** Not found any chats with query. */
  NotFound = 'NotFound',
  /** Found chats. */
  Found = 'Found',
  /** No chats at all. */
  NoChats = 'NoChats',
}

/** Aside menu on attorney's social page. */
@Component({
  selector: 'jlat-social-page-aside',
  templateUrl: './social-page-aside.component.html',
  styleUrls: ['./social-page-aside.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialPageAsideComponent {

  /** Aside visual state. */
  public readonly asideState$: Observable<SocialPageAsideState>;
  /** Network chats. */
  public readonly chats$: Observable<NetworkChatInfo[]>;
  /** Options for aside state */
  public readonly asideStates = SocialPageAsideState;
  /** Trackby function. */
  public readonly trackById = trackById;
  /** Search query. */
  public readonly networkQueryChange$ = new BehaviorSubject<string>(void 0);

  /**
   * @constructor
   * @param networkChatService
   * @param dialogsService
   */
  public constructor(
    private readonly networkChatService: NetworkChatService,
    private readonly dialogService: DialogsService,
  ) {

    this.chats$ = this.initChatsStream();
    this.asideState$ = this.initAsideStateStream();
  }

  private initAsideStateStream(): Observable<SocialPageAsideState> {
    const state = SocialPageAsideState;

    return this.chats$.pipe(
      withLatestFrom(this.networkQueryChange$),
      map(([chats, query]) => {

        if (query == null) {
          // On initialization

          if (chats == null) {
            return state.Loading;
          }
          if (chats.length === 0) {
            return state.NoChats;
          }
        } else {
          if (chats == null) {
            return state.Searching;
          }
          // On query change
          if (chats.length === 0) {
            return state.NotFound;
          }
        }

        return state.Found;
      }),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initChatsStream(): Observable<NetworkChatInfo[]> {
    return this.networkQueryChange$.pipe(
      debounceTime(300),
      startWith(null),
      switchMap(query => this.networkChatService.getCurrentChats(query).pipe(startWith(null))),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /**
   * Handle search query change.
   * @param query Search query.
   */
  public onNetworksSearchChange(query: string): void {
    this.networkQueryChange$.next(query);
  }

  /** Open modal to create network */
  public onCreateNetworkClick(): void {
    this.dialogService.openDialog(
      CreateNetworkDialogComponent,
    );
  }
}

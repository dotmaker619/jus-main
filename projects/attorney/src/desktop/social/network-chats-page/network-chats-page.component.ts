import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Network } from '@jl/common/core/models/network';
import { NetworkChatInfo } from '@jl/common/core/models/network-chat-info';
import { NetworkInvitation } from '@jl/common/core/models/network-invitation';
import { NetworkChatService } from '@jl/common/core/services/chats/network-chat.service';
import { NetworksService } from '@jl/common/core/services/networks.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { DialogsService } from '@jl/common/shared';
import { BaseNetworkChatPage } from '@jl/common/shared/base-components/social/network-chat.base';
import { Observable, Subject, combineLatest, of, EMPTY } from 'rxjs';
import { switchMap, startWith, shareReplay, map, filter, take, first } from 'rxjs/operators';

import { CreateNetworkDialogComponent } from '../dialogs/create-network-dialog/create-network-dialog.component';
import { InviteToNetworkDialogComponent } from '../dialogs/invite-to-network-dialog/invite-to-network-dialog.component';
import { NetworkInfoDialogComponent } from '../dialogs/network-info-dialog/network-info-dialog.component';

/** Network chats page. */
@Component({
  selector: 'jlat-network-chats-page',
  templateUrl: './network-chats-page.component.html',
  styleUrls: ['./network-chats-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkChatsPageComponent extends BaseNetworkChatPage {

  /** Chats. */
  public readonly chats$: Observable<NetworkChatInfo[]>;
  /** Selected chat. */
  public readonly selectedChat$: Observable<NetworkChatInfo>;
  /** Should present chat placeholder. */
  public readonly shouldPresentPlaceholder$: Observable<boolean>;

  /** Trackby function. */
  public readonly trackById = trackById;
  /** Search query. */
  public readonly queryChange$ = new Subject<string>();
  private readonly updateNetworks$ = new Subject<void>();

  /**
   * @constructor
   * @param activatedRoute
   * @param networksService
   * @param networkChatService
   * @param dialogService
   */
  public constructor(
    activatedRoute: ActivatedRoute,
    networksService: NetworksService,
    protected readonly networkChatService: NetworkChatService,
    private readonly dialogService: DialogsService,
  ) {
    super(networksService, networkChatService);

    const networkId$ = activatedRoute.paramMap.pipe(
      map(params => parseInt(params.get('id'), 10)),
      filter(id => !isNaN(id)),
    );
    this.chats$ = this.initChatsStream();
    this.selectedChat$ = this.initSelectedChatStream(networkId$);
    this.shouldPresentPlaceholder$ = this.initPlaceholderStream();
  }

  // Override parent methods

  /** @inheritdoc */
  public viewNetworkInfo(network: Network): void {
    this.dialogService.openDialog(NetworkInfoDialogComponent, network);
  }

  /**
   * Leave current network
   *
   * @param network Current network.
   */
  public leaveCurrentNetwork(network: Network): void {
    this.leaveNetwork(network)
      .pipe(take(1))
      .subscribe();
  }

  /** @inheritdoc */
  protected requestNewNetworkName(label: string, header: string, message?: string): Observable<string> {
    return this.selectedChat$.pipe(
      first(),
      switchMap((chat) => this.dialogService.showInputDialog({
        title: header,
        inputLabelText: label,
        confirmButtonText: 'Save',
        message: message,
        value: chat.network.title,
      })),
      switchMap((val) => val == null ? EMPTY : of(val)),
    );
  }

  /** @inheritdoc */
  protected askToLeaveNetwork(message: string, header: string): Observable<boolean> {
    return of(null).pipe(
      switchMap(() => this.dialogService.showConfirmationDialog({
        confirmationButtonClass: 'danger',
        confirmationButtonText: 'Leave',
        message,
        title: header,
      })),
    );
  }

  /** @inheritdoc */
  protected createNetworkInvitation(): Observable<NetworkInvitation> {
    return this.selectedChat$.pipe(
      first(),
      switchMap(({ network }) =>
        this.dialogService.openDialog(InviteToNetworkDialogComponent, { network })),
      take(1),
    );
  }

  /** Handle search query change. */
  public onSearchQueryChange(query: string): void {
    this.queryChange$.next(query);
  }

  /**
   * Trackby function for chat.
   * @param _ Idx.
   * @param chat Chat info.
   */
  public trackChat(_: number, chat: NetworkChatInfo): string {
    // Using all the info that might be updated
    return `${chat.id}${chat.lastMessageText}${chat.network.title}`;
  }

  /**
   * Call a modal to create a new network.
   */
  public async onNewNetworkClick(): Promise<void> {
    await this.dialogService.openDialog(CreateNetworkDialogComponent);
    this.updateNetworks$.next();
  }

  private initChatsStream(): Observable<NetworkChatInfo[]> {
    return combineLatest([
      this.queryChange$.pipe(startWith(null)),
      this.updateNetworks$.pipe(startWith(null)),
    ]).pipe(
      switchMap(([query]) => this.networkChatService.getCurrentChats(query)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initSelectedChatStream(networkId$: Observable<number>): Observable<NetworkChatInfo> {
    return combineLatest([
      networkId$,
      this.chats$,
    ]).pipe(
      map(([id, chats]) => chats.find(chat => chat.network.id === id)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initPlaceholderStream(): Observable<boolean> {
    return combineLatest([
      this.queryChange$.pipe(startWith(null)),
      this.chats$,
    ]).pipe(
      map(([query, chats]) => query == null && chats.length === 0),
    );
  }
}

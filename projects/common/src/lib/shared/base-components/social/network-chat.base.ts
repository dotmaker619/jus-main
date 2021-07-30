import { Network } from '@jl/common/core/models/network';
import { NetworkChatInfo } from '@jl/common/core/models/network-chat-info';
import { NetworkInvitation } from '@jl/common/core/models/network-invitation';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { NetworkChatService } from '@jl/common/core/services/chats/network-chat.service';
import { NetworksService } from '@jl/common/core/services/networks.service';
import { Observable, EMPTY, BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';

/** Base class for network-chat page. */
export abstract class BaseNetworkChatPage {

  /** Loading emitter. */
  public readonly isLoading$ = new BehaviorSubject(false);
  /** Emit when network should be updated */
  protected readonly updateNetwork$ = new ReplaySubject<void>(1);

  /**
   * @constructor
   * @param networkService Networks service.
   * @param networkChatsService Network chats service.
   */
  public constructor(
    protected readonly networkService: NetworksService,
    protected readonly networkChatsService: NetworkChatService,
  ) { }

  /** View network info. */
  public abstract viewNetworkInfo(network: Network): void;

  /**
   * Calls a dialog to input new network name.
   * @param label Label string.
   * @param header Header string.
   * @param message Dialog message.
   */
  protected abstract requestNewNetworkName(label: string, header: string, message?: string): Observable<string>;

  /**
   * Show a confirm to leave the network.
   * @param message Message.
   * @param header Header.
   */
  protected abstract askToLeaveNetwork(message: string, header: string): Observable<boolean>;

  /**
   * Calls a modal window to select whom to invite to a network.
   */
  protected abstract createNetworkInvitation(): Observable<NetworkInvitation>;

  /**
   * Calls a dialog to edit network name.
   * @param network Network to edit.
   */
  public editNetworkName(network: NetworkChatInfo): void {

    let requestAfterInvalidValue$ = this.requestNewNetworkName(
      'Network Name',
      'Edit Network Name',
      'Name can\'t be blank, choose another name',
    );

    requestAfterInvalidValue$ = requestAfterInvalidValue$.pipe(
      switchMap((val) => val === '' ? requestAfterInvalidValue$ : of(val)),
    );

    this.requestNewNetworkName(
      'Network Name',
      'Edit Network Name',
    ).pipe(
      switchMap(newTitle => newTitle === '' ? requestAfterInvalidValue$ : of(newTitle)),
      switchMap(newTitle => {
        this.isLoading$.next(true);
        return this.networkChatsService.updateNetworkNameWithAnnounce(network, newTitle).pipe(first());
      }),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe(() => this.updateNetwork$.next());
  }

  /**
   * Leave the network.
   * @param network Network.
   */
  public leaveNetwork(network: Network): Observable<void> {
    return this.askToLeaveNetwork(
      'Are you sure you want to leave this network?',
      'Leave Network?',
    ).pipe(
      switchMap(shouldLeave => {
        if (!shouldLeave) {
          return EMPTY;
        }
        this.isLoading$.next(true);
        return this.networkService.leaveNetwork(network).pipe(first());
      }),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    );
  }

  /**
   * Invite more people to a network.
   * @param network Network to invite people in.
   */
  public invitePeopleToNetwork(network: Network): void {
    this.createNetworkInvitation().pipe(
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe();
  }
}

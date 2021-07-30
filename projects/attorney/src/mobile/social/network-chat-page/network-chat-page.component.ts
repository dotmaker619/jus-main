import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, ModalController, AlertController, NavController } from '@ionic/angular';
import { Network } from '@jl/common/core/models/network';
import { NetworkChatInfo } from '@jl/common/core/models/network-chat-info';
import { NetworkInvitation } from '@jl/common/core/models/network-invitation';
import { NetworkChatService } from '@jl/common/core/services/chats/network-chat.service';
import { NetworksService } from '@jl/common/core/services/networks.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { BaseNetworkChatPage } from '@jl/common/shared/base-components/social/network-chat.base';
import { Observable, BehaviorSubject, of, EMPTY } from 'rxjs';
import { map, first, switchMap, shareReplay, take, switchMapTo } from 'rxjs/operators';

import { NetworkInformationComponent } from '../modals/network-information/network-information.component';
/** List of user actions with chat. */
enum ChatAction {
  /** View a chat info. */
  ViewInfo,
  /** Edit a chat name. */
  EditName,
  /** Invite new people to a chat. */
  InvitePeople,
  /** Leave from the chat. */
  Leave,
  /** No action. */
  NoAction,
}

/** Network */
@Component({
  selector: 'jlat-network-chat-page',
  templateUrl: './network-chat-page.component.html',
  styleUrls: ['./network-chat-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkChatPageComponent extends BaseNetworkChatPage {
  /** Chat info. */
  public readonly chat$: Observable<NetworkChatInfo>;
  /** Network name. */
  public readonly networkName$: Observable<string>;
  /** Loading controller. */
  public readonly isLoading$ = new BehaviorSubject(false);

  private readonly network$: Observable<Network>;
  private readonly actionMap: Record<ChatAction, () => void> = {
    [ChatAction.ViewInfo]: () => this.openInfoModal(),
    [ChatAction.EditName]: () => this.openEditNameAlert(),
    [ChatAction.Leave]: () => this.leaveCurrentNetwork(),
    [ChatAction.InvitePeople]: () =>
      this.navCtrl.navigateForward(['invite'], { relativeTo: this.route }),
    [ChatAction.NoAction]: () => null,
  };

  /**
   * @constructor
   * @param route Activated route.
   * @param networkService Network service.
   * @param networkChatsService Network chats service.
   * @param actionSheetCtrl Action sheet controller.
   * @param modalCtrl Modal controller.
   * @param alertController Alert controller.
   * @param alertService Alert service.
   * @param navCtrl Navigation controller.
   */
  public constructor(
    protected readonly networkService: NetworksService,
    protected readonly networkChatsService: NetworkChatService,
    private readonly route: ActivatedRoute,
    private readonly actionSheetCtrl: ActionSheetController,
    private readonly modalCtrl: ModalController,
    private readonly alertController: AlertController,
    private readonly alertService: AlertService,
    private readonly navCtrl: NavController,
  ) {
    super(networkService, networkChatsService);
    const networkId$ = route.paramMap.pipe(
      map(params => parseInt(params.get('id'), 10)),
      first(),
    );

    this.network$ = this.updateNetwork$.pipe(
      switchMapTo(networkId$),
      switchMap(id => this.networkService.getNetworkById(id)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.chat$ = this.network$.pipe(
      first(),
      switchMap(network => this.networkChatsService.getChatForNetwork(network)),
      take(1),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.networkName$ = this.network$.pipe(
      map((network) => network.title),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /**
   * Update network every time users come to the page.
   */
  public ionViewDidEnter(): void {
    this.updateNetwork$.next();
  }

  /** @inheritdoc */
  public createNetworkInvitation(): Observable<NetworkInvitation> {
    throw new Error('Method is not implemented');
  }

  /** @inheritdoc */
  public requestNewNetworkName(label: string, header: string, message?: string): Observable<string> {
    return this.showRenameAlert(label, header, message);
  }

  /** @inheritdoc */
  public askToLeaveNetwork(message: string, header: string): Observable<boolean> {
    return this.alertService.showConfirmation({
      buttonText: 'Leave',
      cancelButtonText: 'Cancel',
      isDangerous: true,
      header,
      message,
    });
  }

  /**
   * Handle 'click' of 'Actions' button.
   */
  public async onChatActionsClick(): Promise<void> {
    const action = await this.askUserForAction();
    this.actionMap[action]();
  }

  /** @inheritdoc */
  public viewNetworkInfo(network: Network): void {
    this.modalCtrl.create({
      component: NetworkInformationComponent,
      componentProps: { network },
    }).then(modal => modal.present());
  }

  private askUserForAction(): Promise<ChatAction> {
    return new Promise((resolve) => {
      this.chat$.pipe(
        map((chat) => {
          const buttons = [
            {
              text: 'View Network Info',
              handler: () => resolve(ChatAction.ViewInfo),
            },
            {
              text: 'Leave Network',
              handler: () => resolve(ChatAction.Leave),
            },
            {
              text: 'Edit Network Name',
              handler: () => resolve(ChatAction.EditName),
            },
            {
              text: 'Invite More People',
              handler: () => resolve(ChatAction.InvitePeople),
            },
          ];

          return buttons;
        }),
        switchMap((buttons) => this.actionSheetCtrl.create({
          buttons: [...buttons, { text: 'Cancel', role: 'cancel' }],
        })),
        switchMap((sheet) => sheet.present() && sheet.onDidDismiss()),
      ).subscribe(() => resolve(ChatAction.NoAction));
    });
  }

  private showRenameAlert(label: string, header: string, message?: string): Observable<string | null> {
    return this.network$.pipe(
      first(),
      switchMap((network) => this.alertController.create({
        header,
        message,
        inputs: [{
          label,
          name: 'name',
          type: 'text',
          value: network.title,
        }],
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          { text: 'Ok' },
        ],
      })),
      switchMap((alert) => alert.present() && alert.onDidDismiss()),
      switchMap((res) => res && res.role === 'cancel' ? EMPTY : of(res.data.values.name)),
    );
  }

  private openInfoModal(): void {
    this.network$
      .pipe(take(1))
      .subscribe((network) => this.viewNetworkInfo(network));
  }

  private openEditNameAlert(): void {
    this.chat$.pipe(take(1))
      .subscribe((network) => this.editNetworkName(network));
  }

  private leaveCurrentNetwork(): void {
    this.network$.pipe(
      first(),
      switchMap((network) => this.leaveNetwork(network)),
      take(1),
    ).subscribe(() => this.navCtrl.back());
  }
}

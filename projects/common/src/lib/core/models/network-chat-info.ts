import { ChatInfo } from './chat-info';
import { Network } from './network';
import { User } from './user';

/** Group chat between attorneys. */
export class NetworkChatInfo extends ChatInfo {
  /** Corresponding attorney network. */
  public readonly network: Network;

  /** Chat participants. */
  public get recipients(): User[] {
    return this.network.participants;
  }

  /** Title. */
  public get title(): string {
    return this.network.title;
  }

  /**
   * @constructor
   * @param data Data.
   */
  public constructor(
    data: Partial<NetworkChatInfo>,
  ) {
    super(data);
    this.network = data.network;
  }

  /** Is chat info editable. */
  public get editable(): boolean {
    return this.sender.id === this.network.creator.id;
  }
}

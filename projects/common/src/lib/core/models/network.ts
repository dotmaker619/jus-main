import { Attorney } from './attorney';

/** Group chat model. */
export class Network {
  /** Id. */
  public readonly id?: number;
  /** Title. */
  public readonly title: string;
  /** Chat channel. */
  public readonly chatId?: string;
  /** Creator. */
  public readonly creator?: Attorney;
  /** Participants. */
  public readonly participants: Attorney[];

  /**
   * @constructor
   * @param data Data.
   */
  public constructor(
    data: Network,
  ) {
    this.id = data.id;
    this.title = data.title;
    this.chatId = data.chatId;
    this.creator = data.creator;
    this.participants = data.participants;
  }
}

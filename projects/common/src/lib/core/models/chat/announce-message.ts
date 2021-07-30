import { Message } from './message';

/** Announce message. */
export class AnnounceMessage extends Message {
  /** Announce text. */
  public readonly text: string;

  /**
   * @constructor
   * @param data Data.
   */
  public constructor(
    data: Partial<AnnounceMessage>,
  ) {
    super(data);
    this.text = data.text;
  }
}

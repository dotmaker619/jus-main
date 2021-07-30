import { Lead } from '.';
import { ChatInfo } from './chat-info';
import { User } from './user';

/**
 * Lead chat info.
 * Describes a chat between attorney and client in the context of lead.
 */
export class LeadChatInfo extends ChatInfo {
  /**
   * Corresponding lead.
   */
  public readonly lead: Lead;

  /**
   * Recipients. Only one.
   */
  public readonly recipients: [User];

  /** Title. */
  public get title(): string {
    return this.recipient.fullName;
  }

  /**
   * @constructor
   * @param data Data.
   */
  public constructor(
    data: Partial<LeadChatInfo>,
  ) {
    super(data);
    this.lead = data.lead;
    this.recipients = data.recipients;
  }

  /** Chat participant. */
  public get recipient(): User {
    return this.recipients[0];
  }
}

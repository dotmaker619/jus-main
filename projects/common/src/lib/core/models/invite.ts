import { Client, ClientType } from './client';

/** Invite model */
export class Invite {
  /** UUID. */
  public uuid?: string;
  /** Client. */
  public client?: Client;
  /** First name. */
  public firstName: string;
  /** Last name. */
  public lastName: string;
  /** Email. */
  public email: string;
  /** Message of invitation. */
  public message: string;
  /** Time when invitation was sent. */
  public sent?: Date;
  /** Organization name. */
  public organizationName?: string;
  /** Client type. */
  public clientType?: ClientType;

  /** Name of the receiver of invitation. */
  public get recipientName(): string {
    switch (this.clientType) {
      case ClientType.Organization:
        return this.organizationName;
      default:
        return `${this.firstName} ${this.lastName}`;
    }
  }

  /** @constructor */
  constructor(invite: Partial<Invite>) {
    this.uuid = invite.uuid;
    this.client = invite.client;
    this.firstName = invite.firstName;
    this.lastName = invite.lastName;
    this.email = invite.email;
    this.message = invite.message;
    this.sent = invite.sent;
    this.organizationName = invite.organizationName;
    this.clientType = invite.clientType;
  }
}

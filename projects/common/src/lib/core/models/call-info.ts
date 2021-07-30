import { User } from '../models/user';

type CallParticipant = Omit<User, 'role' | 'fullName' | 'shortName' | 'description'>;

/** Call info dto model. */
export class CallInfo {
  /** Call id. */
  public id: number;
  /** Call url. */
  public callUrl: string;
  /** Participants. */
  public participants: CallParticipant[];
  /** Caller. */
  public caller: CallParticipant;
  /** Call message. */
  public get message(): string {
    return `${this.caller.firstName} ${this.caller.lastName} invites you to a Video Conference`;
  }

  /**
   * @constructor
   * @param callInfo Call info.
   */
  public constructor(callInfo: Partial<CallInfo>) {
    this.id = callInfo.id;
    this.callUrl = callInfo.callUrl;
    this.participants = callInfo.participants;
    this.caller = callInfo.caller;
  }
}

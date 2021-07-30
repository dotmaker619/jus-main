import { Role } from './role';
import { User } from './user';
import { VerificationStatus } from './verification-status';

/** Staff user. Also might be considered as Attorney's support. */
export class Staff extends User {
  /** Avatar. */
  public readonly avatar: string;
  /** Verification status. */
  public readonly verificationStatus: VerificationStatus;
  /** Custom note for the user. */
  private readonly info: string;
  /** Is functionality paid. */
  public readonly isPaid: boolean;

  /**
   * @constructor
   */
  public constructor(
    avatar: string,
    email: string,
    firstName: string,
    lastName: string,
    id: number,
    verificationStatus: VerificationStatus,
    info: string,
    isPaid: boolean,
  ) {
    super({
      avatar: avatar,
      email: email,
      firstName: firstName,
      lastName: lastName,
      id: id,
      role: Role.Staff,
    });
    this.info = info;
    this.verificationStatus = verificationStatus;
    this.isPaid = isPaid;
  }

  /** @inheritdoc */
  public get description(): string {
    return this.info;
  }
}

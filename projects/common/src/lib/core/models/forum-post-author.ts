import { ForumStats } from '.';
import { Author } from './author';
import { ClientType } from './client';
import { VerificationStatus } from './verification-status';

/**
 * Forum post author.
 */
export class ForumPostAuthor extends Author {
  /** Date Joined. */
  public dateJoined: string;
  /** LastLogin. */
  public lastLogin: string;
  /** ForumStats. */
  public forumStats: ForumStats;
  /** Created. */
  public created: string;
  /** Modified. */
  public modified: string;
  /** Client type. */
  public clientType: ClientType | null;
  /** Organization name. */
  public organizationName: string;
  /** Actives ubscription. */
  public activeSubscription: number | null;
  /** Specialties. */
  public specialties: number[];
  /** Verification status. */
  public verificationStatus: VerificationStatus;

  /**
   * @constructor
   *
   * @param data Initialize data.
   */
  public constructor(data: Partial<ForumPostAuthor>) {
    super({
      avatar: data.avatar,
      email: data.email,
      firstName: data.firstName,
      id: data.id,
      lastName: data.lastName,
    });
    this.dateJoined = data.dateJoined;
    this.lastLogin = data.lastLogin;
    this.forumStats = data.forumStats;
    this.created = data.created;
    this.modified = data.modified;
    this.verificationStatus = data.verificationStatus;
    this.clientType = data.clientType;
    this.organizationName = data.organizationName;
    this.activeSubscription = data.activeSubscription;
    this.specialties = data.specialties;
  }

  /**
   * Is user verified.
   */
  public get isVerified(): boolean {
    return this.verificationStatus === VerificationStatus.Approved;
  }
}

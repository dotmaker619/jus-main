import { Author } from './author';
import { Specialty } from './specialty';
import { VerificationStatus } from './verification-status';

/**
 * Author of social post.
 */
export class SocialPostAuthor extends Author {
  /** Verification status. */
  public verificationStatus: VerificationStatus;
  /** Is featured. */
  public isFeatured: boolean;
  /** Is sponsored. */
  public isSponsored: boolean;
  /** Has active subscription. */
  public hasActiveSubscription: boolean;
  /** Phone. */
  public phone: string;
  /** Specialties id */
  public specialities: number[];
  /** Specialties data. */
  public specialitiesData: Specialty[];
  /** Firm state. */
  public firmState: string;
  /** Firm city. */
  public firmCity: string;

  /**
   * @constructor
   *
   * @param data Initialize data.
   */
  public constructor(data: Partial<SocialPostAuthor>) {
    super({
      avatar: data.avatar,
      email: data.email,
      firstName: data.firstName,
      id: data.id,
      lastName: data.lastName,
    });
    this.verificationStatus = data.verificationStatus;
    this.isFeatured = data.isFeatured;
    this.isSponsored = data.isSponsored;
    this.hasActiveSubscription = data.hasActiveSubscription;
    this.phone = data.phone;
    this.specialities = data.specialities;
    this.specialitiesData = data.specialitiesData;
    this.firmCity = data.firmCity;
    this.firmState = data.firmState;
  }

  /**
   * Get string of author specialities.
   */
  public get specialitiesStr(): string {
    return this.specialitiesData.length === 0
      ? ''
      : this.specialitiesData.map((spec) => spec.title).join(', ');
  }
}

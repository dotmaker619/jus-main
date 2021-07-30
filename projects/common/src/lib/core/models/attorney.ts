import { PlaceResult } from '@jl/common/core/services/location.service';

import { Coordinates } from './coordinates';
import { Education } from './education';
import { FeeKind } from './fee-kind';
import { Role } from './role';
import { Specialty } from './specialty';
import { State } from './state';
import { User } from './user';

/**
 * Model for attorney's data.
 */
export class Attorney extends User {
  /**
   * Attorney's education.
   */
  public education: Education;
  /**
	 * Is attorney disciplined.
	 */
  public isDisciplined: boolean;
  /**
	 * Practice jurisdiction states.
	 */
  public practiceJurisdictions: State[];
  /**
   * The jurisdiction where you are currently licensed to practice law in along with your registration number.
   */
  public licenseInfo: string;
  /**
	 * Practice description.
	 */
  public practiceDescription: string;
  /**
   * Firm place ID.
   */
  public firmPlaceId: string;
  /**
   * Firm location.
   */
  public firmLocation: Coordinates;
  /**
   * Initial data from google.
   */
  public firmLocationData: PlaceResult;
  /**
   * City name from google place api
   */
  public firmLocationCity: string;
  /**
   * State name from google place api
   */
  public firmLocationState: string;
  /**
   * Years of experience.
   */
  public yearsOfExperience: number;
  /**
	 * Does attorney has specialty?
   */
  public haveSpecialty: boolean;
  /**
	 * List of specialties.
	 */
  public specialties: Specialty[];
  /**
	 * Speciality time.
   * Number of years practice in the specialized area.
	 */
  public specialtyTime: number;
  /**
	 * Speciality matters count.
   * Approximate number of matters, in the last 5 years, have handled.
	 */
  public specialtyMattersCount: number;
  /**
   * Related keywords.
   */
  public keywords: string;
  /**
	 * Fee rate.
	 */
  public feeRate: string;
  /**
	 * Information about attorneys fee kinds.
	 */
  public feeKinds: FeeKind[];
  /**
	 * Charity organizations.
	 */
  public charityOrganizations: string;
  /**
	 * Extra information.
	 */
  public extraInfo: string;
  /**
   * Phone.
   */
  public phone: string;
  /**
   * Payment plan.
   */
  public paymentPlan: string;
  /**
   * Payment method.
   */
  public paymentMethod: string;
  /**
   * Followers.
   */
  public readonly followers: number[];

  /**
   * Is attorney verified.
   */
  public isVerified: boolean;

  /**
   * Is attorney feature.
   */
  public featured: boolean;

  /**
   * Distance to attorney.
   */
  public distance: number;
  /**
   * Has attorney active subscription.
   */
  public hasActiveSubscription: boolean;
  /**
   * Is attorney sponsored.
   */
  public readonly isSponsored: boolean;
  /**
   * Sponsor attorney link.
   */
  public sponsorLink: string;

  /**
   * @constructor
   *
   * @param data Initialized data.
   */
  public constructor(data: Partial<Attorney>) {
    super({
      ...data,
      role: Role.Attorney,
    });
    this.education = data.education;
    this.isDisciplined = data.isDisciplined;
    this.practiceJurisdictions = data.practiceJurisdictions || [];
    this.licenseInfo = data.licenseInfo;
    this.practiceDescription = data.practiceDescription;
    this.firmPlaceId = data.firmPlaceId;
    this.firmLocation = data.firmLocation;
    this.firmLocationData = data.firmLocationData;
    this.firmLocationCity = data.firmLocationCity;
    this.firmLocationState = data.firmLocationState;
    this.yearsOfExperience = data.yearsOfExperience;
    this.haveSpecialty = data.haveSpecialty;
    this.specialties = data.specialties || [];
    this.specialtyTime = data.specialtyTime;
    this.specialtyMattersCount = data.specialtyMattersCount;
    this.keywords = data.keywords || '';
    this.feeRate = data.feeRate;
    this.feeKinds = data.feeKinds || [];
    this.charityOrganizations = data.charityOrganizations;
    this.extraInfo = data.extraInfo;
    this.paymentMethod = data.paymentMethod;
    this.paymentPlan = data.paymentPlan;
    this.phone = data.phone;
    this.followers = data.followers || [];
    this.isVerified = data.isVerified;
    this.featured = data.featured;
    this.distance = data.distance;
    this.hasActiveSubscription = data.hasActiveSubscription;
    this.isSponsored = data.isSponsored;
    this.sponsorLink = data.sponsorLink;
  }

  /**
   * Is followed by user with param id.
   * @param id
   */
  public isFollowedBy?(id: number): boolean {
    return this.followers.includes(id);
  }

  /**
   * @inheritdoc
   * Get string of specialties.
   */
  public get description(): string {
    return this.specialties.map(s => s.title).join(', ');
  }
}

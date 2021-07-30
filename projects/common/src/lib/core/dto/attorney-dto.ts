import { CoordinatesDto } from './coordinates-dto';
import { EducationDto } from './education-dto';
import { FeeKindDto } from './fee-kind-dto';
import { SpecialtyDto } from './specialty-dto';
import { StateDto } from './state-dto';
import PlaceResult = google.maps.places.PlaceResult;

/**
 * Attorney DTO.
 */
export interface AttorneyDto {
  /**
   * ID.
   */
  id: number;
  /**
	 * Avatar url.
	 */
  avatar: string;
  /**
   * First name.
   */
  first_name: string;
  /**
   * Last name.
   */
  last_name: string;
  /**
   * Email.
   */
  email: string;
  /**
   * Phone.
   */
  phone: string;
  /**
	 * Education.
	 */
  education: EducationDto[];
  /**
	 * Is disciplined.
	 */
  is_disciplined: boolean;
  /**
	 * Practice jurisdiction states identifiers.
	 */
  practice_jurisdictions: number[];
  /**
	 * Practice jurisdiction.
	 */
  practice_jurisdictions_data?: StateDto[];
  /**
   * The jurisdiction where you are currently licensed to practice law in along with your registration number.
   */
  license_info: string;
  /**
	 * Practice description.
	 */
  practice_description: string;
  /**
   * Firm place ID.
   */
  firm_place_id: string;
  /**
   * Firm location.
   */
  firm_location: CoordinatesDto;
  /**
   * Initial place data from google
   */
  firm_location_data: PlaceResult;
  /**
   * City name from google place api
   */
  firm_location_city: string;
  /**
   * State name from google place api
   */
  firm_location_state: string;
  /**
   * Years of experience.
   */
  years_of_experience: number;
  /**
	 * Does attorney has speciality?
	 */
  have_speciality: boolean;
  /**
	 * Specialties identifiers.
	 */
  specialities: Array<number>;
  /**
	 * Specialties data.
	 */
  specialities_data?: Array<SpecialtyDto>;
  /**
	 * Specialty time.
   * Number of years practice in the specialized area.
	 */
  speciality_time: number;
  /**
	 * Speciality matters count.
   * Approximate number of matters, in the last 5 years, have handled.
	 */
  speciality_matters_count: number;
  /**
   * Keywords.
   */
  keywords: string[];
  /**
	 * Fee rate.
	 */
  fee_rate: string;
  /**
	 * Fee kinds.
	 */
  fee_kinds: number[];
  /**
	 * Fee kinds data.
	 */
  fee_kinds_data?: FeeKindDto[];
  /**
	 * Charity organizations.
	 */
  charity_organizations: string;
  /**
	 * Extra info.
	 */
  extra_info: string;
  /**
   * Payment method.
   */
  payment_method: string;
  /**
   * Payment plan.
   */
  plan: string;
  /**
   * Followers.
   */
  readonly followers?: number[];
  /**
   * Is verified.
   */
  is_verified: boolean;
  /**
   * Is featured.
   */
  featured: boolean;
  /**
   * Distance to attorney
   */
  distance: number;
  /**
   * Has attorney active subscription.
   */
  has_active_subscription?: boolean;
  /**
   * Is sponsored.
   */
  sponsored: boolean;
  /**
   * Sponsor link.
   */
  sponsor_link: string;
}

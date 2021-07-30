import { Injectable } from '@angular/core';
import { AttorneyDto } from '@jl/common/core/dto/attorney-dto';
import { EducationMapper } from '@jl/common/core/mappers/education.mapper';
import { FeeKindMapper } from '@jl/common/core/mappers/fee-kind.mapper';
import { MapperWithErrors } from '@jl/common/core/mappers/mapper';
import { StateMapper } from '@jl/common/core/mappers/state.mapper';
import { Attorney } from '@jl/common/core/models/attorney';

import { ValidationErrorDto } from '../dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';

import { SpecialtyMapper } from './specialty.mapper';

const DEFAULT_AVATAR_URL = '/assets/profile-image.png';

/**
 * Attorney's mapper.
 */
@Injectable({
  providedIn: 'root',
})
export class AttorneyMapper implements MapperWithErrors<AttorneyDto, Attorney> {
  private readonly stateMapper = new StateMapper();
  private readonly feeKindsMapper = new FeeKindMapper();
  private readonly educationMapper = new EducationMapper();
  private readonly specialtyMapper = new SpecialtyMapper();

  /** @inheritdoc */
  public fromDto(attorneyDto: AttorneyDto): Attorney {
    if (attorneyDto == null) {
      return null;
    }
    return new Attorney({
      id: attorneyDto.id,
      avatar: attorneyDto.avatar || DEFAULT_AVATAR_URL,
      firstName: attorneyDto.first_name,
      lastName: attorneyDto.last_name,
      email: attorneyDto.email,
      phone: attorneyDto.phone,
      education: this.educationMapper.fromArrayDto(attorneyDto.education),
      isDisciplined: attorneyDto.is_disciplined,
      practiceJurisdictions: this.stateMapper.fromArrayDto(attorneyDto.practice_jurisdictions_data),
      licenseInfo: attorneyDto.license_info,
      practiceDescription: attorneyDto.practice_description,
      yearsOfExperience: attorneyDto.years_of_experience,
      haveSpecialty: attorneyDto.have_speciality,
      specialties: this.specialtyMapper.fromArrayDto(attorneyDto.specialities_data),
      specialtyTime: attorneyDto.speciality_time || 0,
      specialtyMattersCount: attorneyDto.speciality_matters_count || 0,
      keywords: attorneyDto.keywords ? attorneyDto.keywords.join(', ') : '',
      feeRate: attorneyDto.fee_rate,
      feeKinds: attorneyDto.fee_kinds_data && attorneyDto.fee_kinds_data.map(feeKind =>
        this.feeKindsMapper.fromDto(feeKind),
      ),
      charityOrganizations: attorneyDto.charity_organizations,
      extraInfo: attorneyDto.extra_info,
      paymentMethod: attorneyDto.payment_method,
      paymentPlan: attorneyDto.plan,
      followers: attorneyDto.followers,
      isVerified: attorneyDto.is_verified,
      firmLocation: attorneyDto.firm_location,
      firmLocationData: attorneyDto.firm_location_data,
      firmLocationCity: attorneyDto.firm_location_city,
      firmLocationState: attorneyDto.firm_location_state,
      featured: attorneyDto.featured,
      distance: this.distanceToMiles(attorneyDto.distance),
      hasActiveSubscription: attorneyDto.has_active_subscription || false,
      isSponsored: attorneyDto.sponsored,
      sponsorLink: attorneyDto.sponsor_link,
    });
  }

  /** @inheritdoc */
  public toDto(data: Attorney): AttorneyDto {
    if (data == null) {
      return null;
    }

    // Avatar might be null in case of validating.
    if (data.avatar !== null && typeof data.avatar !== 'string') {
      // Otherwise - API supports only URLs as avatar.
      throw new Error('Avatar should be an URL to an image');
    }

    return {
      id: data.id,
      avatar: data.avatar as string,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      education: this.educationMapper.toArrayDto(data.education),
      is_disciplined: data.isDisciplined,
      practice_jurisdictions: this.stateMapper.toArrayIds(data.practiceJurisdictions),
      license_info: data.licenseInfo,
      practice_description: data.practiceDescription,
      years_of_experience: data.yearsOfExperience,
      have_speciality: data.haveSpecialty,
      specialities: this.specialtyMapper.toArrayIds(data.specialties),
      speciality_time: data.specialtyTime,
      speciality_matters_count: data.specialtyMattersCount,
      keywords: data.keywords.split(', ').filter(word => Boolean(word.length)),
      fee_rate: data.feeRate,
      fee_kinds: data.feeKinds.map(feeKind => feeKind.id),
      charity_organizations: data.charityOrganizations,
      extra_info: data.extraInfo,
      plan: data.paymentPlan,
      payment_method: data.paymentMethod,
      is_verified: data.isVerified,
      firm_location: data.firmLocation,
      featured: data.featured,
      distance: data.distance,
      firm_place_id: data.firmPlaceId,
      firm_location_data: data.firmLocationData,
      firm_location_city: data.firmLocationCity,
      firm_location_state: data.firmLocationState,
      sponsor_link: data.sponsorLink,
      sponsored: data.isSponsored,
    };
  }

  /**
   * @inheritdoc
   */
  public validationErrorFromDto(errorDto: ValidationErrorDto<AttorneyDto> | null | undefined): TEntityValidationErrors<Attorney> {
    if (errorDto == null) {
      return null;
    }
    return {
      avatar: extractErrorMessage(errorDto.avatar),
      firstName: extractErrorMessage(errorDto.first_name),
      lastName: extractErrorMessage(errorDto.last_name),
      email: extractErrorMessage(errorDto.email),
      phone: extractErrorMessage(errorDto.phone),
      education: this.educationMapper.validationErrorFromDto(errorDto.education),
      isDisciplined: extractErrorMessage(errorDto.is_disciplined),
      practiceJurisdictions: extractErrorMessage(errorDto.practice_jurisdictions),
      licenseInfo: extractErrorMessage(errorDto.license_info),
      practiceDescription: extractErrorMessage(errorDto.practice_description),
      yearsOfExperience: extractErrorMessage(errorDto.years_of_experience),
      haveSpecialty: extractErrorMessage(errorDto.have_speciality),
      specialties: extractErrorMessage(errorDto.specialities),
      specialtyTime: extractErrorMessage(errorDto.speciality_time),
      specialtyMattersCount: extractErrorMessage(errorDto.speciality_matters_count),
      keywords: extractErrorMessage(errorDto.keywords),
      feeRate: extractErrorMessage(errorDto.fee_rate),
      feeKinds: extractErrorMessage(errorDto.fee_kinds),
      charityOrganizations: extractErrorMessage(errorDto.charity_organizations),
      extraInfo: extractErrorMessage(errorDto.extra_info),
      paymentMethod: extractErrorMessage(errorDto.payment_method),
      paymentPlan: extractErrorMessage(errorDto.plan),
      firmPlaceId: extractErrorMessage(errorDto.firm_place_id),
      firmLocation: extractErrorMessage(errorDto.firm_location),
      firmLocationCity: extractErrorMessage(errorDto.firm_location_city),
      firmLocationState: extractErrorMessage(errorDto.firm_location_state),
    };
  }

  private distanceToMiles(value: number): number {
    if (value == null) {
      return;
    }

    return value / 1609;
  }
}

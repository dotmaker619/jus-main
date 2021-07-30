import { Injectable } from '@angular/core';

import { SocialPostAuthorDto } from '../dto/social-post-author-dto';
import { SocialPostAuthor } from '../models/social-post-author';

import { MapperFromDto } from './mapper';
import { SpecialtyMapper } from './specialty.mapper';

/**
 * Mapper for SocialPostAuthor entity.
 */
@Injectable({ providedIn: 'root' })
export class SocialPostAuthorMapper implements MapperFromDto<SocialPostAuthorDto, SocialPostAuthor> {
  private readonly specialtyMapper = new SpecialtyMapper();
  /** @inheritdoc */
  public fromDto(dto: SocialPostAuthorDto): SocialPostAuthor {
    return new SocialPostAuthor({
      avatar: dto.avatar,
      email: dto.email,
      firstName: dto.first_name,
      hasActiveSubscription: dto.has_active_subscription,
      id: dto.id,
      isFeatured: dto.featured,
      isSponsored: dto.sponsored,
      lastName: dto.last_name,
      phone: dto.phone,
      verificationStatus: dto.verification_status,
      specialities: dto.specialities,
      specialitiesData: this.specialtyMapper.fromArrayDto(dto.specialities_data),
      firmCity: dto.firm_location_city,
      firmState: dto.firm_location_state,
    });
  }
}

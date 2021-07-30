import { ESignProfileDto } from '@jl/common/core/dto/esign-profile-dto';
import { MapperFromDto } from '@jl/common/core/mappers/mapper';
import { ESignProfile } from '@jl/common/core/models/esign-profile';

/** ESignProfile mapper. */
export class ESignProfileMapper implements MapperFromDto<ESignProfileDto, ESignProfile> {
  /** @inheritdoc */
  public fromDto(data: ESignProfileDto): ESignProfile {
    if (data == null) {
      return null;
    }
    return new ESignProfile({
      docusignId: data.docusign_id,
      hasConsent: data.has_consent,
      obtainConsentLink: data.obtain_consent_link,
    });
  }
}

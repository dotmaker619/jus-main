import { Injectable } from '@angular/core';

import { VoiceConsentDto } from '../dto/voice-consent-dto';
import { VoiceConsent } from '../models/voice-consent';

import { IMapper } from './mapper';

/** Voice consent mapper. */
@Injectable({ providedIn: 'root' })
export class VoiceConsentMapper implements IMapper<VoiceConsentDto, VoiceConsent> {
  /** @inheritdoc */
  public fromDto(data: VoiceConsentDto): VoiceConsent<string> {
    return new VoiceConsent({
      file: data.file,
      id: data.id,
      matterData: {
        code: data.matter_data.code,
        description: data.matter_data.description,
        id: data.matter_data.id,
        title: data.matter_data.title,
      },
      title: data.title,
    });
  }
  /** @inheritdoc */
  public toDto(data: VoiceConsent<string>): VoiceConsentDto {
    return {
      file: data.file,
      id: data.id,
      matter: data.matterData.id,
      title: data.title,
    };
  }

}

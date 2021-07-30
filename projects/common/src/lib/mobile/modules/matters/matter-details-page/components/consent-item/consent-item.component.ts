import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { VoiceConsent } from '@jl/common/core/models/voice-consent';

/** Voice consent item component. */
@Component({
  selector: 'jlc-consent-item',
  templateUrl: './consent-item.component.html',
  styleUrls: ['./consent-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentItemComponent {

  /** Voice consent. */
  @Input()
  public consent: VoiceConsent;

}

import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Attorney } from '@jl/common/core/models/attorney';

const FALLBACK_AVATAR = 'assets/icons/person_icon.svg';

/** Attorney card. */
@Component({
  selector: 'jlc-attorney-card',
  templateUrl: './attorney-card.component.html',
  styleUrls: ['./attorney-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttorneyCardComponent {
  /** Attorney. */
  @Input()
  public attorney: Attorney;

  /** To emit event when user wants to see the location of the attorney. */
  @Output()
  public readonly showLocation = new EventEmitter<Attorney>();

  /** Attorney's avatar. */
  public get avatarUrl(): string {
    return this.attorney.avatar as string || FALLBACK_AVATAR;
  }

  /** Attorney's specialty. */
  public get specialty(): string {
    return this.attorney.specialties.length && this.attorney.specialties[0].title;
  }
}

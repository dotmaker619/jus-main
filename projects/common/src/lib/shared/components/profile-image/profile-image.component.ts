import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/** Profile image component. */
@Component({
  selector: 'jlc-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileImageComponent {
  /** Profile image src. */
  @Input()
  public src: string;

  /** Image description. */
  @Input()
  public alt: string;

  /** Fallback image. */
  public readonly fallbackImg = 'assets/profile-image.png';
}

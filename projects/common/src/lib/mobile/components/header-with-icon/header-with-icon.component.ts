import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/** Component displaying header with icon. */
@Component({
  selector: 'jlc-header-with-icon',
  templateUrl: './header-with-icon.component.html',
  styleUrls: ['./header-with-icon.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderWithIconComponent {
  /** Icon url. */
  @Input()
  public src: string;
}

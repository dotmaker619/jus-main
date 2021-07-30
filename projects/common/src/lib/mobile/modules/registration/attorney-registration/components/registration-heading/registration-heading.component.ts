import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/** Registration heading component. For mobile devices. */
@Component({
  selector: 'jlc-registration-heading',
  templateUrl: './registration-heading.component.html',
  styleUrls: ['./registration-heading.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationHeadingComponent {
  /** Step number. */
  @Input()
  public stepNum: number;

  /** Heading text. */
  @Input()
  public text: string;
}

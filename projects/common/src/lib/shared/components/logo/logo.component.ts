import { Component, ChangeDetectionStrategy } from '@angular/core';

/** Logo image component. */
@Component({
  selector: 'jlc-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {}

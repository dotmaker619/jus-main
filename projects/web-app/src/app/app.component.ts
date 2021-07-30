import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Application root component.
 */
@Component({
  selector: 'jlw-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
}

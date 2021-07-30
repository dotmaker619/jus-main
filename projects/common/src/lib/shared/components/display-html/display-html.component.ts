import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/** Component to display HTML code. */
@Component({
  selector: 'jlc-display-html',
  templateUrl: './display-html.component.html',
  styleUrls: ['./display-html.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayHTMLComponent {
  /** Content of the component. */
  @Input()
  public content: string;
  /** Crutch. */
  @Input()
  public areImagesHidden = false;
}

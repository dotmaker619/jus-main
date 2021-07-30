import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/** Expandable card component. */
@Component({
  selector: 'jlc-expandable-card',
  templateUrl: './expandable-card.component.html',
  styleUrls: ['./expandable-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpandableCardComponent {
  /** Defines whether the card is collapsed. */
  @Input()
  public isCollapsed = true;
}

import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { AttorneyEvent } from '@jl/common/core/models/attorney-event';

/**
 * Event card for list of events.
 */
@Component({
  selector: 'jlc-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCardComponent {
  /**
   * Attorney event.
   */
  @Input()
  public event: AttorneyEvent;
  /**
   * Is card editable.
   */
  @Input()
  public showButton = false;
  /**
   * Emit value when an event was deleted.
   */
  @Output()
  public optionsClicked = new EventEmitter<AttorneyEvent>();

  /**
   * Handle click on options button.
   */
  public onMoreButtonClick(): void {
    this.optionsClicked.emit(this.event);
  }
}

import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { AttorneyEvent } from '@jl/common/core/models/attorney-event';

/** Event info component. */
@Component({
  selector: 'jlc-event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInfoComponent {
  /** Event. */
  @Input()
  public event: AttorneyEvent;

  /** Display buttons. */
  @Input()
  public displayButtons: boolean;

  /** Button with edit-icon. */
  @Output()
  public clickEdit = new EventEmitter();

  /** Button with delete-icon. */
  @Output()
  public clickDelete = new EventEmitter();

  /** @constructor */
  public constructor() { }

  /** Emit clickEdit event. */
  public onEditClicked(event: AttorneyEvent): void {
    this.clickEdit.emit(event);
  }

  /** Emit clickDelete event. */
  public onDeleteClicked(event: AttorneyEvent): void {
    this.clickDelete.emit(event);
  }
}

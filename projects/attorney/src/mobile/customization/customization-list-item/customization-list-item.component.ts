import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
/**
 * Customization list item.
 *
 * @description Component is used as a list item on the 'jlat-matter-stage-page' and 'jlat-matter-closing-checklist-page'
 * Here is 'ng-content' to pass information about item i.e. title, description, etc.
 * And also here are 2 buttons - 'edit' and 'delete'. Handlers for these buttons take
 * @Input() item and emit it.
 */
@Component({
  selector: 'jlat-customization-list-item',
  templateUrl: './customization-list-item.component.html',
  styleUrls: ['./customization-list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomizationListItemComponent {
  /**
   * Item ID to make action with it.
   */
  @Input()
  public item: unknown;
  /**
   * Emit value when 'edit' button was clicked.
   */
  @Output()
  public edit = new EventEmitter<unknown>();
  /**
   * Emit value when 'delete' button was clicked.
   */
  @Output()
  public delete = new EventEmitter<unknown>();

  /**
   * Handle 'edit' button clicks.
   */
  public onEditButton(): void {
    this.edit.emit(this.item);
  }

  /**
   * Handle 'delete' button clicks.
   */
  public onDeleteButton(): void {
    this.delete.emit(this.item);
  }
}

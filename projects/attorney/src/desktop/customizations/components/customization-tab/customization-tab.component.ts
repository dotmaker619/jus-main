import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { trackById } from '@jl/common/core/utils/trackby-id';

import { CustomizationTab } from '../../models/customization-tab';

/** Customization tab component. */
@Component({
  selector: 'jlat-customization-tab',
  templateUrl: './customization-tab.component.html',
  styleUrls: ['./customization-tab.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomizationTabComponent<T> {

  /** Tab. */
  @Input()
  public tab: CustomizationTab<T>;

  /** Button 'new'. */
  @Output()
  public clickNew = new EventEmitter();

  /** Button with edit-icon. */
  @Output()
  public clickEdit = new EventEmitter();

  /** Button with delete-icon. */
  @Output()
  public clickDelete = new EventEmitter();

  /** Embed template reference. */
  @ContentChild(TemplateRef, { static: false })
  public templateRef;

  /** Track by id. */
  public trackById = trackById;

  /** Emit clickNew event. */
  public onNewClicked(): void {
    this.clickNew.emit();
  }

  /** Emit clickEdit event. */
  public onEditClicked(item: T): void {
    this.clickEdit.emit(item);
  }

  /** Emit clickDelete event. */
  public onDeleteClicked(item: T): void {
    this.clickDelete.emit(item);
  }
}

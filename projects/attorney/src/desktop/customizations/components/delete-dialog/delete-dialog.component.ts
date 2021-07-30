import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AbstractDialog } from '@jl/common/shared';

import { CustomizationType } from '../../models/customization-type';

/**
 * Delete stage dialog options.
 */
export interface DeleteStageDialogOptions {
  /**
   * Title
   */
  title: string;
  /** Customization type */
  type: CustomizationType;
}

/** Dialog component for creating customization item. */
@Component({
  selector: 'jlat-delete-stage-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDialogComponent extends AbstractDialog<DeleteStageDialogOptions, boolean> {
  /** Customization type enum */
  public readonly CustomizationType = CustomizationType;

  /** Current customization type */
  get type(): CustomizationType {
    return this.options.type;
  }

  /** @constructor */
  constructor() {
    super();
  }

  /** Cancel. */
  public onCloseClicked(): void {
    this.closed.next(false);
  }

  /** Delete. */
  public onDeleteClicked(): void {
    this.closed.next(true);
  }
}

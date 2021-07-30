import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Network } from '@jl/common/core/models/network';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { AbstractDialog } from '@jl/common/shared';

/** Network info dialog component. */
@Component({
  selector: 'jlat-network-info-dialog',
  templateUrl: './network-info-dialog.component.html',
  styleUrls: ['./network-info-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkInfoDialogComponent extends AbstractDialog<Network> {
  /** Trackby function. */
  public readonly trackById = trackById;
}

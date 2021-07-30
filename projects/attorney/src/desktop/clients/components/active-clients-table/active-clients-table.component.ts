import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Matter } from '@jl/common/core/models/matter';
import { trackById } from '@jl/common/core/utils/trackby-id';

/** Active clients table component. */
@Component({
  selector: 'jlat-active-clients-table',
  templateUrl: './active-clients-table.component.html',
  styleUrls: ['./active-clients-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveClientsTableComponent {

  /** Matters. */
  @Input()
  public matters: Matter[];

  /** Track by id function. */
  public trackById = trackById;
}

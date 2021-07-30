import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Client } from '@jl/common/core/models/client';

/** Client badge component. */
@Component({
  selector: 'jlc-client-info',
  templateUrl: './client-info.component.html',
  styleUrls: ['./client-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientInfoComponent  {

  /** Should the name be written fully. */
  @Input()
  public fullName = false;

  /** Client. */
  @Input()
  public client: Client;

}

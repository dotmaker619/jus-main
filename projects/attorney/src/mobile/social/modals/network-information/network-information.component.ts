import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Network } from '@jl/common/core/models/network';
import { trackById } from '@jl/common/core/utils/trackby-id';

/** Modal window */
@Component({
  selector: 'jlat-network-information',
  templateUrl: './network-information.component.html',
  styleUrls: ['./network-information.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkInformationComponent {
  /** Network. */
  @Input()
  public network: Network;
  /** Trackby function. */
  public readonly trackById = trackById;

  /**
   * @constructor
   *
   * @param modalCtrl Modal controller.
   */
  public constructor(
    private readonly modalCtrl: ModalController,
  ) { }

  /**
   * Handle 'click' of the 'Close' button.
   */
  public onClose(): void {
    this.close();
  }

  private close(): void {
    this.modalCtrl.dismiss();
  }
}

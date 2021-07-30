import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Client, ClientRegistration } from '@jl/common/core/models';
import { ClientType } from '@jl/common/core/models/client';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import {
  MobileChangePasswordModalComponent,
} from '@jl/common/mobile/modals/mobile-change-password-form/mobile-change-password-modal.component';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

const DUMMY_PASSWORD = 'verysecretpassword';

/** Client account info component. For mobile devices. */
@Component({
  selector: 'jlcl-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountInfoComponent {

  /** Current client. */
  public readonly client$: Observable<Client>;
  /** Current client type. */
  public readonly clientType$: Observable<ClientType>;
  /** Roles. */
  public readonly clientTypes = ClientType;

  /**
   * @constructor
   * @param userService User service.
   * @param modalController Modal controller.
   */
  public constructor(
    private readonly userService: CurrentUserService,
    private readonly modalController: ModalController,
  ) {
    this.client$ = this.initClientStream();
    this.clientType$ = this.initClientTypeStream(this.client$);
  }

  /**
   * Handle click on change password button.
   */
  public async onChangePasswordClick(): Promise<void> {
    const modal = await this.modalController.create({
      component: MobileChangePasswordModalComponent,
    });
    modal.present();
  }

  private initClientStream(): Observable<Client> {
    return this.userService.getClientUser().pipe(
      map(client => new ClientRegistration({
        ...client,
        password: DUMMY_PASSWORD,
        passwordConfirm: DUMMY_PASSWORD,
      })),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initClientTypeStream(client$: Observable<Client>): Observable<ClientType> {
    return client$.pipe(
      map(client => client.clientType),
    );
  }
}

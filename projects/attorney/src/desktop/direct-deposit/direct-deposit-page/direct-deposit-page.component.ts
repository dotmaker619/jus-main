import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseDirectDepositPage } from '@jl/attorney/shared/base/direct-deposit-page.base';
import { StripeAccountService } from '@jl/common/core/services/stripe-account.service';
import { UrlsService } from '@jl/common/core/services/urls.service';
import { DialogsService } from '@jl/common/shared';
import { Observable, from } from 'rxjs';

/**
 * Direct deposit page.
 */
@Component({
  selector: 'jlat-direct-deposit-page',
  templateUrl: './direct-deposit-page.component.html',
  styleUrls: ['./direct-deposit-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectDepositPageComponent extends BaseDirectDepositPage {

  /**
   * @inheritdoc
   * @param dialogsService Dialogs service.
   */
  public constructor(
    route: ActivatedRoute,
    router: Router,
    urlsService: UrlsService,
    stripeAccountService: StripeAccountService,
    private readonly dialogsService: DialogsService,
  ) {
    super(route, router, urlsService, stripeAccountService);
  }

  /** @inheritdoc */
  public notifyUserAboutFailedRegistration(title: string, message: string): Promise<void> {
    return this.dialogsService.showInformationDialog({title, message});
  }
}

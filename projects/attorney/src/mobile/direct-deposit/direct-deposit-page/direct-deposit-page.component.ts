import { Component, ChangeDetectionStrategy, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { BaseDirectDepositPage } from '@jl/attorney/shared/base/direct-deposit-page.base';
import { StripeAccountService } from '@jl/common/core/services/stripe-account.service';
import { UrlsService } from '@jl/common/core/services/urls.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { takeUntil } from 'rxjs/operators';

/**
 * Direct deposit page.
 */
@Component({
  selector: 'jlat-direct-deposit-page',
  templateUrl: './direct-deposit-page.component.html',
  styleUrls: ['./direct-deposit-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectDepositPageComponent extends BaseDirectDepositPage implements OnInit {

  public constructor(
    route: ActivatedRoute,
    router: Router,
    urlsService: UrlsService,
    stripeAccountService: StripeAccountService,
    private readonly alertService: AlertService,
    private readonly platform: Platform,
    private readonly ngZone: NgZone,
  ) {
    super(route, router, urlsService, stripeAccountService);
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    super.ngOnInit();
    this.platform.resume.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.ngZone.run(() => this.updateAccount$.next()));
  }

  /** @inheritdoc */
  public notifyUserAboutFailedRegistration(header: string, message: string): Promise<void> {
    return this.alertService.showNotificationAlert({buttonText: 'OK', header, message});
  }
}

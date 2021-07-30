import { ActivatedRoute, Router } from '@angular/router';
import { ESignProfile } from '@jl/common/core/models/esign-profile';
import { ESignService } from '@jl/common/core/services/esign.service';
import { ExternalResourcesService } from '@jl/common/core/services/external-resources.service';
import { Observable } from 'rxjs';
import { first, switchMap, map, shareReplay, tap } from 'rxjs/operators';

/**
 * Base class for consent page.
 */
export class BaseConsentPageComponent {
  /** Options for e-signature profile. */
  public readonly esignProfile$: Observable<ESignProfile>;
  /**
   * Layout welcome message.
   */
  public readonly welcomeMessage = `To provide the electronic signing of documents, we use the DocuSign
  service.`;
  /**
   * Layout description message.
   */
  public readonly description = `According to the requirements of this service, in order for Jus-Law
  to prepare a request for signature on your behalf, we need your consent for impersonation to perform this operation.
  Please, make sure you are logged into your DocuSign account you want to use.`;
  /**
   * Layout action description message.
   */
  public readonly actionDescription = `Please click on the button to provide your consent`;
  /**
   * Layout consent provided message.
   */
  public readonly consentProvided = `You've already provided impersonation consent to use with your e-signature account.`;

  /**
   * @constructor
   *
   * @param route Current user route.
   * @param eSignService Service for e-signature provider.
   * @param externalResourcesService Service to work with external resources.
   * @param router Router.
   */
  public constructor(
    route: ActivatedRoute,
    private readonly eSignService: ESignService,
    private readonly externalResourcesService: ExternalResourcesService,
    private readonly router: Router,
  ) {
    const url$ = route.queryParamMap.pipe(
      first(),
      map((params) => params.get('returnUrl') || ''),
    );

    this.esignProfile$ = this.initEsignProfile(url$);
  }

  /** Navigate to e-signature service to provide impersonation consent */
  public onConsentClicked(): void {
    this.esignProfile$.pipe(
      first(),
      tap(() => this.router.navigateByUrl('/matters', { replaceUrl: true })),
      switchMap(profile => this.externalResourcesService.openExternalLink(profile.obtainConsentLink)),
    ).subscribe();
  }

  private initEsignProfile(returnUrl$: Observable<string>): Observable<ESignProfile> {
    return returnUrl$.pipe(
      switchMap((url) => this.eSignService.getESignProfile(url)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { SubscriptionService } from '@jl/common/core/services/subscription.service';
import { BehaviorSubject, Observable, from, NEVER } from 'rxjs';
import { switchMap, map, catchError, take, finalize } from 'rxjs/operators';

/**
 * Credit card component.
 * Provides creating and editing a credit card.
 */
@Component({
  selector: 'jlc-payment-method-form',
  templateUrl: './payment-method-form.component.html',
  styleUrls: ['./payment-method-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodFormComponent implements OnInit, OnDestroy {
  private stripeApi: stripe.Stripe;
  private stripeCardElement: stripe.elements.Element;

  /**
   * Show form controls.
   */
  @Input()
  public showControls = true;

  /**
   * Current component is ready to work event.
   */
  @Output()
  public ready = new EventEmitter<void>();

  /**
   * Card submit event.
   */
  @Output()
  public formSubmit = new EventEmitter<string>();

  /**
   * Card submit failed.
   */
  @Output()
  public submitFailed = new EventEmitter<string>();

  /**
   * Stipe anchor element ot mount stripe.elements.Element.
   */
  @ViewChild('stripeAnchor', { static: true })
  public stripeAnchorElementRef: ElementRef;

  /**
   * Current error of a credit card create/edit.
   */
  public error$ = new BehaviorSubject<string | null>(null);

  /**
   * Form control.
   */
  public form: FormGroup;

  /**
   * Is form submitting.
   */
  public isSubmitting$ = new BehaviorSubject<boolean>(false);

  /**
   * @constructor
   *
   * @param appConfigService App configuration service.
   * @param paymentService Payment service.
   * @param formBuilder Form builder.
   * @param changeDetectorRef Change detector.
   */
  public constructor(
    private appConfigService: AppConfigService,
    private paymentService: SubscriptionService,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.stripeApi = Stripe(this.appConfigService.stripeConfig.publicKey, {
      locale: this.appConfigService.stripeConfig.locale,
    });
    this.form = this.formBuilder.group({
      cardholderName: ['', Validators.required],
      isCardCompleted: [null, Validators.requiredTrue],
    });
  }

  /**
   * @inheritdoc
   */
  public ngOnInit(): void {
    const stripeElementsStyles = this.getStripeStyles();
    this.stripeCardElement = this.stripeApi.elements().create('card', {
      style: stripeElementsStyles,
      hidePostalCode: true,
    });
    this.stripeCardElement.on('ready', () => this.ready.emit());
    this.stripeCardElement.on('blur', () => {
      // To display validation errors if exist.
      this.form.get('isCardCompleted').markAllAsTouched();
      this.changeDetectorRef.detectChanges();
    });
    this.stripeCardElement.on('change', ({ complete }) => {
      this.form.patchValue({
        isCardCompleted: complete,
      });
      this.form.get('isCardCompleted').markAllAsTouched();
    });
    this.stripeCardElement.mount(this.stripeAnchorElementRef.nativeElement);
  }

  /**
   * @inheritdoc
   */
  public ngOnDestroy(): void {
    if (this.stripeCardElement) {
      this.stripeCardElement.unmount();
      this.stripeCardElement.destroy();
    }
  }

  /**
   * Submit changes.
   *
   * @returns Created/changed card token.
   */
  public submit(): void {
    this.onFormSubmitted(this.form);
  }

  /**
   * Is form component valid.
   */
  public get valid(): boolean {
    return this.form.valid;
  }

  /** Mark form as touched. */
  public markAsTouched(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    // To display validation error for Stripe element.
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  /**
   * On form submitted.
   *
   * @param form Form instance.
   */
  public onFormSubmitted(form: FormGroup): void {
    this.markAsTouched();
    if (form.invalid || this.isSubmitting$.value) {
      return;
    }
    this.error$.next(null); // Reset before start.
    this.isSubmitting$.next(true);
    const cardholderName = form.value.cardholderName as string;
    this.confirmCardSetup(cardholderName)
      .pipe(
        catchError((error: Error) => {
          this.isSubmitting$.next(false);
          this.error$.next(error.message);
          this.submitFailed.emit(error.message);
          return NEVER;
        }),
        take(1),
        finalize(() => this.isSubmitting$.next(false)),
      )
      .subscribe(paymentMethodId => this.formSubmit.emit(paymentMethodId));
  }

  /**
   * Get stripe element from the component.
   *
   * @returns Id of a new payment method obtained from provided credentials.
   */
  public async createPaymentMethod(): Promise<string> {
    const {
      error,
      paymentMethod,
    } = await this.stripeApi.createPaymentMethod(
      'card',
      this.stripeCardElement,
      {
        billing_details: {
          name: this.form.value.cardholderName,
        },
      });

    if (error) {
      return Promise.reject(new Error(error.message));
    }

    return Promise.resolve(paymentMethod.id);
  }

  /**
   * Confirm card setup.
   *
   * @param cardholderName Cardholder name.
   *
   * @returns Payment method ID.
   */
  private confirmCardSetup(cardholderName: string): Observable<string> {
    return this.paymentService.getIntentToken()
      .pipe(
        switchMap(token => {
          const data = {
            payment_method: {
              card: this.stripeCardElement,
              billing_details: {
                name: cardholderName,
              },
            },
          };
          return from(((this.stripeApi as any).confirmCardSetup(token.clientSecret, data) as Promise<stripe.SetupIntentResponse>));
        }),
        map((response: stripe.SetupIntentResponse) => {
          if (response.error != null) {
            throw new Error(response.error.message);
          }
          return response.setupIntent.payment_method;
        }),
      );
  }

  private getStripeStyles(): stripe.elements.ElementsOptions['style'] {
    const elementComputedStyles = getComputedStyle(this.stripeAnchorElementRef.nativeElement);
    const primaryColor = elementComputedStyles.getPropertyValue('--primary-font-color');
    const primaryFont = elementComputedStyles.getPropertyValue('--primary-font');
    const primaryFontSize = elementComputedStyles.getPropertyValue('--primary-font-size');
    const errorColor = elementComputedStyles.getPropertyValue('--error-color');

    const base: stripe.elements.Style = {
      color: primaryColor,
      fontFamily: primaryFont,
      fontSize: primaryFontSize,
    };

    const invalid: stripe.elements.Style = {
      ...base,
      color: errorColor,
    };

    return {
      base,
      invalid,
    };
  }
}

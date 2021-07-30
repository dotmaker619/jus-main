import { Directive, ElementRef, OnInit, Input, ChangeDetectorRef, Host } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, tap, takeUntil, startWith } from 'rxjs/operators';

import { DestroyableBase } from '../../core';
import { LocationService, PlaceAutocomplete, MapEventListener, PlaceResult } from '../../core/services/location.service';

/**
 * Form control directive to display autocomplete with locations.
 */
@Directive({
  selector: '[jlcLocationAutocomplete]',
})
export class LocationAutocompleteDirective extends DestroyableBase implements OnInit {

  private autocompleteListener: MapEventListener;

  /**
   * Autocomplete type.
   */
  @Input()
  public autocompleteType = 'address';

  /**
   * @constructor
   *
   * @param locationService Location service.
   * @param searchElementRef Autocomplete input element.
   * @param ngControl Angular form control.
   */
  constructor(
    private readonly locationService: LocationService,
    private readonly searchElementRef: ElementRef<HTMLInputElement>,
    private readonly ngControl: NgControl,
    @Host() private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  /**
   * @inheritDoc
   */
  public ngOnInit(): void {
    this.ngControl.valueAccessor.registerOnChange(value => {
      // Override original callback because we will handle it.
      if (value == null || value === '') {
        this.ngControl.control.setValue(null, { emitModelToViewChange: false });
      }
    });

    this.ngControl.control.valueChanges
      .pipe(
        startWith(this.ngControl.control.value),
        tap((value: PlaceResult) => {
          const accessorValue = value == null
            ? ''
            : value.formatted_address;
          this.ngControl.valueAccessor.writeValue(accessorValue);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.locationService.initPlaceAutocomplete(this.searchElementRef.nativeElement, this.autocompleteType)
      .pipe(
        switchMap((autocomplete: PlaceAutocomplete) => this.placeChangeStream(autocomplete)),
        tap(place => {
          this.ngControl.control.setValue(place, { emitModelToViewChange: false});
          this.ngControl.control.markAsDirty();
          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  /**
   * @inheritdoc
   */
  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.autocompleteListener.remove();
  }

  private placeChangeStream(autocomplete: PlaceAutocomplete): Observable<PlaceResult> {
    return new Observable(observer => {
      this.autocompleteListener = autocomplete.addListener('place_changed', () => {
        const placeResult = autocomplete.getPlace();
        observer.next(placeResult);
      });
    });
  }
}

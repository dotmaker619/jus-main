import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { tap, startWith } from 'rxjs/operators';

/** Displays validation errors on inputs. */
@Directive({
  selector: '[jlcInputStatus]',
})
export class InputStatusDirective implements OnDestroy, OnInit {

  private statusSubscription: Subscription;

  constructor(private el: ElementRef<HTMLInputElement>, private control: NgControl) {
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    // TODO: (Danil) Improve handling - use not only `statusChanges`.
    this.statusSubscription = this.control.statusChanges
      .pipe(
        startWith(null), // To display init status.
        tap(() => {
          if (this.control.valid) {
            this.el.nativeElement.classList.add('jlc-validation-icon-correct');
            this.el.nativeElement.classList.remove('jlc-validation-icon-incorrect');

          } else {
            this.el.nativeElement.classList.add('jlc-validation-icon-incorrect');
            this.el.nativeElement.classList.remove('jlc-validation-icon-correct');
          }
        })).subscribe();
  }

  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.statusSubscription.unsubscribe();
  }

}

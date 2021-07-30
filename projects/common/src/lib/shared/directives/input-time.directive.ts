import { Directive, HostBinding, ElementRef, HostListener } from '@angular/core';

/** Input time directive. */
@Directive({
  selector: '[jlcInputTime]',
})
export class InputTimeDirective {

  /** Default placeholder */
  @HostBinding('placeholder')
  public placeholder = 'hh:mm';

  private readonly specialKeys = [ 'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight' ];

  /** Set mask on input on keydown */
  @HostListener('keydown', ['$event'])
  public transform(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Allow special keys
    if (this.specialKeys.includes(event.key)) {
      return;
    }

    // Prevent more than five symbols ('hh:mm' = 5 symbols)
    if (value && value.length === 5) {
      event.preventDefault();
      return;
    }

    // Only allow numbers input
    if (event.key.match(/\d/)) {
      // Insert ':' after two numbers (result would be 11:).
      if (value && value.length === 1) {
        event.preventDefault();
        input.value = input.value + event.key + ':';
      }

      // 11:X0
      // Forbid to set 6 and more on position X because you can't specify more than 59 minutes
      if (value && value.length === 3) {
        if (+event.key > 5) {
          event.preventDefault();
        }
      }
    } else {
      event.preventDefault();
    }

  }
}

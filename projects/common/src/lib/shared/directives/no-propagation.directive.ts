import { Directive, HostListener } from '@angular/core';

/** Directive stops propagation after mouse event. */
@Directive({
  selector: '[jlcNoPropagation]',
})
export class NoPropagationDirective {
  /** Stop propagation on click. */
  @HostListener('click', ['$event'])
  public stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}

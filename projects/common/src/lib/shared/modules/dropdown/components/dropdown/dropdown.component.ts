import { Component, ChangeDetectionStrategy, HostListener, ElementRef, Input } from '@angular/core';

/** Dropdown component. */
@Component({
  selector: 'jlc-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent {
  /** Custom right offset of dropdown content */
  @Input() public customRightOffset: number;

  /** Dropdown triangle right offset. */
  public readonly DROPDOWN_TRIANGLE_RIGHT_OFFSET = 24;

  /** Dropdown triangle width. */
  public readonly DROPDOWN_TRIANGLE_WIDTH = 18;

  /** Is dropdown content open. */
  public isOpen = false;

  /** Right offset of dropdown content. */
  public rightOffset = 0;

  /** @constructor */
  constructor(private elementRef: ElementRef) {}

  /**
   * Toggle dropdown content.
   * TODO: maybe we should use 'angular/cdk/overlay' in the future
   * @param event
   * */
  public onToggle(event: Event): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      const element = event.target as HTMLElement;

      this.rightOffset =
        this.customRightOffset !== undefined
          ? this.customRightOffset
          : this.calculateRightOffset(element.clientWidth);
    }
  }

  /** On click outside the dropdown. */
  @HostListener('document:click', ['$event.target'])
  public onClickOutside(target: HTMLElement): void {
    if (this.isOpen) {
      const clickedInside = this.elementRef.nativeElement.contains(target);

      if (!clickedInside) {
        this.isOpen = false;
      }
    }
  }

  private calculateRightOffset(toggleWidth: number): number {
    return (toggleWidth / 2) - this.DROPDOWN_TRIANGLE_RIGHT_OFFSET - (this.DROPDOWN_TRIANGLE_WIDTH / 2);
  }
}

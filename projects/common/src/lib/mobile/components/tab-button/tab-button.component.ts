import { Component, ChangeDetectionStrategy, Input, HostListener, ElementRef, EventEmitter, ChangeDetectorRef, } from '@angular/core';

/**
 * Tab button component. Might also be used as simple buttons, to make tab active set `isActive` to true.
 *
 * Due to the bug (https://github.com/ionic-team/ionic/issues/18197),
 *  tab-button might not be used with relative links because ionic's router
 *  breaks relative links when using nested routing.
 */
@Component({
  selector: 'jlc-tab-button',
  templateUrl: './tab-button.component.html',
  styleUrls: ['./tab-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabButtonComponent {
  /** Tab route (optional). */
  @Input()
  public absoluteLink: string;

  /** Should display badge. */
  @Input()
  public showBadge = false;

  /** Count of items. */
  @Input()
  public count?: number;

  /** Tab ID. */
  @Input()
  public tab: string;

  /** Click emitter. */
  public selected = new EventEmitter<string>();

  /** Is tab active. */
  public isActiveValue = false;

  /** Is tab active. */
  public get isActive(): boolean {
    return this.isActiveValue;
  }

  /** Set button activeness. */
  public set isActive(v: boolean) {
    this.isActiveValue = v;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * @constructor
   *
   * @param el Element reference.
   * @param changeDetectorRef Change detector.
   */
  public constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  /** On click event. */
  @HostListener('click')
  public onClick(): void {
    this.el.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'end',
    });

    this.selected.next(this.id);
  }

  /** Get tab id. */
  public get id(): string {
    return this.tab || this.el.nativeElement.innerText || null;
  }
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

export type LoadingMode = 'inline' | 'fullscreen' | 'fullsize';

/**
 * Shows centered loading spinner.
 * Modes:
 * inline - display at a place with `display: flex`;
 * fullscreen - show full screen (`display: fixed`);
 * fullsize - show to full size of parent. Loading indicator will be at center.
 */
@Component({
  selector: 'jlc-loading',
  templateUrl: 'loading.component.html',
  styleUrls: [
    './loading.component.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
  private modesWithBackdrop: LoadingMode[] = [
    'fullscreen',
    'fullsize',
  ];

  /**
   * Is full screen mode.
   */
  @Input()
  public mode: LoadingMode = 'inline';

  /**
   * Spinner diameter
   */
  @Input()
  public diameter = 100;

  /**
   * Loading process description.
   */
  @Input()
  public message = '';

  /**
   * Should backdrop be displayed.
   */
  public get displayBackdrop(): boolean {
    return this.modesWithBackdrop.includes(this.mode);
  }
}

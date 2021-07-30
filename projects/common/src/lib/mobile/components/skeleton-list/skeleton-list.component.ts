import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/** Skeleton list component. Used to show to the user that list is loading. */
@Component({
  selector: 'jlc-skeleton-list',
  templateUrl: './skeleton-list.component.html',
  styleUrls: ['./skeleton-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonListComponent {
  /** Number of items in skeleton list. */
  @Input()
  public itemsCount = 3;

  /** Array to iterate through *ngFor. */
  public get skeletonArray(): number[] {
    return [...Array(this.itemsCount).keys()];
  }
}

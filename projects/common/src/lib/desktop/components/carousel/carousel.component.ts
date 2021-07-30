import { Component, ChangeDetectionStrategy, Input, TemplateRef, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, take } from 'rxjs/operators';

/**
 * Carousel component.
 *
 * @example
 * ```html
 * <div class="attorneys">
 *   <jlc-carousel
 *     [collection]="items"
 *     [groupSize]="4"
 *     [itemTemplate]="listItem"
 *     [trackFn]="trackByFn"
 *     header="Header"
 *   ></jlc-carousel>
 * </div>
 *
 * <ng-template #listItem let-entity>
 *   <div>
 *     {{ entity.someField }}
 *   </div>
 * </ng-template>
 * ```
 */
@Component({
  selector: 'jlc-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JlpCarouselComponent implements OnChanges {
  /** Items list. */
  @Input()
  public collection: Array<unknown>;
  /** Group size. */
  @Input()
  public groupSize = 4;
  /** Template is used as list item. */
  @Input()
  public itemTemplate: TemplateRef<unknown>;
  /** Carousel header. */
  @Input()
  public header = '';
  /** TrackBy function. */
  @Input()
  public trackFn: (_: number, item: unknown) => unknown;
  /** Grouped items. */
  public groupedItems: unknown[][];

  private readonly selectedTab$ = new BehaviorSubject<number>(0);
  /**
   * Index of selected tab.
   */
  public readonly tabChange$: Observable<number> = this.selectedTab$.pipe(distinctUntilChanged());

  /**
   * @constructor
   * @param el Element ref.
   */
  public constructor(private readonly el: ElementRef) { }

  /** Are scroll buttons shown */
  public get areButtonsShown(): boolean {
    return this.collection && this.collection.length > this.groupSize;
  }

  /** @inheritdoc */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.collection && changes.collection.currentValue && this.groupSize) {
      this.groupedItems = this.groupItemsByN(this.collection, this.groupSize);
      this.el.nativeElement.style.setProperty('--group-size', this.groupSize);
    }
    if (!changes.trackFn && !this.trackFn) {
      throw new Error('TrackBy function has to be passed');
    }
  }

  /** Select tab by index */
  public selectTab(index: number): void {
    this.selectedTab$.next(index);
  }

  /** Swipe attorneys to left */
  public swipeToLeft(): void {
    this.selectedTab$.pipe(take(1)).subscribe(index => this.swipe(index - 1));
  }

  /** Swipe attorneys to right */
  public swipeToRight(): void {
    this.selectedTab$.pipe(take(1)).subscribe(index => this.swipe(index + 1));
  }

  private swipe(newIndex: number): void {
    if (newIndex >= 0 && this.groupedItems.length > newIndex) {
      this.selectTab(newIndex);
    }
  }

  /**
   * Divide elements into groups by N.
   *
   * @param items List of items.
   * @param n Size of group.
   */
  private groupItemsByN(items: Array<unknown>, n: number): any[][] {
    return items.reduce<unknown[][]>((groups, item) => {
      const group = groups[groups.length - 1];

      if (group && group.length < n) {
        group.push(item);
      } else {
        groups.push([item]);
      }

      return groups;
    }, []);
  }
}

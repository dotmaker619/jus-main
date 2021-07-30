import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/**
 * Pagination shortcut component.
 */
@Component({
  selector: 'jlc-pagination-shortcut',
  templateUrl: './pagination-shortcut.component.html',
  styleUrls: ['./pagination-shortcut.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationShortcutComponent {
  /** Items per page to calculate number of pages. */
  @Input()
  public itemsPerPage = 10;
  /** Number of items. */
  @Input()
  public itemsCount = 0;
  /** Link to navigate. */
  @Input()
  public link: (number|string)[];

  private readonly MAX_BUTTONS_COUNT = 6;

  /** Blank value in pages array. */
  public readonly BLANK = undefined;

  /** Numbers of pages to display. */
  public get displayPages(): number[] {
    const pagesCount = Math.ceil(this.itemsCount / this.itemsPerPage);
    if (pagesCount <= 1) {
      return [];
    }

    // If pagination array length more than MAX_BUTTONS_COUNT
    if (pagesCount > this.MAX_BUTTONS_COUNT) {
      // Reduce it to be like 1 ... 5,6,7 ... 11
      return this.getReducedPagesArray(pagesCount);
    }

    return [...Array(pagesCount).keys()];
  }

  private getReducedPagesArray(pagesCount: number): number[] {
    // Making pagination array looking like 0,1,2,3,4,5...n
    const pages = [...Array(pagesCount).keys()];

    // Finding pivot of pages array
    const pivot = Math.floor(pages.length / 2);

    // Finding range of tolerance from pivot
    // (for example, if the range is 2 it will look like 1 ... k-2, k-1, k, k+1, k+2 ... n)
    const range = Math.floor(this.MAX_BUTTONS_COUNT / 2) - 1;

    // Add center (k-2, k-1, k, k+1, k+2 for the case above)
    const newPages = pages.slice(pivot - range, pivot + range);

    // Add pagination elipses on both sides
    newPages.unshift(this.BLANK);
    newPages.push(this.BLANK);

    // Add last and first pages (1 ... n)
    newPages.unshift(0);
    newPages.push(pages.length - 1);

    return newPages;
  }
}

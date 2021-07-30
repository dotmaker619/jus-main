import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

/** Paginator component */
@Component({
  selector: 'jlc-forum-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent implements OnInit {
  /** Current page. */
  @Input() public currentPage = 0;
  /** Number of pages. */
  @Input() public pagesCount: number;

  /** Page change emitter. */
  @Output() public pageChange = new EventEmitter<number>();

  /** Blank value in pages array. */
  public readonly BLANK = undefined;

  /** Number of buttons in paginator. */
  @Input() public buttonsCount = 5;

  /** Numbers of pages to display. */
  public get displayPages(): number[] {
    if (this.pagesCount > this.buttonsCount) {
      return this.getReducedPagesArray();
    }

    return [...Array(this.pagesCount).keys()];
  }

  private getReducedPagesArray(): number[] {
    const pages = [...Array(this.pagesCount).keys()];

    const leftOffset = this.currentPage + 1;
    const rightOffset = this.pagesCount - this.currentPage;

    let newPages;
    if (leftOffset < this.buttonsCount - 1) {
      // Covers cases like 1,2,3,4 ... 10.
      newPages = pages.slice(0, this.buttonsCount - 1);
      newPages.push(this.BLANK);
      newPages.push(this.pagesCount - 1);
    } else if (rightOffset < this.buttonsCount - 1) {
      // Covers cases like 1 ... 7,8,9,10.
      newPages = pages.slice(
        this.pagesCount - this.buttonsCount + 1,
        this.pagesCount,
      );
      newPages.unshift(this.BLANK);
      newPages.unshift(0);
    } else {
      // Covers cases like 1 ... 5,6,7 ... 10.
      const currentPageIdx = pages.indexOf(this.currentPage);
      const buttonsRange = Math.floor(this.buttonsCount / 2);

      newPages = pages.slice(
        currentPageIdx - buttonsRange + 1,
        currentPageIdx + buttonsRange,
      );

      // Add first page and blank space.
      newPages.unshift(this.BLANK);
      newPages.unshift(0);

      // Add last page and blank space.
      newPages.push(this.BLANK);
      newPages.push(this.pagesCount - 1);
    }

    return newPages;
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    if (this.pagesCount == null) {
      throw new TypeError('The pageCount is required');
    }
  }

  /** Emit next page. */
  public onClickNext(): void {
    this.pageChange.emit(this.currentPage + 1);
  }

  /** Emit previous page. */
  public onClickPrev(): void {
    this.pageChange.emit(this.currentPage - 1);
  }

  /** Emit page number. */
  public onClickPage(pageNumber: number): void {
    this.pageChange.emit(pageNumber);
  }

  /** TrackBy function. */
  public trackByValue(_: number, value: number): number {
    return value;
  }

  /** Is page last. */
  public isLastPage(page: number): boolean {
    return page === this.pagesCount - 1;
  }
}

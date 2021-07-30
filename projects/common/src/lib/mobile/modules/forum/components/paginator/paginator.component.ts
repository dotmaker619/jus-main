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

  /** TrackBy function. */
  public trackByValue(_: number, value: number): number {
    return value;
  }

  /** Is page last. */
  public isLastPage(page: number): boolean {
    return page === this.pagesCount - 1;
  }
}

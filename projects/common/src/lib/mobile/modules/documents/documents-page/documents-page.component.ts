import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

/** Documents page component. Used in mobile workspace. */
@Component({
  selector: 'jlc-documents-page',
  templateUrl: './documents-page.component.html',
  styleUrls: ['./documents-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsPageComponent {

  /** Should display searchbar. */
  public shouldDisplaySearchbar = false;

  /**
   * @constructor
   * @param router Router.
   */
  public constructor(
    private readonly router: Router,
  ) { }

  /** On search button click. */
  public onSearchClick(): void {
    this.shouldDisplaySearchbar = !this.shouldDisplaySearchbar;
    if (!this.shouldDisplaySearchbar) {
      this.onSearchChange(void 0);
    }
  }

  /** On search query change. */
  public onSearchChange(query: string): void {
    this.router.navigate([], {
      queryParams: {
        query,
      },
    });
  }
}

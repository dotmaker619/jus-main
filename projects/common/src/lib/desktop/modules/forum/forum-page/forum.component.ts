import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { Router } from '@angular/router';

/** Forum page component */
@Component({
  selector: 'jlc-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumComponent {
  /**
   * @constructor
   * @param router
   */
  public constructor(private router: Router) {}

  /** Show topic search results. */
  public onTopicSearchChange(query: string): void {
    this.router.navigate(['/forum/topics'], {
      queryParams: { query },
    });
  }

  /** Close search topics component on ESC keydown. */
  @HostListener('document:keydown.escape')
  public onKeydownHandler(): void {
    this.router.navigateByUrl('/forum');
  }
}

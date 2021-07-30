import { Component, ChangeDetectionStrategy, ContentChildren, QueryList, EventEmitter, AfterViewInit, Output } from '@angular/core';
import { DestroyableBase } from '@jl/common/core';
import { merge } from 'rxjs';
import { takeUntil, startWith } from 'rxjs/operators';

import { TabButtonComponent } from '../tab-button/tab-button.component';

/**
 * Custom tab bar component. Provides tab-bar navigation without displaying content.
 */
@Component({
  selector: 'jlc-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabBarComponent extends DestroyableBase implements AfterViewInit {
  /** Tab buttons. */
  @ContentChildren(TabButtonComponent)
  public buttons: QueryList<TabButtonComponent>;

  /** On click event. */
  @Output()
  public tabChange = new EventEmitter<string>();

  /** @inheritdoc */
  public ngAfterViewInit(): void {
    const initialTab = this.buttons.toArray()[0];
    const tabSelect$ = merge(...this.buttons.map(button => button.selected));

    tabSelect$.pipe(
      startWith(initialTab ? initialTab.id : null),
      takeUntil(this.destroy$),
    ).subscribe((selectedTab: string) => {
      this.tabChange.next(selectedTab);
      this.markTabSelected(selectedTab);
    });
  }

  private markTabSelected(tabId: string): void {
    this.buttons.toArray().forEach(button => {
      if (button.id === tabId) {
        button.isActive = true;
      } else {
        button.isActive = false;
      }
    });
  }
}

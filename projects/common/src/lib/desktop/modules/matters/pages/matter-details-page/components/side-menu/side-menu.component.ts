import { Component, OnInit, ChangeDetectionStrategy, ElementRef, Output, EventEmitter, OnDestroy, HostBinding } from '@angular/core';
import { Subscription } from 'rxjs';

/** Side menu component */
@Component({
  selector: 'jlc-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponent implements OnDestroy {

  /** Change state event emitter. */
  @Output()
  public stateChanged = new EventEmitter<'close' | 'open'>();

  private stateChangeSubscription: Subscription;

  /** Display property of component. */
  @HostBinding('style.display')
  public display: 'none' | 'block';

  /**
   * @constructor
   * @param el
   */
  public constructor() {
    this.stateChangeSubscription = this.stateChanged.subscribe((event) => {
      if (event === 'close') {
        this.display = 'none';
      } else if (event === 'open') {
        this.display = 'block';
      } else {
        throw TypeError(`No ${event} state for SideMenuComponent.`);
      }
    });
  }

  /** Close menu. */
  public close(): void {
    this.stateChanged.emit('close');
  }

  /** Open menu. */
  public open(): void {
    this.stateChanged.emit('open');
  }

  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.stateChangeSubscription.unsubscribe();
  }

}

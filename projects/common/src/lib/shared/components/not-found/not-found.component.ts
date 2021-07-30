import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

const DEFAULT_BUTTON_TEXT = 'Go to Dashboard';

/** 404 page. */
@Component({
  selector: 'jlc-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  /** Link text. */
  public readonly linkText: string;
  public constructor(
    activatedRoute: ActivatedRoute,
  ) {
    this.linkText = activatedRoute.snapshot.data.linkText || DEFAULT_BUTTON_TEXT;
  }
}

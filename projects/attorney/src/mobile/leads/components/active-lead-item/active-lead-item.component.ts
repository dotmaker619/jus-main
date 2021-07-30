import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { LeadChatInfo } from '@jl/common/core/models';

/**
 * Active lead list item component.
 */
@Component({
  selector: 'jlat-active-lead-item',
  templateUrl: './active-lead-item.component.html',
  styleUrls: ['./active-lead-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveLeadItemComponent {
  /** Active lead. */
  @Input()
  public lead: LeadChatInfo;

  /** Default routerLink param. */
  @Input()
  public routerLink: string | string[];
}

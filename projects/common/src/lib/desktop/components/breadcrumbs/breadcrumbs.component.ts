import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Link } from '@jl/common/core/models';

/** UI component for displaying breadcrumbs. */
@Component({
  selector: 'jlc-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {

  /** Ordered list of links we want to display as a breadcrumb. */
  @Input()
  public links: Link[];

}

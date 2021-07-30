import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Matter } from '@jl/common/core/models';

/**
 * Active matters list.
 */
@Component({
  selector: 'jlat-dashboard-active-matters-list',
  templateUrl: './dashboard-active-matters-list.component.html',
  styleUrls: ['./dashboard-active-matters-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardActiveMattersListComponent {

  /**
   * List title.
   */
  @Input()
  public title: string;

  /**
   * Active matters.
   */
  @Input()
  public matters: Matter[] = [];

  /**
   * Track matters by ID.
   *
   * @param matter Matter.
   */
  public trackByMatterId(_: number, matter: Matter): number {
    return matter.id;
  }

}

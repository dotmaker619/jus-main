import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RecentActivityBase } from '@jl/common/shared/base-components/dashboard/recent-activity.base';

/** Recent activity component for dashboard */
@Component({
  selector: 'jlc-recent-activity',
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentActivityComponent extends RecentActivityBase {

}

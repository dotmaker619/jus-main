import { Link } from '@jl/common/core/models';
import { Observable } from 'rxjs';

/** Link with badge model. */
export interface LinkWithBadge extends Link {
  /** Badge for display notifications. */
  badge?: string;
}

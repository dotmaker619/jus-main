import { ClientType } from '../models/client';
import { VerificationStatus } from '../models/verification-status';

import { AuthorDto } from './author-dto';
import { ForumStatsDto } from './forum-stats-dto';

/**
 * DTO for author of forum post.
 */
export interface ForumPostAuthorDto extends AuthorDto {
  /** Joined data. */
  date_joined: string;
  /** Last login. */
  last_login: string;
  /** Forum stats. */
  forum_stats: ForumStatsDto;
  /** Verification status. */
  verification_status: VerificationStatus;
  /** Client type. */
  client_type: ClientType | null;
  /** Organization name. */
  organization_name: string | null;
  /** Created. */
  created: string;
  /** Modified. */
  modified: string;
  /** Active subscription. */
  active_subscription: number | null;
  /** Specialities. */
  specialities: number[];
}

import { Injectable } from '@angular/core';

import { ForumPostAuthorDto } from '../dto/forum-post-author-dto';
import { ForumPostAuthor } from '../models/forum-post-author';

import { ForumStatsMapper } from './forum-stats.mapper';
import { IMapper } from './mapper';

/** Forum post author mapper. */
@Injectable({ providedIn: 'root' })
export class ForumPostAuthorMapper implements IMapper<ForumPostAuthorDto, ForumPostAuthor> {
  private readonly forumStatsMapper = new ForumStatsMapper();

  /** @inheritdoc */
  public fromDto(data: ForumPostAuthorDto): ForumPostAuthor {
    return new ForumPostAuthor({
      avatar: data.avatar,
      email: data.email,
      firstName: data.first_name,
      activeSubscription: data.active_subscription,
      clientType: data.client_type,
      created: data.created,
      dateJoined: data.date_joined,
      forumStats: this.forumStatsMapper.fromDto(data.forum_stats),
      id: data.id,
      lastLogin: data.last_login,
      modified: data.modified,
      organizationName: data.organization_name,
      verificationStatus: data.verification_status,
      specialties: data.specialities,
      lastName: data.last_name,
    });
  }

  /** @inheritdoc */
  public toDto(data: ForumPostAuthor): ForumPostAuthorDto {
    return {
      id: data.id,
      date_joined: data.dateJoined,
      last_login: data.lastLogin,
      forum_stats: this.forumStatsMapper.toDto(data.forumStats),
      created: data.created,
      modified: data.modified,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      avatar: data.avatar,
      verification_status: data.verificationStatus,
      active_subscription: data.activeSubscription,
      client_type: data.clientType,
      organization_name: data.organizationName,
      specialities: data.specialties,
    };
  }
}

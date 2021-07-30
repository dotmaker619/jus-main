import { Injectable } from '@angular/core';
import { ForumStatsDto } from '@jl/common/core/dto';
import { IMapper } from '@jl/common/core/mappers/mapper';
import { ForumStats } from '@jl/common/core/models';

/** Forum stats mapper. */
@Injectable({ providedIn: 'root' })
export class ForumStatsMapper implements IMapper<ForumStatsDto, ForumStats> {
  /** @inheritdoc */
  public fromDto(forumStats: ForumStatsDto): ForumStats {
    if (forumStats === null || forumStats === undefined) {
      return null;
    }
    return new ForumStats({
      postsCount: forumStats.post_count,
    });
  }

  /** @inheritdoc */
  public toDto(data: ForumStats): ForumStatsDto {
    return {
      post_count: data.postsCount,
    };
  }
}

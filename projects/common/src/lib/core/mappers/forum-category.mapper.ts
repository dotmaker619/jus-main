import { Injectable } from '@angular/core';
import { ForumCategoryDto } from '@jl/common/core/dto/forum-category-dto';
import { IMapper } from '@jl/common/core/mappers/mapper';
import { PostMapper } from '@jl/common/core/mappers/post.mapper';
import { ForumCategory } from '@jl/common/core/models/forum-category';

/** Forum category mapper. */
@Injectable({ providedIn: 'root' })
export class ForumCategoryMapper
  implements IMapper<ForumCategoryDto, ForumCategory> {
  private postMapper = new PostMapper();

  /** @inheritdoc */
  public fromDto(category: ForumCategoryDto): ForumCategory {
    if (category === null || category === undefined) {
      return null;
    }
    return new ForumCategory({
      created: category.created,
      description: category.description,
      icon: category.icon,
      id: category.id,
      lastPost: this.postMapper.fromDto(category.last_post),
      modified: category.modified,
      postCount: category.post_count,
      title: category.title,
      topicCount: category.topic_count,
    });
  }
  /** @inheritdoc */
  public toDto(data: ForumCategory): ForumCategoryDto {
    return {
      created: data.created,
      description: data.description,
      icon: data.icon,
      id: data.id,
      last_post: this.postMapper.toDto(data.lastPost),
      modified: data.modified,
      post_count: data.postCount,
      title: data.title,
      topic_count: data.topicCount,
    };
  }
}

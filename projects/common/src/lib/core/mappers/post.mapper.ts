import { Injectable } from '@angular/core';
import { PostDto } from '@jl/common/core/dto';
import { IMapper } from '@jl/common/core/mappers/mapper';
import { Post } from '@jl/common/core/models';

import { ForumPostAuthorMapper } from './forum-post-author.mapper';

/**
 * Post mapper.
 */
@Injectable({
  providedIn: 'root',
})
export class PostMapper implements IMapper<PostDto, Post> {

  private readonly authorMapper = new ForumPostAuthorMapper();

  /**
   * @inheritdoc
   */
  public fromDto(post: PostDto): Post {
    if (post === null || post === undefined) {
      return null;
    }
    return new Post({
      author: this.authorMapper.fromDto(post.author),
      created: post.created,
      id: post.id,
      modified: post.modified ? post.modified : post.created,
      text: post.text,
      topicId: post.topic,
      userType: post.user_type,
      position: post.position,
    });
  }

  /**
   * @inheritdoc
   */
  public toDto(data: Post): PostDto {
    if (data == null) {
      return null;
    }
    return {
      author: data.author ? this.authorMapper.toDto(data.author) : null,
      created: data.created,
      id: data.id,
      modified: data.modified,
      text: data.text,
      topic: data.topicId,
      user_type: data.userType,
    };
  }
}

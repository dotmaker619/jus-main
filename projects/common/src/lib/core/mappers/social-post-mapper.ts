import { Injectable } from '@angular/core';

import { SocialPostDto } from '../dto/social-post-dto';
import { SocialPost } from '../models/social-post';

import { IMapper } from './mapper';
import { SocialPostAuthorMapper } from './social-post-author-mapper';

/**
 * Social post mapper.
 */
@Injectable({ providedIn: 'root' })
export class SocialPostMapper implements IMapper<SocialPostDto, SocialPost> {
  /**
   * @constructor
   *
   * @param authorMapper Social post author mapper.
   */
  public constructor(
    private readonly authorMapper: SocialPostAuthorMapper,
  ) { }

  /** @inheritdoc */
  public fromDto(dto: SocialPostDto): SocialPost {
    return new SocialPost({
      author: dto.author,
      body: dto.body,
      authorData: this.authorMapper.fromDto(dto.author_data),
      id: dto.id,
      image: dto.image,
      preview: dto.body_preview,
      title: dto.title,
      imageThumbnail: dto.image_thumbnail,
      created: new Date(dto.created),
      modified: new Date(dto.modified),
    });
  }

  /** @inheritdoc */
  public toDto(domain: SocialPost): SocialPostDto {
    return {
      id: domain.id || null,
      author: domain.author,
      image: domain.image,
      body: domain.body,
      body_preview: domain.preview,
      title: domain.title,
    } as SocialPostDto;
  }
}

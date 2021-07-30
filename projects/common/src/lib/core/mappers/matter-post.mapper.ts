import { Injectable } from '@angular/core';

import { AuthorDto } from '../dto/author-dto';
import { MatterPostDto } from '../dto/matter-post-dto';
import { MatterPost } from '../models/matter-post';

import { AuthorMapper } from './author.mapper';
import { MapperFromDto } from './mapper';

/** Matter post mapper. */
@Injectable({ providedIn: 'root' })
export class MatterPostMapper implements MapperFromDto<MatterPostDto, MatterPost> {
  /** @constructor */
  public constructor(
    private readonly authorMapper: AuthorMapper,
  ) { }

  /** @inheritdoc */
  public fromDto(data: MatterPostDto): MatterPost {
    return data
      ? new MatterPost({
        id: data.id,
        topic: data.topic,
        author: this.authorMapper.fromDto(data.author as AuthorDto),
        text: data.text,
        created: new Date(data.created),
        modified: new Date(data.modified),
      })
      : null;
  }
}

import { Injectable } from '@angular/core';
import { IMapper } from '@jl/common/core/mappers/mapper';

import { AuthorDto } from '../dto/author-dto';
import { Author } from '../models/author';

/** Author mapper. */
@Injectable({ providedIn: 'root' })
export class AuthorMapper implements IMapper<AuthorDto, Author> {
  /** @inheritdoc */
  public fromDto(author: AuthorDto): Author {
    if (author === null || author === undefined) {
      return null;
    }

    return new Author({
      id: author.id,
      firstName: author.first_name,
      lastName: author.last_name,
      email: author.email,
      avatar: author.avatar,
    });
  }

  /** @inheritdoc */
  public toDto(data: Author): AuthorDto {
    if (data == null) {
      return null;
    }
    return {
      id: data.id,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      avatar: data.avatar,
    };
  }
}

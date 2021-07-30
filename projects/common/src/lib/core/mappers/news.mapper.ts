import { Injectable } from '@angular/core';

import { NewsDto } from '../dto/news-dto';
import { ValidationErrorDto } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { News } from '../models/news';

import { MapperWithErrors } from './mapper';

/** News mapper. */
@Injectable({ providedIn: 'root' })
export class NewsMapper implements MapperWithErrors<NewsDto, News> {

  /** @inheritdoc */
  public fromDto(data: NewsDto): News {
    return new News({
      created: new Date(data.created),
      categories: data.categories,
      description: data.description,
      id: data.id,
      image: data.image,
      modified: new Date(data.modified),
      tags: data.tags,
      thumbnail: data.image_thumbnail,
      title: data.title,
    });
  }

  /** @inheritdoc */
  public toDto(_: News): NewsDto {
    throw new Error('Method is not implemented');
  }

  /** @inheritdoc */
  public validationErrorFromDto(_: ValidationErrorDto<NewsDto>): TEntityValidationErrors<News> {
    throw new Error('Method is not implemented');
  }
}

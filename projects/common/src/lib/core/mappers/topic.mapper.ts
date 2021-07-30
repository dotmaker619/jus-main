import { Injectable } from '@angular/core';
import {TopicDto, ValidationErrorDto} from '@jl/common/core/dto';
import { extractErrorMessage } from '@jl/common/core/dto/validation-error-dto';
import { MapperWithErrors } from '@jl/common/core/mappers/mapper';
import { PostMapper } from '@jl/common/core/mappers/post.mapper';
import { Topic } from '@jl/common/core/models';
import {TEntityValidationErrors} from '@jl/common/core/models/api-error';

/** Topic mapper. */
@Injectable({ providedIn: 'root' })
export class TopicMapper implements MapperWithErrors<TopicDto, Topic> {
  private postMapper = new PostMapper();

  /** @inheritdoc */
  public fromDto(topic: TopicDto): Topic {
    if (topic === null || topic === undefined) {
      return null;
    }
    return new Topic({
      id: topic.id,
      category: topic.category,
      title: topic.title,
      firstPost: this.postMapper.fromDto(topic.first_post),
      lastPost: this.postMapper.fromDto(topic.last_post),
      postCount: topic.post_count,
      followed: topic.followed,
      created: new Date(topic.created),
    });
  }

  /** @inheritdoc */
  public toDto(data: Topic): TopicDto {
    return {
      id: data.id,
      category: data.category,
      title: data.title,
      first_post: this.postMapper.toDto(data.firstPost),
      last_post: this.postMapper.toDto(data.lastPost),
      post_count: data.postCount,
      followed: data.followed,
      message: data.message,
    };
  }

  /** @inheritDoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<TopicDto> | null | undefined): TEntityValidationErrors<Topic> {
    if (errorDto == null) {
      return null;
    }
    return {
      message: extractErrorMessage(errorDto.message),
      category: extractErrorMessage(errorDto.category),
      title: extractErrorMessage(errorDto.title),
    };
  }
}

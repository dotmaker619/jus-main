import { Injectable } from '@angular/core';
import { ActivityDto } from '@jl/common/core/dto/activity-dto';
import { MapperFromDto } from '@jl/common/core/mappers/mapper';
import { Activity } from '@jl/common/core/models/activity';

/** Activity mapper. */
@Injectable({providedIn: 'root'})
export class ActivityMapper implements MapperFromDto<ActivityDto, Activity> {
  /** @inheritdoc */
  public fromDto(data: ActivityDto): Activity {
    if (data == null) {
      return null;
    }
    return new Activity({
      id: data.id,
      title: data.title,
      matter: data.matter,
      matterData: data.matter_data,
      created: data.created,
      modified: data.modified,
    });
  }
}

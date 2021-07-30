import { Injectable } from '@angular/core';
import { StageDto } from '@jl/common/core/dto/stage-dto';
import { IMapper } from '@jl/common/core/mappers/mapper';
import { Stage } from '@jl/common/core/models/stage';

/** Stage mapper. */
@Injectable({providedIn: 'root'})
export class StageMapper implements IMapper<StageDto, Stage> {
  /** @inheritdoc */
  public fromDto(stage: StageDto): Stage {
    if (stage == null) {
      return null;
    }

    return new Stage({
      id: stage.id,
      title: stage.title,
    });
  }

  /** @inheritdoc */
  public toDto(stage: Stage): StageDto {
    return {
      id: stage.id,
      title: stage.title,
    };
  }

}

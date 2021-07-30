import { Injectable } from '@angular/core';
import { ChecklistDto } from '@jl/common/core/dto/checklist-dto';
import { IMapper } from '@jl/common/core/mappers/mapper';
import { ChecklistOption } from '@jl/common/core/models/checklist';

/** Closing checklist mapper. */
@Injectable({ providedIn: 'root' })
export class ChecklistMapper implements IMapper<ChecklistDto, ChecklistOption> {
  /** @inheritdoc */
  public fromDto(stage: ChecklistDto): ChecklistOption {
    if (stage == null) {
      return null;
    }

    return new ChecklistOption({
      id: stage.id,
      description: stage.description,
    });
  }

  /** @inheritdoc */
  public toDto(stage: ChecklistOption): ChecklistDto {
    return {
      id: stage.id,
      description: stage.description,
    };
  }

}

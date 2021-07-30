import { Injectable } from '@angular/core';

import { NoteDto } from '../dto/note-dto';
import { ValidationErrorDto, extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { Note } from '../models/note';

import { ClientMapper } from './client.mapper';
import { MapperWithErrors } from './mapper';
import { MatterMapper } from './matter.mapper';

/** Note mapper. */
@Injectable({providedIn: 'root'})
export class NoteMapper implements MapperWithErrors<NoteDto, Note> {
  private readonly clientMapper = new ClientMapper();
  private readonly matterMapper = new MatterMapper();

  /** @inheritdoc */
  public fromDto(data: NoteDto): Note {
    return new Note({
      created: new Date(data.created),
      modified: new Date(data.modified),
      createdBy: this.clientMapper.fromDto(data.created_by_data),
      id: data.id,
      matter: this.matterMapper.fromDto(data.matter_data),
      text: data.text,
      title: data.title,
    });
  }

  /** @inheritdoc */
  public toDto(data: Note): NoteDto {
    return {
      matter: data.matter && data.matter.id,
      text: data.text,
      title: data.title,
      id: data.id,
    };
  }

  /**
   * @inheritdoc
   */
  public validationErrorFromDto(errorDto: ValidationErrorDto<NoteDto>): TEntityValidationErrors<Note> {
    if (errorDto == null) {
      return null;
    }
    return {
      text: extractErrorMessage(errorDto.text),
      title: extractErrorMessage(errorDto.title),
      matter: extractErrorMessage(errorDto.matter),
    };
  }
}

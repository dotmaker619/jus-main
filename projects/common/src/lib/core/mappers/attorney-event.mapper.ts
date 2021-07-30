import { Injectable } from '@angular/core';
import { MapperWithErrors } from '@jl/common/core/mappers/mapper';
import { AttorneyEvent } from '@jl/common/core/models/attorney-event';
import { DateTime } from 'luxon';

import { ValidationErrorDto } from '../dto';
import { AttorneyEventDto } from '../dto/attorney-event-dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { EventLocation } from '../models/event-location';

/** Event mapper. */
@Injectable({providedIn: 'root'})
export class AttorneyEventMapper implements MapperWithErrors<AttorneyEventDto, AttorneyEvent> {
  /** @inheritdoc */
  public fromDto(eventDto: AttorneyEventDto): AttorneyEvent {
    if (eventDto == null) {
      return null;
    }

    /**
     * For now we get all events in UTC timezone.
     */
    const locationTimezone = 'utc';

    return new AttorneyEvent({
      id: eventDto.id,
      attorneyId: eventDto.attorney,
      title: eventDto.title,
      description: eventDto.description,
      isAllDay: eventDto.is_all_day,
      duration: eventDto.duration,
      location: new EventLocation({
        name: eventDto.location,
        timezone: locationTimezone,
      }),
      start: new Date(eventDto.start),
      end: new Date(eventDto.end),
    });
  }

  /** @inheritdoc */
  public toDto(event: AttorneyEvent): AttorneyEventDto {
    const timezone = event.location.timezone || 'local';

    return {
      id: event.id,
      attorney: event.attorneyId,
      title: event.title,
      description: event.description,
      is_all_day: event.isAllDay,
      duration: event.duration,
      location: event.location.name,
      // Send a date with timezone offset.
      start: DateTime.fromJSDate(event.start).setZone(timezone).toISO(),
      end: DateTime.fromJSDate(event.end).setZone(timezone).toISO(),
    };
  }

  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<AttorneyEventDto> | null | undefined): TEntityValidationErrors<AttorneyEvent> {
    if (!errorDto) {
      return null;
    }
    return {
      title: extractErrorMessage(errorDto.title),
      start: extractErrorMessage(errorDto.start),
      end: extractErrorMessage(errorDto.end),
      isAllDay: extractErrorMessage(errorDto.is_all_day),
      location: extractErrorMessage(errorDto.location),
      description: extractErrorMessage(errorDto.description),
    };
  }
}

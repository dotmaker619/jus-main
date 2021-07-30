import { ValidationErrorDto } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';

/**
 * Mapper of DTO to domain model.
 */
export interface MapperFromDto<TDto, TDomain> {
  /**
   * Maps from DTO to Domain model.
   */
  fromDto(data: TDto): TDomain;
}

/**
 * Mapper of domain model to DTO.
 */
export interface MapperToDto<TDto, TDomain> {
/**
   * Maps from Domain to DTO model.
   */
  toDto(data: TDomain): TDto;
}

/**
 * Mapper of errors of DTO to domain model errors.
 */
export interface ValidationErrorMapper<TDto, TDomain> {
/**
   * Map validation error DTO to error for domain model.
   * @param errorDto Error DTO.
   */
  validationErrorFromDto(errorDto: ValidationErrorDto<TDto> | null | undefined): TEntityValidationErrors<TDomain>;
}

/**
 * Mapper of DTO to domain model with errors mapping support.
 */
export interface MapperFromDtoWithErrors<TDto, TDomain> extends MapperFromDto<TDto, TDomain>, ValidationErrorMapper<TDto, TDomain> {
}

/**
 * Mapper of domain model to DTO with errors mapping support.
 */
export interface MapperToDtoWithErrors<TDto, TDomain> extends MapperToDto<TDto, TDomain>, ValidationErrorMapper<TDto, TDomain> {
}

/**
 * Mapper from DTO to Domain model and vice versa.
 */
export interface IMapper<TDto, TDomain> extends MapperFromDto<TDto, TDomain>, MapperToDto<TDto, TDomain> {
}

/**
 * Mapper of DTO to domain model and vice versa with errors mapping support.
 */
export interface MapperWithErrors<TDto, TDomain> extends MapperFromDtoWithErrors<TDto, TDomain>, ValidationErrorMapper<TDto, TDomain> {
}

import { AuthorDto } from '@jl/common/core/dto/author-dto';

/** Matter post dto. */
export interface MatterPostDto {
  /** Identifier */
  id: number;
  /** Topic identifier */
  topic: number;
  /** Author as attorney or client */
  author: AuthorDto;
  /** Text */
  text: string;
  /** Created at */
  created: string;
  /** Modified at */
  modified: string;
}

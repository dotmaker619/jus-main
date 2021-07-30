import { SocialPostAuthorDto } from './social-post-author-dto';

/**
 * Social post DTO.
 */
export interface SocialPostDto {
  /** Id. */
  id: number;
  /** Author ID. */
  author: number;
  /** Author data. */
  author_data: SocialPostAuthorDto;
  /** Title. */
  title: string;
  /** Image. */
  image: string;
  /** Image thumbnail. */
  image_thumbnail: string;
  /** Body. */
  body: string;
  /** Body preview. */
  body_preview: string;
  /** Creation date. */
  created: string;
  /** Date of the last modification */
  modified: string;
}

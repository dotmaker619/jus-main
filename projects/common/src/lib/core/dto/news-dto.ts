/** News DTO. */
export interface NewsDto {
  /** ID. */
  id: number;
  /** Title. */
  title: string;
  /** Description. */
  description: string;
  /** Image. */
  image: string;
  /** Image thumbnail. */
  image_thumbnail: string;
  /** Tags. */
  tags: string[];
  /** Categories. */
  categories: string[];
  /** Created. */
  created: string;
  /** Modified. */
  modified: string;
}

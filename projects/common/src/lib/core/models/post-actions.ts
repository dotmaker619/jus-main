
/** Available actions with post */
export enum PostActions {
  /** Edit post. */
  Edit,
  /** Delete post */
  Delete,
}
/** Post action */
export interface PostAction {
  /** Action. */
  id: PostActions;
  /** Human-readable value */
  value: string;
}

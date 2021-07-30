/** Forum stats model. */
export class ForumStats {
  /** Number of posts. */
  public postsCount: number;

  /**
   * @constructor
   * @param forumStats
   */
  public constructor(forumStats: Partial<ForumStats>) {
    this.postsCount = forumStats.postsCount;
  }
}

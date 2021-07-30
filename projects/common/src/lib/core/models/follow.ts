import {Topic} from '@jl/common/core/models/topic';

/** Model for Follow data */
export class Follow {
  /** Id of the follow instance */
  public id: number;
  /** Followed topic data */
  public topic: Topic;
  /** Number of unread posts */
  public unreadPostCount: number;
  /** Id of the last read post */
  public lastReadPost: number;

  /**
   * @constructor
   * @param follow - follow data
   */
  public constructor(follow: Partial<Follow>) {
    this.id = follow.id;
    this.topic = follow.topic;
    this.unreadPostCount = follow.unreadPostCount;
    this.lastReadPost = follow.lastReadPost;
  }
}

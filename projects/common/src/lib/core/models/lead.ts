import { Attorney } from './attorney';
import { Client } from './client';
import { LeadPriority } from './lead-priority';
import { Topic } from './topic';

/**
 * Lead model.
 * Provides ability to chatting between Attorney and Client.
 */
export class Lead {
  /**
   * ID.
   */
  public id: number;

  /**
   * Attorney ID.
   */
  public attorney: Attorney;

  /**
   * Topic data.
   */
  public topic: Topic;

  /**
   * Client data.
   */
  public client: Client;

  /**
   * Last message.
   */
  public lastMessage: string;

  /**
   * Priority.
   */
  public priority: LeadPriority;

  /**
   * Chat channel ID.
   */
  public chatId: string;

  /**
   * Date of creation.
   */
  public created: Date;

  /**
   * @constructor
   *
   * @param data Initialized data.
   */
  public constructor(data: Partial<Lead>) {
    this.id = data.id;
    this.topic = data.topic;
    this.client = data.client;
    this.attorney = data.attorney;
    this.lastMessage = data.lastMessage;
    this.priority = data.priority;
    this.chatId = data.chatId;
    this.created = data.created;
  }
}

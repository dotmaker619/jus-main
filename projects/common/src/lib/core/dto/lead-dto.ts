import { AttorneyDto } from './attorney-dto';
import { ClientDto } from './client-dto';
import { TopicDto } from './topic-dto';

/**
 * Lead DTO.
 */
export interface LeadDto {
  /**
   * ID.
   */
  id: number;

  /**
   * Attorney ID.
   */
  attorney: number;

  /**
   * Attorney data.
   */
  attorney_data: Partial<AttorneyDto>;

  /**
   * Topic ID.
   */
  topic: number;

  /**
   * Topic DTO.
   */
  topic_data: TopicDto;

  /**
   * Client DTO.
   */
  client_data: Partial<ClientDto>;

  /**
   * Last message.
   */
  last_message: string;

  /**
   * Lead priority.
   */
  priority: 'high' | 'medium' | 'low';

  /**
   * Chat ID.
   */
  chat_channel: string;

  /**
   * Date of creation.
   */
  created: string;
}

/**
 * DTO to create a lead.
 */
export interface CreateLeadDto {
  /**
   * Client ID.
   */
  client: number;

  /**
   * Attorney ID.
   */
  attorney: number;

  /**
   * Topic ID.
   */
  topic: number;

  /**
   * Priority.
   */
  priority: LeadDto['priority'];
}

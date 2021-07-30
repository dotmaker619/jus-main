import { AttorneyDto } from '../dto/attorney-dto';
import { ClientDto } from '../dto/client-dto';
import { Role } from '../models/role';
import { User } from '../models/user';

import { MapperFromDto } from './mapper';

/**
 * User mapper.
 * Provides method to retrieve base user information from attorney or client DTO.
 */
export class UserMapper implements MapperFromDto<Partial<AttorneyDto | ClientDto>, User> {
  /**
   * @inheritdoc
   */
  public fromDto(data: AttorneyDto | ClientDto): User {
    return new User({
      avatar: data.avatar,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      id: data.id,
      role: 'bar_number' in data ? Role.Attorney : Role.Client, // TODO: Improve that.
    });
  }
}

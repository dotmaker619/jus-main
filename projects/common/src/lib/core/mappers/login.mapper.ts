import { Injectable } from '@angular/core';
import { LoginDto } from '@jl/common/core/dto/login-dto';
import { MapperToDto } from '@jl/common/core/mappers/mapper';
import { Login } from '@jl/common/core/models/login';

import { AuthDataDto } from '../dto/auth-data-dto';
import { AuthData } from '../models/auth-data';
import { Role } from '../models/role';

/** Mapper for attorney login action */
@Injectable({ providedIn: 'root' })
export class LoginMapper implements MapperToDto<LoginDto, Login> {
  /** Not required method */
  public fromDto(data: AuthDataDto): AuthData {
    return {
      key: data.key,
      role: data.user_type as Role,
    };
  }

  /** Convert attorney login data to server format */
  public toDto(data: Login): LoginDto {
    return {
      email: data.email,
      password: data.password,
    };
  }

}

import { Specialty } from '@jl/common/core/models/specialty';

import { Role } from './role';
import { State } from './state';
import { User } from './user';

/** Client type. */
export enum ClientType {
  /** Organization client. */
  Organization = 'organization',
  /** Individual client. */
  Individual = 'individual',
}

/**
 * Client model.
 */
export class Client extends User {
  /**
   * State.
   */
  public state: State;
  /**
   * Help description.
   */
  public helpDescription: string;
  /**
   * Specialties.
   */
  public specialties?: Specialty[];
  /**
   * Client type.
   */
  public clientType: ClientType;
  /**
   * Organization name.
   */
  public organizationName: string;

  /**
   * @constructor
   *
   * @param data Initialized data.
   */
  public constructor(data: Partial<Client>) {
    super({
      ...data,
      role: Role.Client,
    });
    this.state = data.state;
    this.helpDescription = data.helpDescription;
    this.specialties = data.specialties || [];
    this.clientType = data.clientType;
    this.organizationName = data.organizationName;
  }

  /** @inheritdoc */
  public get fullName(): string {
    switch (this.clientType) {
      case ClientType.Organization:
        return this.organizationName;
      case ClientType.Individual:
        return super.fullName;
      default:
        return super.fullName;
    }
  }

  /** @inheritdoc */
  public get shortName(): string {
    switch (this.clientType) {
      case ClientType.Organization:
        return this.organizationName;
      case ClientType.Individual:
        return super.shortName;
      default:
        return super.shortName;
    }
  }
}

/** User role enumeration. */
export enum Role {
  /** The subject of matters. */
  Client = 'client',
  /** Has ability to change, create, delete matters and communicate with Client.  */
  Attorney = 'attorney',
  /** Has a subset of Attorney's functionality. */
  Staff = 'support',
  /** Non-authorized user. */
  Unauthorized = 'unauthorized',
}

export namespace Role {

  const READABLE_ROLE_MAP: Record<Role, string> = {
    [Role.Attorney]: 'Attorney',
    [Role.Client]: 'Client',
    [Role.Staff]: 'Paralegal',
    [Role.Unauthorized]: 'Unauthorized user',
  };

  /**
   * Parse role to human-readable string.
   * @param role Role from which to obtain human-readable string.
   */
  // tslint:disable-next-line: completed-docs
  export function toReadable(role: Role): string {
    return READABLE_ROLE_MAP[role];
  }
}

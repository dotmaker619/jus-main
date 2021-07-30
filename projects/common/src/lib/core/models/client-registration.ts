import { Client } from './client';

/**
 * Client registration model.
 */
export class ClientRegistration extends Client {
  /**
   * Password.
   */
  public password: string;
  /**
   * Password confirm.
   */
  public passwordConfirm: string;

  /**
   * @constructor
   * @param data Initialized data.
   */
  public constructor(data: Partial<ClientRegistration>) {
    super(data);
    this.password = data.password;
    this.passwordConfirm = data.passwordConfirm;
  }
}

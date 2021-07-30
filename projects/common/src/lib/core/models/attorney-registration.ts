import { Attorney } from './attorney';

/**
 * Attorney registration model.
 */
export class AttorneyRegistration extends Attorney {
  /**
   * Password.
   */
  public password: string;
  /**
   * Repeat password.
   */
  public passwordRepeat: string;
  /**
   * File attachments.
   */
  public attachedFiles: File[] | string[];

  /**
   * @constructor
   * @param data Initialized data.
   */
  public constructor(data: Partial<AttorneyRegistration>) {
    super(data);
    this.password = data.password;
    this.passwordRepeat = data.passwordRepeat;
    this.attachedFiles = data.attachedFiles;
  }
}

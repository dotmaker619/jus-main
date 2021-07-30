/** ESign Profile */
export interface ESignProfileDto {
  /** DocuSign ID */
  docusign_id: number;
  /** Has consent to impersonate requests to ESign platform */
  has_consent: boolean;
  /** Link to obtain consent if it hasn't got yet */
  obtain_consent_link: string;
}

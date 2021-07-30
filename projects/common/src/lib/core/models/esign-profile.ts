/** User profile for electronic signification system */
export class ESignProfile {
  /** Id of a user in DocuSign system (GUID) needed for impersonalization purpose */
  public docusignId: number;
  /** Has consent to impersonate requests to ESign platform */
  public hasConsent: boolean;
  /** Link to obtain consent if it hasn't got yet */
  public obtainConsentLink: string;

  /**
   * @constructor
   * @param profile
   */
  public constructor(profile: Partial<ESignProfile>) {
    this.docusignId = profile.docusignId;
    this.hasConsent = profile.hasConsent;
    this.obtainConsentLink = profile.obtainConsentLink;
  }
}

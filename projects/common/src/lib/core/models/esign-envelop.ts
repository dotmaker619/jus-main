import { ESignDocument } from './esign-document';

/**
 * E-sign envelop of documents.
 */
export class ESignEnvelop {
  /**
   * ID.
   */
  public id: number;
  /**
   * ID in Docusign system.
   */
  public docusignId: string;
  /**
   * Associated matter ID.
   */
  public matterId: number;
  /**
   * Status.
   */
  public status: 'created' | 'sent' | 'delivered' | 'signed' | 'completed' | 'declined' | 'voided';
  /**
   * Type.
   */
  public type: 'initial' | 'extra';
  /**
   * Documents of envelop.
   */
  public documents: ESignDocument[];

  /**
   * Edit link.
   */
  public editLink?: string = null;

  /**
   * @constructor
   * @param data Initialized data.
   */
  public constructor(data: Partial<ESignEnvelop>) {
    this.id = data.id;
    this.docusignId = data.docusignId;
    this.matterId = data.matterId;
    this.status = data.status;
    this.type = data.type;
    this.documents = data.documents;
    this.editLink = data.editLink;
  }
}

/**
 * E-sign document DTO.
 */
export interface ESignDocumentDto {
  /**
   * ID of record.
   */
  id?: number;
  /**
   * Document name.
   */
  name?: string;
  /**
   * URL to file.
   */
  file: string;
  /**
   * Order.
   */
  order?: number;
}

/**
 * E-sign envelop of documents.
 */
export interface ESignEnvelopeDto {
  /**
   * Record ID.
   */
  id: number;
  /**
   * ID in Docusign system.
   */
  docusign_id: string;
  /**
   * Associated matter ID.
   */
  matter: number;
  /**
   * Status.
   */
  status: 'created' | 'sent' | 'delivered' | 'signed' | 'completed' | 'declined' | 'voided';
  /**
   * Type.
   */
  type: 'initial' | 'extra';
  /**
   * Documents of envelop.
   */
  documents: ESignDocumentDto[];

  /**
   * Edit link.
   */
  edit_link?: string;
}

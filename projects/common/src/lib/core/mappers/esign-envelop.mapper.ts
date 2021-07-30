import { ESignEnvelopeDto } from '../dto/esign-envelop-dto';
import { ESignEnvelop } from '../models/esign-envelop';

import { ESignDocumentMapper } from './esign-document.mapper';
import { IMapper } from './mapper';

/**
 * E-sign envelop mapper.
 */
export class ESignEnvelopMapper implements IMapper<ESignEnvelopeDto, ESignEnvelop> {
  private readonly eSignDocumentMapper = new ESignDocumentMapper();

  /**
   * @inheritdoc
   */
  public fromDto(data: ESignEnvelopeDto): ESignEnvelop {
    return new ESignEnvelop({
      id: data.id,
      documents: data.documents.map(docDto => this.eSignDocumentMapper.fromDto(docDto)),
      docusignId: data.docusign_id,
      matterId: data.matter,
      status: data.status,
      type: data.type,
      editLink: data.edit_link,
    });
  }

  /**
   * @inheritdoc
   */
  public toDto(data: ESignEnvelop): ESignEnvelopeDto {
    return {
      id: data.id,
      documents: data.documents.map(doc => this.eSignDocumentMapper.toDto(doc)),
      docusign_id: data.docusignId,
      matter: data.matterId,
      status: data.status,
      type: data.type,
      edit_link: data.editLink,
    };
  }
}

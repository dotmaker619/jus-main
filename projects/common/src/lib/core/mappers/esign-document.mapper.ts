import { ESignDocumentDto } from '../dto/esign-envelop-dto';
import { ESignDocument } from '../models/esign-document';

import { IMapper } from './mapper';

/**
 * E-sign document mapper.
 */
export class ESignDocumentMapper implements IMapper<ESignDocumentDto, ESignDocument> {
  /**
   * @inheritdoc
   */
  public fromDto(data: ESignDocumentDto): ESignDocument {
    return new ESignDocument({
      id: data.id,
      name: data.name,
      fileUrl: data.file,
      order: data.order,
    });
  }

  /**
   * @inheritdoc
   */
  public toDto(data: ESignDocument): ESignDocumentDto {
    return {
      id: data.id,
      name: data.name,
      file: data.fileUrl,
      order: data.order,
    };
  }
}

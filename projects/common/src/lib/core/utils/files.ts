import { JlpFile } from '../models/jlp-file';

/**
 * Extract file extension from its name.
 *
 * @param file File or JlpFile instance.
 */
export function extractFileExtension(file: File | JlpFile): string {
  const [fileType] = file.name.split('.').slice(-1);
  return fileType;
}

/**
 * Get name without type.
 * @param file File or JlpFile instance.
 */
export function getNameWithoutType(file: File | JlpFile): string {
  return file.name.split('.').slice(0, -1).join('');
}

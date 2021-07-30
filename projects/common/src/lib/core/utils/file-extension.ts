
const MIME_TYPE_TO_FILE_EXTENSION = {
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
};

/** Audio file extension. */
export function getFileExtension(file: Blob): string {
  return MIME_TYPE_TO_FILE_EXTENSION[file.type];
}

/**
 * Available document types.
 * https://support.docusign.com/en/guides/ndse-user-guide-supported-file-formats.
 */
export const AVAILABLE_DOCUMENT_TYPES = [
  'doc',
  'docm',
  'docx',
  'dot',
  'dotm',
  'dotx',
  'htm',
  'html',
  'msg',
  'pdf',
  'rtf',
  'txt',
  'wpd',
  'xps',
  'msword', // Microsoft MIME types for 'doc', 'dot'
  'vnd.openxmlformats-officedocument.wordprocessingml.document',  // .docx
  'vnd.openxmlformats-officedocument.wordprocessingml.template',  // .dotx
  'vnd.ms-word.document.macroEnabled.12', // .docm
  'vnd.ms-word.template.macroEnabled.12', // .dotm
];

/**
 * Available image types.
 * https://support.docusign.com/en/guides/ndse-user-guide-supported-file-formats.
 */
export const AVAILABLE_IMAGE_TYPES = [
  'bmp',
  'gif',
  'jpg',
  'jpeg',
  'png',
  'tif',
  'tiff',
];

/**
 * Available presentation types.
 * https://support.docusign.com/en/guides/ndse-user-guide-supported-file-formats.
 */
export const AVAILABLE_PRESENTATION_TYPES = [
  'pot',
  'potx',
  'pps',
  'ppt',
  'pptm',
  'pptx',
  'vnd.ms-powerpoint', // Microsoft MIME types for presentation files
  'vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'vnd.openxmlformats-officedocument.presentationml.template', // .pptm
];

/**
 * Available spreadsheet types.
 * https://support.docusign.com/en/guides/ndse-user-guide-supported-file-formats.
 */
export const AVAILABLE_SPREADSHEET_TYPES = [
  'csv',
  'xls',
  'xlsm',
  'xlsx',
  'vnd.ms-excel', // Microsoft MIME types for 'xls'
  'vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
  'vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];

/**
 * Maximum document size in MB.
 * https://support.docusign.com/en/guides/ndse-user-guide-supported-file-formats.
 */
export const MAX_DOCUMENT_SIZE_MB = 25;

/**
 * Maximal document size in bytes.
 * https://support.docusign.com/en/guides/ndse-user-guide-supported-file-formats.
 */
export const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

/**
 * Get available DocuSign file types as mime types.
 */
export function getAvailableDocuSignTypesAsMimeTypes(): string[] {
  const applicationTypes = [
    ...AVAILABLE_DOCUMENT_TYPES,
    ...AVAILABLE_PRESENTATION_TYPES,
    ...AVAILABLE_SPREADSHEET_TYPES,
  ].map(type => `application/${type}`);

  const imageTypes = AVAILABLE_IMAGE_TYPES
    .map(type => `image/${type}`);

  const allTypesAsFileExtensions = [
    ...AVAILABLE_DOCUMENT_TYPES,
    ...AVAILABLE_IMAGE_TYPES,
    ...AVAILABLE_PRESENTATION_TYPES,
    ...AVAILABLE_SPREADSHEET_TYPES,
  ].map(type => `.${type}`);

  return [
    ...applicationTypes,
    ...imageTypes,
    ...allTypesAsFileExtensions,
  ];
}

/**
 * Get available DocuSign file types as value for the `accept` attribute of input[type=file].
 */
export function getAvailableDocuSignTypesToAcceptAttribute(): string {
  const mimeTypes = getAvailableDocuSignTypesAsMimeTypes();

  return mimeTypes.join(', ');
}

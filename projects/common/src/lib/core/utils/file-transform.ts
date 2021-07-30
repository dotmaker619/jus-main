import { SafeUrl } from '@angular/platform-browser';

/**
 * Convert a file to object URL.
 * @param file File to convert.
 */
export function fileToObjectUrl(file: File): SafeUrl {
  return URL.createObjectURL(file);
}

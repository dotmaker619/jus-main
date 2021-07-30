/**
 * An option with ID.
 */
export interface OptionWithId {
  /**
   * ID.
   */
  id: string | number;
}

/**
 * Compare function to compare two objects with ID.
 * @param a First object.
 * @param b Second object.
 */
export function compareWithId(a: OptionWithId | null, b: OptionWithId | null): boolean {
  if (a == null && b == null) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }
  return a.id === b.id;
}

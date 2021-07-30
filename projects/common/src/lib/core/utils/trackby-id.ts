/** Interface for trackById function. */
interface ObjectWithId {
  /** Id. */
  id: number;
  [key: string]: any;
}

/**
 * Trackby function for angular ngFor directive.
 * @param param0 Any object with id field.
 * @returns Unique identifier
 */
export function trackById(_: number, { id }: ObjectWithId): number {
  return id;
}

/** Link model. */
export interface Link<T = string> {
  /** Page url. */
  link: T;

  /** Shows whether the link is external. */
  isExternal?: boolean;

  /** Link text. */
  label: string;
}

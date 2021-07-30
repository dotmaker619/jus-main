/** Describe attorney education */
export class Education {
  /** Education id */
  public id: number;
  /** Year of graduation */
  public year: number;
  /** University name */
  public university: string;

  constructor(education: Partial<Education>) {
    this.id = education.id;
    this.year = education.year;
    this.university = education.university;
  }
}

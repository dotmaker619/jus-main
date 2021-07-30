/** Country model. */
export class Country {
  /** id. */
  public id: number;
  /** name. */
  public name: string;

  /**
   * @constructor
   * @param country
   */
  public constructor(country: Partial<Country>) {
    this.id = country.id;
    this.name = country.name;
  }
}

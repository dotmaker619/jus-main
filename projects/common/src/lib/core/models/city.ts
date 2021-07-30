/** City model. */
export class City {
  /** id */
  public id: number;
  /** name */
  public name: string;

  /**
   * @constructor
   * @param city
   */
  public constructor(city: Partial<City>) {
    this.id = city.id;
    this.name = city.name;
  }
}

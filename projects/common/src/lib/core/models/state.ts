/** State model. */
export class State {
     /** id */
  public id: number;
  /** name */
  public name: string;

  /**
   * @constructor
   * @param state
   */
  public constructor(state: Partial<State>) {
    this.id = state.id;
    this.name = state.name;
  }
}

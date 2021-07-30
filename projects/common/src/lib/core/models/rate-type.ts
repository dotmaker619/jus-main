/** Rate type */
export enum RateType {
  /** Hourly */
  Hourly = 'hourly',
  /** Fixed */
  Fixed = 'fixed_amount',
  /** Contingency */
  Contingency = 'contingency_fee',
  /** Alternative */
  Alternative = 'alternative',
}

export namespace RateType {
  const readableRateType: Record<RateType, string> = {
    [RateType.Hourly]: 'Hourly',
    [RateType.Alternative]: 'Alternative Agreement',
    [RateType.Fixed]: 'Fixed Set Amount',
    [RateType.Contingency]: 'Contingency Fee',
  };

  /**
   * Get user-friendly representation of a rate type.
   * @param value The type of rate.
   */
  // tslint:disable-next-line: completed-docs
  export function toReadable(value: RateType | string): string {
    return readableRateType[value];
  }

  /**
   * Get list of enum values.
   */
  // tslint:disable-next-line: completed-docs
  export function toArray(): string[] {
    return Object.keys(readableRateType);
  }
}

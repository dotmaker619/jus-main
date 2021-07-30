/**
 * Invoice statistics.
 */
export class InvoiceStatistics {
  /** File. */
  public file: Blob;
  /** Name. */
  public name: string;

  public constructor(data: Partial<InvoiceStatistics>) {
    this.file = data.file;
    this.name = data.name;
  }
}

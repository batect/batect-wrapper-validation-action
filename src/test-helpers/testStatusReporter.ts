export class TestStatusReporter {
  public failureReported: boolean;
  public failureMessage: string | null;

  constructor() {
    this.failureReported = false;
    this.failureMessage = null;
  }

  setFailed(message: string): void {
    if (this.failureReported) {
      throw Error("A failure has already been reported for this run.");
    }

    this.failureReported = true;
    this.failureMessage = message;
  }
}

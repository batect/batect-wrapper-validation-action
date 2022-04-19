import * as fs from "fs";
import * as path from "path";
import { execute } from "./action";

class TestConfiguration {
  public directory: string;

  constructor(fixtureName: string) {
    this.directory = path.join(__dirname, "fixtures", "targets", fixtureName);

    if (!fs.existsSync(this.directory)) {
      throw new Error(`Test fixture directory '${this.directory}' does not exist.`);
    }
  }
}

class TestStatusReporter {
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

describe("the validation action", () => {
  let reporter: TestStatusReporter;

  beforeEach(() => {
    reporter = new TestStatusReporter();
  });

  describe("when both wrapper scripts match the expected checksums", () => {
    const config = new TestConfiguration("valid");

    test("it succeeds", async () => {
      await execute(config, reporter);

      expect(reporter.failureMessage).toBeNull();
      expect(reporter.failureReported).toBe(false);
    });
  });

  describe("when the Unix wrapper script is missing", () => {
    const config = new TestConfiguration("missing-unix-wrapper");

    test("it fails and reports that the Unix wrapper script is missing", async () => {
      await execute(config, reporter);

      expect(reporter.failureMessage).toBe("Unix wrapper script 'batect' not found.");
    });
  });

  describe("when the Windows wrapper script is missing", () => {
    const config = new TestConfiguration("missing-windows-wrapper");

    test("it fails and reports that the Windows wrapper script is missing", async () => {
      await execute(config, reporter);

      expect(reporter.failureMessage).toBe("Windows wrapper script 'batect.cmd' not found.");
    });
  });

  describe("when the Unix wrapper script has no version", () => {
    const config = new TestConfiguration("unix-wrapper-has-no-version");

    test("it fails and reports that the Unix wrapper script has no version number", async () => {
      await execute(config, reporter);

      expect(reporter.failureMessage).toBe("Could not determine version of Unix wrapper script 'batect'.");
    });
  });

  describe("when the Windows wrapper script has no version", () => {
    const config = new TestConfiguration("windows-wrapper-has-no-version");

    test("it fails and reports that the Windows wrapper script has no version number", async () => {
      await execute(config, reporter);

      expect(reporter.failureMessage).toBe("Could not determine version of Windows wrapper script 'batect.cmd'.");
    });
  });

  describe("when the Unix wrapper script has multiple versions", () => {
    const config = new TestConfiguration("unix-wrapper-has-multiple-versions");

    test("it fails and reports that the Unix wrapper script has multiple version numbers", async () => {
      await execute(config, reporter);

      expect(reporter.failureMessage).toBe("Found multiple version numbers in Unix wrapper script 'batect'.");
    });
  });

  describe("when the Windows wrapper script has multiple versions", () => {
    const config = new TestConfiguration("windows-wrapper-has-multiple-versions");

    test("it fails and reports that the Windows wrapper script has multiple version numbers", async () => {
      await execute(config, reporter);

      expect(reporter.failureMessage).toBe("Found multiple version numbers in Windows wrapper script 'batect.cmd'.");
    });
  });

  describe("when the Unix wrapper script has an invalid version", () => {
    const config = new TestConfiguration("unix-wrapper-has-invalid-version");

    test("it fails and reports that the Unix wrapper script has an invalid version number", async () => {
      await execute(config, reporter);

      expect(reporter.failureMessage).toBe("Unix wrapper script 'batect' has invalid version '0.79.a'.");
    });
  });

  describe("when the Windows wrapper script has an invalid version", () => {
    const config = new TestConfiguration("windows-wrapper-has-invalid-version");

    test("it fails and reports that the Windows wrapper script has an invalid version number", async () => {
      await execute(config, reporter);

      expect(reporter.failureMessage).toBe("Windows wrapper script 'batect.cmd' has invalid version '0.79.a'.");
    });
  });

  describe("when the wrapper scripts have different versions", () => {
    const config = new TestConfiguration("different-versions");

    test("it fails and reports the versions found in each file", async () => {
      await execute(config, reporter);

      expect(reporter.failureMessage).toBe(
        "The wrapper scripts have different versions. The Unix wrapper script 'batect' has version '1.2.3', and the Windows wrapper script 'batect.cmd' has version '4.5.6'."
      );
    });
  });
});


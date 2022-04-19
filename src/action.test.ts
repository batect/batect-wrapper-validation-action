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

interface FailureScenario {
  fixtureName: string;
  description: string;
  expectedBehaviour: string;
  expectedErrorMessage: string;
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

  const failureScenarios: FailureScenario[] = [
    {
      fixtureName: "missing-unix-wrapper",
      description: "the Unix wrapper script is missing",
      expectedBehaviour: "reports that the Unix wrapper script is missing",
      expectedErrorMessage: "Unix wrapper script 'batect' not found.",
    },
    {
      fixtureName: "missing-windows-wrapper",
      description: "the Windows wrapper script is missing",
      expectedBehaviour: "reports that the Windows wrapper script is missing",
      expectedErrorMessage: "Windows wrapper script 'batect.cmd' not found.",
    },
    {
      fixtureName: "unix-wrapper-has-no-version",
      description: "the Unix wrapper script has no version",
      expectedBehaviour: "reports that the Unix wrapper script has no version number",
      expectedErrorMessage: "Could not determine version of Unix wrapper script 'batect'.",
    },
    {
      fixtureName: "windows-wrapper-has-no-version",
      description: "the Windows wrapper script has no version",
      expectedBehaviour: "reports that the Windows wrapper script has no version number",
      expectedErrorMessage: "Could not determine version of Windows wrapper script 'batect.cmd'.",
    },
    {
      fixtureName: "unix-wrapper-has-multiple-versions",
      description: "the Unix wrapper script has multiple versions",
      expectedBehaviour: "reports that the Unix wrapper script has multiple version numbers",
      expectedErrorMessage: "Found multiple version numbers in Unix wrapper script 'batect'.",
    },
    {
      fixtureName: "windows-wrapper-has-multiple-versions",
      description: "the Windows wrapper script has multiple versions",
      expectedBehaviour: "reports that the Windows wrapper script has multiple version numbers",
      expectedErrorMessage: "Found multiple version numbers in Windows wrapper script 'batect.cmd'.",
    },
    {
      fixtureName: "unix-wrapper-has-invalid-version",
      description: "the Unix wrapper script has an invalid version",
      expectedBehaviour: "reports that the Unix wrapper script has an invalid version number",
      expectedErrorMessage: "Unix wrapper script 'batect' has invalid version '0.79.a'.",
    },
    {
      fixtureName: "windows-wrapper-has-invalid-version",
      description: "the Windows wrapper script has an invalid version",
      expectedBehaviour: "reports that the Windows wrapper script has an invalid version number",
      expectedErrorMessage: "Windows wrapper script 'batect.cmd' has invalid version '0.79.a'.",
    },
    {
      fixtureName: "different-versions",
      description: "the wrapper scripts have different versions",
      expectedBehaviour: "reports the versions found in each file",
      expectedErrorMessage:
        "The wrapper scripts have different versions. The Unix wrapper script 'batect' has version '1.2.3', and the Windows wrapper script 'batect.cmd' has version '4.5.6'.",
    },
  ];

  failureScenarios.forEach((scenario) => {
    describe(`when ${scenario.description}`, () => {
      const config = new TestConfiguration(scenario.fixtureName);

      test(`it fails and ${scenario.expectedBehaviour}`, async () => {
        await execute(config, reporter);

        expect(reporter.failureMessage).toBe(scenario.expectedErrorMessage);
      });
    });
  });
});

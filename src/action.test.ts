/*
   Copyright 2017-2022 Charles Korn.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       httsp://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import { StaticFilesServer, TestStatusReporter } from "./test-helpers";
import { execute } from "./action";
import fs from "fs";
import path from "path";

class TestConfiguration {
  public directory: string;

  constructor(
    fixtureName: string,
    readonly checksumDownloadRootUrl: string,
  ) {
    this.directory = path.join(__dirname, "fixtures", "targets", fixtureName);

    if (!fs.existsSync(this.directory)) {
      throw new Error(`Test fixture directory '${this.directory}' does not exist.`);
    }
  }
}

interface FailureScenario {
  fixtureName: string;
  description: string;
  expectedBehaviour: string;
  expectedErrorMessage: string;
}

describe("the validation action", () => {
  let checksumServer: StaticFilesServer;
  let reporter: TestStatusReporter;

  beforeAll(async () => {
    checksumServer = new StaticFilesServer(path.join(__dirname, "fixtures", "checksums"));
    await checksumServer.start();
  });

  afterAll(async () => {
    await checksumServer.shutdown();
  });

  beforeEach(() => {
    reporter = new TestStatusReporter();
  });

  describe("when both wrapper scripts match the expected checksums", () => {
    test("it succeeds", async () => {
      const config = new TestConfiguration("valid", checksumServer.url);
      await execute(config, reporter);

      expect(reporter.failureMessage).toBeNull();
      expect(reporter.failureReported).toBe(false);
      expect(reporter.infoMessages).toEqual(["Wrapper scripts are valid."]);
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
    {
      fixtureName: "unix-wrapper-doesnt-match-expected",
      description: "the Unix wrapper script does not have the expected checksum",
      expectedBehaviour: "reports that the Unix wrapper script doesn't have the expected checksum and includes both the expected and actual checksums",
      expectedErrorMessage:
        "Unix wrapper script 'batect' has SHA256 checksum 51374c35bdd0eb03cad65af098afc19d9143a8b6e8b7abadc60b2032f80c5f20, but it should have SHA256 checksum 7513b83a3d0f2cb5ee43db3b3d84d0199014e3c1dc222c318bcf87b7829ab716.",
    },
    {
      fixtureName: "windows-wrapper-doesnt-match-expected",
      description: "the Windows wrapper script does not have the expected checksum",
      expectedBehaviour: "reports that the Windows wrapper script doesn't have the expected checksum and includes both the expected and actual checksums",
      expectedErrorMessage:
        "Windows wrapper script 'batect.cmd' has SHA256 checksum 971d81d2ad46784b10a57e2d2b85b20eb57070fafc98a1713291345807f6f4f3, but it should have SHA256 checksum 19e16909b4fe079ee6307dc1318f06f5b4f05db86a6922045ff84913a8afffcf.",
    },
    {
      fixtureName: "inverted-content",
      description: "the content of both wrapper scripts have been swapped",
      expectedBehaviour: "reports a useful error message",
      expectedErrorMessage: "Could not determine version of Unix wrapper script 'batect'.",
    },
    {
      fixtureName: "both-dont-match-expected",
      description: "the content of both wrapper scripts is incorrect",
      expectedBehaviour: "reports that the files do not match the expected checksum",
      expectedErrorMessage:
        "Unix wrapper script 'batect' has SHA256 checksum 51374c35bdd0eb03cad65af098afc19d9143a8b6e8b7abadc60b2032f80c5f20, but it should have SHA256 checksum 7513b83a3d0f2cb5ee43db3b3d84d0199014e3c1dc222c318bcf87b7829ab716.",
    },
    {
      fixtureName: "unsupported-version",
      description: "the wrapper scripts are for a version of Batect known to not have published checksums",
      expectedBehaviour: "reports that the version is unsupported",
      expectedErrorMessage: "Checksums are only available for Batect version 0.79.0 or later, but this project uses 0.78.0.",
    },
    {
      fixtureName: "unix-wrapper-has-windows-line-endings",
      description: "the Unix wrapper has the correct content but Windows-style line endings",
      expectedBehaviour: "reports that the script has the wrong line endings",
      expectedErrorMessage:
        "Unix wrapper script 'batect' has SHA256 checksum 22b4cf8c11b1ee5339ade8998dbdc836cdb414b7b56e002d918c0a90c9e96b1a, but it should have SHA256 checksum 7513b83a3d0f2cb5ee43db3b3d84d0199014e3c1dc222c318bcf87b7829ab716. 'batect' appears to have Windows-style line endings (CR/LF) instead of Unix-style line endings (LF), which may be causing this mismatch.",
    },
    {
      fixtureName: "windows-wrapper-has-unix-line-endings",
      description: "the Windows wrapper has the correct content but Unix-style line endings",
      expectedBehaviour: "reports that the script has the wrong line endings",
      expectedErrorMessage:
        "Windows wrapper script 'batect.cmd' has SHA256 checksum 05dbb1da13bba600d2a9a6ea316f0158e327322f832bb27fe567f0d62e2ca094, but it should have SHA256 checksum 19e16909b4fe079ee6307dc1318f06f5b4f05db86a6922045ff84913a8afffcf. 'batect.cmd' appears to have Unix-style line endings (LF) instead of Windows-style line endings (CR/LF), which may be causing this mismatch.",
    },
  ];

  failureScenarios.forEach((scenario) => {
    describe(`when ${scenario.description}`, () => {
      test(`it fails and ${scenario.expectedBehaviour}`, async () => {
        const config = new TestConfiguration(scenario.fixtureName, checksumServer.url);
        await execute(config, reporter);

        expect(reporter.failureMessage).toBe(scenario.expectedErrorMessage);
        expect(reporter.infoMessages).toEqual([]);
      });
    });
  });

  describe("when the checksum file could not be downloaded because it does not exist", () => {
    test("it fails and reports that the checksum file could not be downloaded and includes the full URL of the file that was attempted to be downloaded", async () => {
      const config = new TestConfiguration("checksum-file-not-found", checksumServer.url);
      await execute(config, reporter);

      expect(reporter.failureMessage).toBe(`Could not download checksum file ${checksumServer.url}/0.79.1/checksums.sha256: HTTP 404 (Not Found)`);
      expect(reporter.infoMessages).toEqual([]);
    });
  });
});

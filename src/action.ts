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

import * as semver from "semver";
import { parseChecksums, WrapperChecksums } from "./parse";
import { WrapperInfo, WrapperInfoExtractor } from "./extractor";
import { Configuration } from "./configuration";
import fetch from "node-fetch";

export interface StatusReporter {
  setFailed(message: string): void;
  info(message: string): void;
}

const unixWrapperInfoExtractor = new WrapperInfoExtractor("Unix", "batect", /^\s*VERSION="(.*)"/gm);
const windowsWrapperInfoExtractor = new WrapperInfoExtractor("Windows", "batect.cmd", /^\s*set\s+"version=(.*)"/gm);

const ensureSameVersion = (unixInfo: WrapperInfo, windowsInfo: WrapperInfo): void => {
  if (unixInfo.version === windowsInfo.version) {
    return;
  }

  throw new Error(
    `The wrapper scripts have different versions. The Unix wrapper script 'batect' has version '${unixInfo.version}', and the Windows wrapper script 'batect.cmd' has version '${windowsInfo.version}'.`
  );
};

const ensureSupportedVersion = (version: string): void => {
  const minimumRequiredVersion = "0.79.0";

  if (semver.lt(version, minimumRequiredVersion, { loose: false, includePrerelease: false })) {
    throw new Error(`Checksums are only available for Batect version ${minimumRequiredVersion} or later, but this project uses ${version}.`);
  }
};

const downloadExpectedChecksums = async (config: Configuration, version: string): Promise<WrapperChecksums> => {
  const url = `${config.checksumDownloadRootUrl}/${version}/checksums.sha256`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not download checksum file ${url}: HTTP ${response.status} (${response.statusText})`);
  }

  const body = await response.text();

  return parseChecksums(body);
};

const validateChecksums = (unixInfo: WrapperInfo, windowsInfo: WrapperInfo, expectedChecksums: WrapperChecksums) => {
  if (unixInfo.actualChecksum !== expectedChecksums.unix) {
    throw new Error(`Unix wrapper script 'batect' has checksum ${unixInfo.actualChecksum}, but it should have checksum ${expectedChecksums.unix}.`);
  }

  if (windowsInfo.actualChecksum !== expectedChecksums.windows) {
    throw new Error(
      `Windows wrapper script 'batect.cmd' has checksum ${windowsInfo.actualChecksum}, but it should have checksum ${expectedChecksums.windows}.`
    );
  }
};

export async function execute(config: Configuration, reporter: StatusReporter): Promise<void> {
  try {
    const unixInfo = await unixWrapperInfoExtractor.extractInfo(config);
    const windowsInfo = await windowsWrapperInfoExtractor.extractInfo(config);
    ensureSameVersion(unixInfo, windowsInfo);

    const version = unixInfo.version;
    ensureSupportedVersion(version);

    const expectedChecksums = await downloadExpectedChecksums(config, version);
    validateChecksums(unixInfo, windowsInfo, expectedChecksums);

    reporter.info("Wrapper scripts are valid.");
  } catch (e) {
    if (e instanceof Error) {
      reporter.setFailed(e.message);
    } else {
      throw e;
    }
  }
}

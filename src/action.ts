import { WrapperInfo, WrapperInfoExtractor } from "./extractor";
import { Configuration } from "./configuration";
import fetch from "node-fetch";
import { parseChecksums, WrapperChecksums } from "./parse";
import * as semver from "semver";

export interface StatusReporter {
  setFailed(message: string): void;
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
  } catch (e) {
    if (e instanceof Error) {
      reporter.setFailed(e.message);
    } else {
      throw e;
    }
  }
}

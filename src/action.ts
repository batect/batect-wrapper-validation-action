import { WrapperInfo, WrapperInfoExtractor } from "./extractor";
import { Configuration } from "./configuration";

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

export async function execute(config: Configuration, reporter: StatusReporter): Promise<void> {
  try {
    const unixInfo = await unixWrapperInfoExtractor.extractInfo(config);
    const windowsInfo = await windowsWrapperInfoExtractor.extractInfo(config);

    ensureSameVersion(unixInfo, windowsInfo);
  } catch (e) {
    if (e instanceof Error) {
      reporter.setFailed(e.message);
    } else {
      throw e;
    }
  }
}

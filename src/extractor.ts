import * as fs from "fs";
import * as fspromises from "fs/promises";
import * as path from "path";
import { Configuration } from "./configuration";

export interface WrapperInfo {
  version: string;
  checksum: string;
}

const versionPattern = /^\d+.\d+.\d+$/;

export class WrapperInfoExtractor {
  constructor(private platform: string, private fileName: string, private versionExtractionPattern: RegExp) {
    if (!versionExtractionPattern.global) {
      throw new Error("Version extraction pattern must be a global regex.");
    }
  }

  public extractInfo = async (config: Configuration): Promise<WrapperInfo> => {
    const filePath = path.join(config.directory, this.fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`${this.platform} wrapper script '${this.fileName}' not found.`);
    }

    const fileContent = await fspromises.readFile(filePath, { encoding: "utf-8" });
    const version = this.extractVersion(fileContent);

    return {
      version,
      checksum: "",
    };
  };

  private extractVersion = (fileContent: string): string => {
    const match = [...fileContent.matchAll(this.versionExtractionPattern)];

    if (match.length === 0) {
      throw new Error(`Could not determine version of ${this.platform} wrapper script '${this.fileName}'.`);
    }

    if (match.length !== 1) {
      throw new Error(`Found multiple version numbers in ${this.platform} wrapper script '${this.fileName}'.`);
    }

    const version = match[0][1];

    if (!versionPattern.test(version)) {
      throw new Error(`${this.platform} wrapper script '${this.fileName}' has invalid version '${version}'.`);
    }

    return version;
  };
}

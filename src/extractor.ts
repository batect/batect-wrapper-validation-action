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

import * as fs from "fs";
import * as fspromises from "fs/promises";
import * as path from "path";
import { Configuration } from "./configuration";
import { sha256 } from "./hashing";

export interface WrapperInfo {
  version: string;
  actualChecksum: string;
  suspectedLineEndingStyle: LineEndingStyle;
}

export enum LineEndingStyle {
  Unix,
  Windows,
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
    const actualChecksum = sha256(fileContent);
    const suspectedLineEndingStyle = this.guessLineEndings(fileContent);

    return {
      version,
      actualChecksum,
      suspectedLineEndingStyle,
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

  private guessLineEndings = (fileContent: string): LineEndingStyle => {
    if (fileContent.includes("\r\n")) {
      return LineEndingStyle.Windows;
    } else {
      return LineEndingStyle.Unix;
    }
  };
}

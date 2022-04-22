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

export interface WrapperChecksums {
  unix: string;
  windows: string;
}

interface FileChecksum {
  fileName: string;
  checksum: string;
}

const checksumLinePattern = /^([0-9a-f]{64}) {2}(.*)$/;

const parseChecksumLine = (line: string): FileChecksum => {
  const match = line.match(checksumLinePattern);

  if (match === null) {
    throw new Error(`Checksum file entry '${line}' is invalid.`);
  }

  return {
    fileName: match[2],
    checksum: match[1],
  };
};

const findChecksum = (checksums: FileChecksum[], fileName: string): string => {
  const matches = checksums.filter((c) => c.fileName == fileName);

  if (matches.length === 0) {
    throw new Error(`Checksum file does not contain an entry for file '${fileName}'.`);
  }

  if (matches.length > 1) {
    throw new Error(`Checksum file contains ${matches.length} entries for file '${fileName}'.`);
  }

  return matches[0].checksum;
};

export const parseChecksums = (source: string): WrapperChecksums => {
  const entries = source
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map(parseChecksumLine);

  return {
    unix: findChecksum(entries, "batect"),
    windows: findChecksum(entries, "batect.cmd"),
  };
};

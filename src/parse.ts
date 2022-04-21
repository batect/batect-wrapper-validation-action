export interface WrapperChecksums {
  unix: string;
  windows: string;
}

interface FileChecksum {
  fileName: string;
  checksum: string;
}

const checksumLinePattern = /^([0-9a-f]{64})  (.*)$/;

const parseChecksumLine = (line: string): FileChecksum => {
  const match = line.match(checksumLinePattern);

  if (match === null) {
    throw new Error(`Checksum file entry '${line}' is invalid.`);
  }

  return {
    fileName: match![2],
    checksum: match![1],
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

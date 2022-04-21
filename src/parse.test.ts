import { parseChecksums } from "./parse";

describe("parsing checksum files", () => {
  describe("when the checksum file is valid", () => {
    const input = `7513b83a3d0f2cb5ee43db3b3d84d0199014e3c1dc222c318bcf87b7829ab716  batect
19e16909b4fe079ee6307dc1318f06f5b4f05db86a6922045ff84913a8afffcf  batect.cmd
`;

    it("successfully extracts the checksums for both files", () => {
      const result = parseChecksums(input);

      expect(result).toEqual({
        unix: "7513b83a3d0f2cb5ee43db3b3d84d0199014e3c1dc222c318bcf87b7829ab716",
        windows: "19e16909b4fe079ee6307dc1318f06f5b4f05db86a6922045ff84913a8afffcf",
      });
    });
  });

  describe("when the checksum file contains multiple entries for the same file", () => {
    const input = `7513b83a3d0f2cb5ee43db3b3d84d0199014e3c1dc222c318bcf87b7829ab716  batect
19e16909b4fe079ee6307dc1318f06f5b4f05db86a6922045ff84913a8afffcf  batect.cmd
19e16909b4fe079ee6307dc1318f06f5b4f05db86a6922045ff84913a8afffcf  batect.cmd
`;

    it("fails with a clear error message", () => {
      expect(() => parseChecksums(input)).toThrow("Checksum file contains 2 entries for file 'batect.cmd'.");
    });
  });

  describe("when the checksum file contains no entry for the Unix wrapper file", () => {
    const input = `19e16909b4fe079ee6307dc1318f06f5b4f05db86a6922045ff84913a8afffcf  batect.cmd`;

    it("fails with a clear error message", () => {
      expect(() => parseChecksums(input)).toThrow("Checksum file does not contain an entry for file 'batect'.");
    });
  });

  describe("when the checksum file contains no entry for the Windows wrapper file", () => {
    const input = `7513b83a3d0f2cb5ee43db3b3d84d0199014e3c1dc222c318bcf87b7829ab716  batect`;

    it("fails with a clear error message", () => {
      expect(() => parseChecksums(input)).toThrow("Checksum file does not contain an entry for file 'batect.cmd'.");
    });
  });

  describe("when the checksum file contains an entry that does not conform to the expected format", () => {
    const input = `7513b83a3d0f2cb5ee43db3b3d84d0199014e3c1dc222c318bcf87b7829ab71  batect`;

    it("fails with a clear error message", () => {
      expect(() => parseChecksums(input)).toThrow("Checksum file entry '7513b83a3d0f2cb5ee43db3b3d84d0199014e3c1dc222c318bcf87b7829ab71  batect' is invalid.");
    });
  });
});

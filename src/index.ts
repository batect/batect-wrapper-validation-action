import * as core from "@actions/core";
import { StatusReporter, execute } from "./action";
import { Configuration } from "./configuration";

const createConfig = (): Configuration => ({
  directory: process.cwd(),
});

const createReporter = (): StatusReporter => ({
  setFailed: core.setFailed,
});

async function run(): Promise<void> {
  try {
    const config = createConfig();
    const reporter = createReporter();

    await execute(config, reporter);
  } catch (e) {
    if (e instanceof Error) {
      core.setFailed(`Unhandled error: ${e.message} at ${e.stack}`);
    } else {
      core.setFailed(`Unhandled exception: ${e}`);
    }
  }
}

run();

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

import * as core from "@actions/core";
import { execute, StatusReporter } from "./action";
import { Configuration } from "./configuration";

const createConfig = (): Configuration => ({
  directory: process.cwd(),
  checksumDownloadRootUrl: "https://github.com/batect/batect/releases/download",
});

const createReporter = (): StatusReporter => ({
  setFailed: core.setFailed,
});

async function run(): Promise<void> {
  try {
    const config = createConfig();
    const reporter = createReporter();

    await execute(config, reporter);

    core.info(`Wrapper scripts are valid.`);
  } catch (e) {
    if (e instanceof Error) {
      core.setFailed(`Unhandled error: ${e.message} at ${e.stack}`);
    } else {
      core.setFailed(`Unhandled exception: ${e}`);
    }
  }
}

run();

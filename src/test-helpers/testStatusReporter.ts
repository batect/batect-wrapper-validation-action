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

export class TestStatusReporter {
  public failureReported: boolean;
  public failureMessage: string | null;
  public readonly infoMessages: string[];

  constructor() {
    this.failureReported = false;
    this.failureMessage = null;
    this.infoMessages = [];
  }

  setFailed(message: string): void {
    if (this.failureReported) {
      throw Error("A failure has already been reported for this run.");
    }

    this.failureReported = true;
    this.failureMessage = message;
  }

  info(message: string): void {
    this.infoMessages.push(message);
  }
}

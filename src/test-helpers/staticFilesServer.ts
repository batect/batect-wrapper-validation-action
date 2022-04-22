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

import express from "express";
import http from "http";
import net from "net";

export class StaticFilesServer {
  private readonly app: express.Application;
  private server: http.Server | null = null;

  constructor(directory: string) {
    this.app = express();
    this.app.use(express.static(directory));
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(0, () => {
        resolve();
      });
    });
  }

  get url(): string {
    if (this.server === null) {
      throw new Error("Server has not been started.");
    }

    const address = this.server.address() as net.AddressInfo;
    const host = address.address === "::" ? "[::]" : address.address;

    return `http://${host}:${address.port}`;
  }

  async shutdown(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server === null) {
        reject("Cannot shut down a server that was never started.");
        return;
      }

      this.server.close((err) => {
        if (err === undefined) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }
}

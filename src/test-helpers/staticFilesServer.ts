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

import { Config } from "./init";
import { differenceBetweenDates } from "./utils";

export class Globals {
  public readonly port: number;
  public readonly devMode: boolean;
  public readonly pingPath: string | null;
  public readonly schemaPath: string | null;
  public readonly rpcPath: string;

  public readonly startTime: Date = new Date();
  public getUptime() {
    const currentTime = new Date();
    const uptime = differenceBetweenDates(this.startTime, currentTime);

    return {
      uptime,
      uptimeRaw: Math.abs(currentTime.getTime() - this.startTime.getTime())
    };
  }

  private _requestsHandled: number = 0;
  public get requestsHandled(): number {
    return this._requestsHandled;
  }
  public incrementRequestsHandled() {
    this._requestsHandled++;
  }

  public get hasPing(): boolean {
    return this.pingPath !== null;
  }

  public get hasSchema(): boolean {
    return this.schemaPath !== null;
  }

  constructor({
    port = 3000,
    devMode,
    pingPath = "/",
    schemaPath = "/schema",
    rpcPath = "/rpc"
  }: Config) {
    this.port = port;
    this.devMode = devMode;
    this.pingPath = devMode ? pingPath : null;
    this.schemaPath = devMode ? schemaPath : null;
    this.rpcPath = rpcPath;
  }
}

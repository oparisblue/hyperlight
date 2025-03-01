import { Server } from "hyper-express";
import { Globals } from "./globals";
import { addPingRoute, addRpcRoute, addSchemaRoute } from "./routes";
import { Colors } from "../common";
import { addContextMiddleware } from "./context";
import { rpcs } from "./registerRpc";

export interface Config {
  /** The port to use. Default is 3000 */
  port?: number;

  /**
   * Turning dev mode to false disables both the schema and ping endpoints,
   * regardless of other configuration settings.
   *
   * This should probably be true in your dev environments, and false in prod.
   */
  devMode: boolean;

  /**
   * The path of the ping endpoint. Default is "/".
   *
   * Disabled when set to null, or when devMode is false.
   * */
  pingPath?: string | null;

  /**
   * The path to host the schema at. Default is "/schema".
   *
   * Disabled when set to null, or when devMode is false.
   */
  schemaPath?: string | null;

  /** The path that remote procedure calls hit. Default is "/rpc" */
  rpcPath?: string;

  /** Perform any additional setup or add any additional middleware */
  setup?: (server: Server) => void;
}

export let globals: Globals;

/**
 * Start your web server!
 */
export function init(config: Config): void {
  globals = new Globals(config);
  const port = globals.port;

  const server = new Server();

  addPingRoute(server);
  addRpcRoute(server);
  addSchemaRoute(server);

  addContextMiddleware(server);

  config.setup?.(server);

  server
    .listen(port)
    .then(() => {
      console.log(
        `${Colors.FgGreen}✔ Service running at http://localhost:${port} with ${
          rpcs.size
        } ${rpcs.size === 1 ? "endpoint" : "endpoints"}${Colors.Reset}`
      );
    })
    .catch(() => {
      console.error(
        `${Colors.FgRed}✖️ Service failed to start at port ${port}${Colors.Reset}`
      );
    });
}

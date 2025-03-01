import { Server } from "hyper-express";
import { globals } from "../init";
import { LIBRARY_NAME } from "../../common";

export function addPingRoute(server: Server) {
  if (globals.pingPath === null) return;

  server.get(globals.pingPath, (request, response) => {
    const { schemaPath, rpcPath, requestsHandled } = globals;
    const { uptime, uptimeRaw } = globals.getUptime();

    const baseUrl = `${request.protocol}://${request.hostname}:${globals.port}`;

    const pingPathWithBase = `${baseUrl}${globals.pingPath}`;
    const rpcPathWithBase = `${baseUrl}${rpcPath}`;
    const schemaPathWithBase = schemaPath ? `${baseUrl}${schemaPath}` : null;

    if (request.query_parameters.json != null) {
      response.type("text/json").send(
        JSON.stringify(
          {
            uptime,
            uptimeRaw,
            requestsHandled,
            rpcPath: rpcPathWithBase,
            schemaPath: schemaPathWithBase
          },
          null,
          2
        )
      );
      return;
    }

    response
      .type("text/plain")
      .send(
        `Service is up!\n\n` +
          `Uptime:               ${uptime}\n` +
          `RPC requests handled: ${requestsHandled}\n\n` +
          `RPC endpoint:         ${rpcPathWithBase}\n` +
          `Schema endpoint:      ${schemaPathWithBase ?? "disabled"}\n\n` +
          `Run "npx ${LIBRARY_NAME} add-client ${pingPathWithBase}" to set up an RPC client against this service.\n\n` +
          `This page only appears while dev mode is enabled in your service's configuration.\n` +
          `You can also go to ${pingPathWithBase}?json to receive this data formatted as JSON.\n`
      );
  });
}

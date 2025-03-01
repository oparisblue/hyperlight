import { Server } from "hyper-express";
import { globals } from "../init";
import { rpcs } from "../registerRpc";

let cachedResponse: string | undefined;

export function addSchemaRoute(server: Server) {
  if (globals.schemaPath === null) return;

  server.get(globals.schemaPath, async (_request, response) => {
    response.type("text/json").send(cachedResponse ?? buildAndCacheResponse());
  });
}

function buildAndCacheResponse(): string {
  const response = [];
  for (const rcp of rpcs.values()) {
    response.push(rcp.signature);
  }

  const json = JSON.stringify(response);
  cachedResponse = json;
  return json;
}

import { Server } from "hyper-express";
import { globals } from "../init";
import { rpcs } from "../registerRpc";
import { unwrapValueAndCheckType } from "../../common";

export function addRpcRoute(server: Server) {
  server.get(globals.rpcPath, (_request, response) => {
    response.sendStatus(400);
  });

  server.post(globals.rpcPath, async (request, response) => {
    const body = await request.json();
    if (!body) {
      response.sendStatus(400);
      return;
    }

    const apply = parseRpcNameAndParams(body);

    if (!apply) {
      response.sendStatus(400);
      return;
    }

    try {
      const result = await apply();
      response.type("text/json").send(JSON.stringify(wrap(result)));
      globals.incrementRequestsHandled();
    } catch (e) {
      console.log(e);
      response.sendStatus(500);
    }
  });
}

function parseRpcNameAndParams({
  name,
  params
}: {
  name?: string;
  params?: any;
}): (() => any) | undefined {
  if (!name) return;

  const rpc = rpcs.get(name);
  if (!rpc) return;

  const expectedParamCount = rpc.signature.params.length;

  if (expectedParamCount === 0) {
    return async () => rpc.handler();
  }

  if (!params) return;

  try {
    const unwrappedParams: any[] = [];

    if (!Array.isArray(params) || params.length !== expectedParamCount) {
      return;
    }

    // Each param is wrapped with an object like {v:"text"}, so that we can encode
    // undefined correctly
    for (let i = 0; i < expectedParamCount; i++) {
      try {
        unwrappedParams.push(
          unwrapValueAndCheckType(params[i], rpc.signature.params[i].type)
        );
      } catch {
        return;
      }
    }

    return async () => rpc.handler(...unwrappedParams);
  } catch (e) {
    console.log(e);
    return;
  }
}

function wrap(result: any): any {
  if (result instanceof Date) return { v: result.toISOString(), t: "date" };
  if (Array.isArray(result)) return { v: result.map((item) => wrap(item)) };
  if (typeof result === "object" && result != null) {
    return {
      v: Object.entries(result).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: wrap(value) }),
        {}
      )
    };
  }
  return { v: result };
}

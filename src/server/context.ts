import { create, Domain } from "node:domain";
import { randomUUID } from "node:crypto";
import { Request, DefaultRequestLocals, Server } from "hyper-express";

// Every request is wrapped in a context.
//
// No matter what happens in the NodeJS async/await event loop / if multiple
// requests are being handled at once, each request has its own private context,
// that can be read from anywhere, and which will not leak into other requests.
//
// The advantage of this is that you don't have to pass props for things like
// auth, etc down through every method, nor declare them in your params.

type DomainWithContext = Domain & { context: Record<string, unknown> };

const contextValues: { key: string; defaultValue: any }[] = [];

export function addContextMiddleware(server: Server) {
  server.use((request, response, next) => {
    const domain = create() as DomainWithContext;

    domain.context = { request };
    for (const { key, defaultValue } of contextValues) {
      domain.context[key] = defaultValue;
    }

    domain.on("error", (error) => {
      response.sendStatus(500);
      next(error);
    });

    domain.run(next);
  });
}

function getContext() {
  // @ts-expect-error
  return process.domain.context;
}

/**
 * Get the data, headers and body of the current request.
 *
 * Only available while processing a request initiated from a function
 * annotated with `@endpoint`
 */
export function getRequest(): Request<DefaultRequestLocals> {
  return getContext().request;
}

/**
 * Define a global value which is stored in the current context. You should call this at
 * the top level.
 *
 * Every request gets a context, and this value will be added to each new context. The
 * returned `getValue` and `setValue` functions manipulate the value for the context of
 * the current request.
 *
 * We ensure that data does not leak between multiple concurrent in-flight requests ---
 * they each have their own unique contexts.
 *
 * Export out the returned `getValue` and `setValue` functions to safely interact with
 * this context value in the rest of your application, without having to worry about
 * name or type conflicts.
 */
export function contextValue<T>(defaultValue: T): {
  getValue: () => T;
  setValue: (value: T) => void;
} {
  const key = randomUUID();
  contextValues.push({ key, defaultValue });

  return {
    getValue() {
      return getContext()[key];
    },
    setValue(value) {
      getContext()[key] = value;
    }
  };
}

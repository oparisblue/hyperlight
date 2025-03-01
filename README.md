# hyperlight

Hyperlight is an RPC (Remote Procedure Call) implementation built on hyper-express which allows for trivially simple client and server communication.

## Example

This is an entire example server:

```ts
import { init } from "hyperlight";

/** @endpoint */ // <-- magic @endpoint tag
export function hello(name: string): string {
  return `Hello, ${name}!`;
}

init({ port: 3000, devMode: true });
```

And, an entire example client:

```tsx
import { hello } from "./client.generated";

const greeting = await hello("Orlando"); // <-- wow!!!
console.log(greeting); // logs "Hello, Orlando!"
```

Every top-level exported function with the `@endpoint` JSDoc tag is magically made available on the client (after codegen), with full types --- and you can call them just as if they were local functions.

Validation is automatically performed to ensure that all values passed into your server exactly match the TypeScript types as defined on your endpoint functions. Complex types, such as unions, interfaces, named types, type functions like Omit, etc all work.

## Getting Started

### Setup for Servers

For servers, install the package, and then run the following command to set up a new project:

```
npx hyperlight create-server-project
```

If you prefer to do the installation manually, you can follow the steps below. This library uses ts-patch to parse the decorators and type information of your endpoint functions, and as such requires a little bit of setup:

- Install the ts-patch dev dependency into your project [as described here](https://github.com/nonara/ts-patch?tab=readme-ov-file#method-2-persistent-patch).
- Add the hyperlight plugin to the `compilerOptions` in your tsconfig.json:
  ```json
  "plugins": [{ "transform": "hyperlight/patch" }]
  ```
- Run `tsc` to build your project.

Note that currently only CommonJS modules (e.g. `module: "NodeNext"` in your tsconfig) are supported, although we do plan to add support for ESM in the future.

Once the package is installed, you can start the server by calling `init` in your root file. All `@endpoint` functions will be found automatically, just make that they're all exported, and imported into your root file, so that TypeScript doesn't skip them as uncalled.

### Setup for Clients

Clients only need hyperlight as a dev dependency for the CLI, and could even just run it through `npx`, so there's no installation needed. The generated client code is agnostic, and so should work both on node and also in the browser, depending on where you need your clients to live. You can also have multiple clients in one project.

Simply call `npx hyperlight add-client` and follow the instructions to add a client to the `rpc-config.json` file. This lets you pick your server's endpoint, and the path to a file in your project that the codegen will output to.

Then, whenever you make changes on the server (e.g. updating the endpoint types, adding new endpoints, etc), you can pull those changes on the clients by running `npx hyperlight generate`. Note that clients are able to generate against the server only if it is in dev mode, which means it exposes its schema. Once you move to production, it's recommended to disable dev mode to hide the landing page and disable the codegen against the schema.

## Documentation

### Creating an endpoint

Just add the `@endpoint` tag to a JSDoc comment above any function you want to expose, **and** make sure you also export the function from the top level of your project. All such functions will automatically be exported into the schema and available on clients after their next codegen, with nothing further that you need to do!

### Setting up the server

Call `init` at the top level to start the server. By default it will start on port 3000, and you just need to set whether you wish to run in dev mode or not. Disabling dev mode disables the landing page on the server, as well as the ability for clients to generate against its schema.

The `setup` parameter in our `init` function gives you full access to the hyper-express server object right before we start it, so you can add any additional route configuration or middleware if you need to.

### Contexts

We do provide a _context_ which wraps every request. This is essentially a unique scope which is available in any function calls that occur while handling that request. The context is guaranteed to be bound to that one request, even if others are being processed at the same time by the event loop, so it's a great place to put things like parsed authentication details such that they're easy to check (perhaps you could write a middleware that does this).

By default we also store the hyper-express `req` object for the current request in the context, and provide a `getRequest()` function that you can use if you want to get access to it.

You can add your own values to the context by calling `contextValue` at the top level, which will give you back a unique getter and a setter, which you can then export and use elsewhere with full guarantee of type safety and that no other `contextValue` is storing to the same place.

## About the backend

Behind the scenes, we use hyper-express, which is a very solid, blazing fast NodeJS webserver based on uWebsockets.js

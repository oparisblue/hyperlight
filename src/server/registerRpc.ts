import { Signature } from "../common";

export interface Rpc {
  // type safety for both parts guaranteed by the typescript plugin
  handler: (...args: any[]) => any;
  signature: Signature;
}

export let rpcs = new Map<string, Rpc>();

/**
 * @deprecated @internal
 *
 * # You shouldn't call this yourself
 * This internal method is generated for you by the typescript plugin when you
 * mark a method with one of our decorators, e.g. `@endpoint`.
 *
 * ---
 *
 * Registers an endpoint as a target for a remote procedure call.
 */
export function registerRpc(
  handler: (...args: any[]) => any,
  rawSignature: string
): void {
  const signature = JSON.parse(rawSignature) as Signature;

  rpcs.set(signature.functionName, { handler, signature });
}

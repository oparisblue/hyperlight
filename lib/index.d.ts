import { Server, Request, DefaultRequestLocals } from 'hyper-express';

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
declare function registerRpc(handler: (...args: any[]) => any, rawSignature: string): void;

interface Config {
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
/**
 * Start your web server!
 */
declare function init(config: Config): void;

/**
 * Get the data, headers and body of the current request.
 *
 * Only available while processing a request initiated from a function
 * annotated with `@endpoint`
 */
declare function getRequest(): Request<DefaultRequestLocals>;
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
declare function contextValue<T>(defaultValue: T): {
    getValue: () => T;
    setValue: (value: T) => void;
};

export { contextValue, getRequest, init, registerRpc };

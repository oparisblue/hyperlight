import { Signature } from "../common";
import { bullet, log } from "./utils";

interface FetchResult {
  schema: Signature[];
  rpcPath: string;
}

export async function fetchSchema(
  url: string
): Promise<FetchResult | undefined> {
  try {
    const pingJsonResult = await fetch(`${url}?json`);
    const pingJson = await pingJsonResult.json();

    if (
      !pingJson.schemaPath ||
      typeof pingJson.schemaPath !== "string" ||
      !pingJson.rpcPath ||
      typeof pingJson.rpcPath !== "string"
    ) {
      return;
    }

    const schemaJsonResult = await fetch(pingJson.schemaPath);
    const schemaJson = await schemaJsonResult.json();
    if (!Array.isArray(schemaJson)) return;

    return { schema: schemaJson as Signature[], rpcPath: pingJson.rpcPath };
  } catch (e) {
    return;
  }
}

export function printConnectionAdvice() {
  bullet(
    "Make sure you entered a valid URL, beginning with http:// or https://"
  );
  bullet("If you're running locally, make sure the service is up");
  bullet(
    "Check your configuration: Make sure your service is not in dev mode, or hiding its ping / schema endpoints"
  );
  bullet(
    "Make sure the URL you entered is the ping URL for your service -- you should be able to go there and see the welcome message in your browser"
  );
  bullet(
    "If you changed your ping URL in your configuration, make sure you're using the one that you specified"
  );
  bullet(
    "If your server is remote, make sure your computer has an internet connection"
  );
  log("");
}

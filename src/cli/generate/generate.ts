import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Colors } from "../../common";
import { fetchSchema, printConnectionAdvice } from "../fetchSchema";
import { GenerationConfig, GenerationConfigClient } from "../generationConfig";
import { confirm, input, log, spinner } from "../utils";
import { generateTypescriptCodeAgainstSchema } from "./generateTypescriptCodeAgainstSchema";
import { addClient } from "../addClient";
import { checkIfWeShouldProceedOnServerWithEmptyClients } from "../warnOnServerWithEmptyClients";

export async function generate(config: GenerationConfig) {
  const shouldProceed = await checkIfWeShouldProceedOnServerWithEmptyClients(
    config
  );
  if (!shouldProceed) return;

  let failed = false;

  if (config.clients.length === 0) {
    const shouldAddClient =
      shouldProceed ||
      (await confirm(
        "There are no clients or no configuration file. Would you like to add a client now?"
      ));

    if (shouldAddClient) {
      await addClient(config, undefined);
      return true;
    }

    return false;
  }

  for (const client of config.clients) {
    const result = await generateClient(client);
    if (!result) failed = true;
  }

  if (failed) {
    log("");
    log(`${Colors.FgRed}One or more clients failed to generate${Colors.Reset}`);
    printConnectionAdvice();
    return false;
  }
  return true;
}

async function generateClient(
  client: GenerationConfigClient
): Promise<boolean> {
  const stop = spinner(`Generating ${client.out} against ${client.url}...`);

  const fetchResult = await fetchSchema(client.url);
  if (!fetchResult) {
    stop(false, "failed");
    return false;
  }

  const code = generateTypescriptCodeAgainstSchema(
    fetchResult.schema,
    fetchResult.rpcPath
  );

  mkdirSync(dirname(client.out), { recursive: true });
  writeFileSync(client.out, code);
  stop(true, "done");
  return true;
}

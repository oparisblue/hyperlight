import { writeFileSync } from "node:fs";
import { Colors } from "../../common";
import { fetchSchema, printConnectionAdvice } from "../fetchSchema";
import { GenerationConfig, GenerationConfigClient } from "../generationConfig";
import { log, spinner } from "../utils";
import { generateTypescriptCodeAgainstSchema } from "./generateTypescriptCodeAgainstSchema";

export async function generate(config: GenerationConfig) {
  let failed = false;

  for (const client of config.clients) {
    const result = await generateClient(client);
    if (!result) failed = true;
  }

  log("");

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

  writeFileSync(client.out, code);
  stop(true, "done");
  return true;
}

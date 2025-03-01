import { setDefaultResultOrder } from "node:dns";
import { Colors, LIBRARY_NAME, LIBRARY_VERSION } from "../common";
import { addClient } from "./addClient";
import { createServerProject } from "./createServerProject";
import { GenerationConfig, getGenerationConfig } from "./generationConfig";
import { generate } from "./generate";
import { bullet, log } from "./utils";

// Fixes issues fetch'ing from "localhost" rather than "127.0.0.1"
setDefaultResultOrder("ipv4first");

async function cli() {
  const args = process.argv.slice(2);

  let config: GenerationConfig;
  try {
    config = getGenerationConfig();
  } catch (error: any) {
    log(`${Colors.FgRed}Failed to read config${Colors.Reset}`);
    log(error.message);
    return;
  }

  if (args[0] === "create-server-project") {
    await createServerProject(args[1]);
    return;
  }

  if (args[0] === "add-client") {
    await addClient(config, args[1]);
    return;
  }

  if (args[0] === "generate") {
    await generate(config);
    return;
  }

  printHelp();
}

function printHelp() {
  log(`${LIBRARY_NAME} version ${LIBRARY_VERSION}`);
  log("");
  bullet(`${LIBRARY_NAME} add-client`);
  log(
    `  ${Colors.FgGray}Adds a client to the configuration file for generation${Colors.Reset}`
  );
  log("");

  bullet(`${LIBRARY_NAME} generate`);
  log(
    `  ${Colors.FgGray}Runs codegen for all clients in the configuration file${Colors.Reset}`
  );
  log("");

  bullet(`${LIBRARY_NAME} create-server-project`);
  log(
    `  ${Colors.FgGray}Creates and sets up a new backend ${LIBRARY_NAME} project${Colors.Reset}`
  );
  log("");
}

void cli();

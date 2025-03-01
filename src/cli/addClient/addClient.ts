import { Colors } from "../../common";
import { fetchSchema, printConnectionAdvice } from "../fetchSchema";
import { GenerationConfig, updateGenerationConfig } from "../generationConfig";
import { input, log, spinner } from "../utils";

export async function addClient(
  existingConfig: GenerationConfig,
  urlFromArgs: string | undefined
) {
  let url: string = urlFromArgs ?? "";
  let isTryingUrlFromArgs = !!urlFromArgs;

  while (true) {
    if (!isTryingUrlFromArgs) {
      url = await input(
        "Enter the address of the server to generate against (e.g. http://localhost:3000): "
      );
      if (url === "") url = "http://localhost:3000";
    }

    const stop = spinner("Checking your server...");
    const result = await fetchSchema(url);
    if (result) {
      stop(true, "done!");
      break;
    }

    stop(false, "failed");
    printConnectionAdvice();

    if (isTryingUrlFromArgs) {
      log(
        `${Colors.FgRed}The URL you entered in the command-line arguments didn't work${Colors.Reset}, but you can try another one now.`
      );
      log("");
      isTryingUrlFromArgs = false;
    }
  }

  let out = await input(
    "Enter the path where the output will be generated (e.g. src/client.generated.ts): "
  );
  if (out === "") out = "src/client.generated.ts";

  const updatedConfig = {
    ...existingConfig,
    clients: [...existingConfig.clients, { url, out }]
  };

  updateGenerationConfig(updatedConfig);

  log("Config saved!");
  log("");
  return updatedConfig;
}

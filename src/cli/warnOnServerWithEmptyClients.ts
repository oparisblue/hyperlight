import { Colors } from "../common";
import { GenerationConfig } from "./generationConfig";
import { confirm, log } from "./utils";

let alreadyChecked = false;

export async function checkIfWeShouldProceedOnServerWithEmptyClients(
  config: GenerationConfig
): Promise<boolean> {
  if (alreadyChecked) return true;
  alreadyChecked = true;

  if (config.environment === "node" && config.clients.length === 0) {
    log(
      `${Colors.FgYellow}Note:${Colors.Reset} You're running this command on your server, which doesn't currently have any clients configured.`
    );
    log(
      "While having a server/client combo is totally valid, we just thought we'd check this is what you want?"
    );
    log("");
    return await confirm("Would you like to proceed?");
  }
  return true;
}

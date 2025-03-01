import { existsSync } from "node:fs";
import { join } from "node:path";
import { Colors, LIBRARY_NAME } from "../../common";
import { input, log, spinner } from "../utils";
import {
  createProjectFolder,
  setUpExpressLaneConfig,
  setUpGit,
  setUpTsConfig,
  setUpYarn
} from "./steps";
import { setUpSrcFolder } from "./steps/setUpSrcFolder";

export async function createServerProject(
  nameFromArgs: string | undefined
): Promise<void> {
  log(`${Colors.FgMagenta}Thanks for choosing ${LIBRARY_NAME}!${Colors.Reset}`);
  log("");
  log(`We'll create a new folder for your project in the current directory.`);
  log("");
  const name = nameFromArgs || (await getProjectName());
  log("");
  const done = spinner("Hang tight...");

  const basePath = join(process.cwd(), name);

  createProjectFolder(basePath);
  setUpYarn(basePath, name);
  setUpTsConfig(basePath);
  setUpExpressLaneConfig(basePath);
  setUpSrcFolder(basePath);
  setUpGit(basePath);

  done(true, "done!");
  log("");
  log(`${Colors.FgGreen}Your project is ready at:${Colors.Reset} ${basePath}`);
  log(
    `Run ${Colors.FgMagenta}yarn build${Colors.Reset} to build your project, and ${Colors.FgMagenta}yarn start${Colors.Reset} to start it`
  );
  log("");
  log(
    `Once your server is all up and running, you can run ${Colors.FgMagenta}npx hyperlight add-client${Colors.Reset} in your client project to run codegen against it`
  );
}

async function getProjectName() {
  while (true) {
    const name = await input("What do you want to call it?");

    if (name === "") {
      log(`${Colors.FgYellow}You must enter a name${Colors.Reset}`);
      continue;
    }

    const folderAlreadyExists = existsSync(join(process.cwd(), name));
    if (!folderAlreadyExists) return name;

    log(
      `${Colors.FgYellow}An item with that name already exists here.${Colors.Reset} Please try something else`
    );
  }
}

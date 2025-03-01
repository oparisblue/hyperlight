import { execSync, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { LIBRARY_NAME } from "../../../common";

export function setUpYarn(path: string, name: string) {
  const userName = execSync("/usr/bin/id -F").toString().trim();

  writeFileSync(
    join(path, "package.json"),
    JSON.stringify(
      {
        name,
        version: "0.1.0",
        author: userName,
        license: "UNLICENSED",
        main: "./build/index.js",
        scripts: {
          prepare: "ts-patch install -s",
          build: `tsc && esbuild --bundle ./build-tmp --minify --platform=node --external:${LIBRARY_NAME} --outfile=build/index.js && rm -rf ./build-tmp`,
          start: "node ./build/index.js"
        }
      },
      null,
      2
    )
  );

  spawnSync(`yarn --cwd ${path} add ${LIBRARY_NAME}`, { shell: true });
  spawnSync(`yarn --cwd ${path} add --dev ts-patch esbuild`, { shell: true });
}

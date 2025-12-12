import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { CONFIG_FILE_NAME } from "../../../common";

export function setUpHyperlightConfig(path: string) {
  writeFileSync(
    join(path, CONFIG_FILE_NAME),
    JSON.stringify({ environment: "node" }, null, 2)
  );
}

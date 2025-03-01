import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LIBRARY_NAME } from "../../../common";

export function setUpSrcFolder(path: string) {
  const srcPath = join(path, "src");

  mkdirSync(srcPath);
  writeFileSync(join(srcPath, "index.ts"), TEMPLATE_INDEX);
}

const TEMPLATE_INDEX = `import { init } from "${LIBRARY_NAME}";

/** @endpoint */
export function hello() {
  return "Hello, world!";
}

init({ devMode: true, port: 3000 });
`;

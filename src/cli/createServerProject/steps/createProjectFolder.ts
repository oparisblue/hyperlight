import { mkdirSync } from "node:fs";

export function createProjectFolder(path: string) {
  mkdirSync(path);
}

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

export function setUpGit(path: string) {
  writeFileSync(
    join(path, ".gitignore"),
    [
      ".DS_Store",
      "Thumbs.DB",
      "",
      "node_modules",
      "",
      "build",
      "*.generated",
      ""
    ].join("\n")
  );

  execSync(`git init ${path}`);
  execSync(`git -C ${path} add .`);
  execSync(`git -C ${path} commit --all --message="Initial commit"`);
}

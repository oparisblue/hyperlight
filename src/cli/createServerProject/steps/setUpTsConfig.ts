import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { LIBRARY_NAME } from "../../../common";

export function setUpTsConfig(path: string) {
  writeFileSync(
    join(path, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          lib: ["ESNext"],
          rootDir: "src",
          outDir: "build-tmp",
          plugins: [{ transform: `${LIBRARY_NAME}/lib/patch` }],
          module: "NodeNext",
          skipLibCheck: true,
          esModuleInterop: true
        }
      },
      null,
      2
    )
  );
}

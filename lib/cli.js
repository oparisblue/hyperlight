"use strict";

// src/cli/cli.ts
var import_node_dns = require("dns");

// src/common/meta.ts
var LIBRARY_NAME = "hyperlight";
var LIBRARY_VERSION = "0.1";
var CONFIG_FILE_NAME = "hyperlight.json";

// src/common/terminalColors.ts
var Colors = {
  Reset: "\x1B[0m",
  FgRed: "\x1B[31m",
  FgGreen: "\x1B[32m",
  FgYellow: "\x1B[33m",
  FgMagenta: "\x1B[35m",
  FgCyan: "\x1B[36m",
  FgGray: "\x1B[90m",
  BgRed: "\x1B[41m",
  BgGreen: "\x1B[42m",
  BgYellow: "\x1B[43m",
  BgMagenta: "\x1B[45m",
  BgCyan: "\x1B[46m",
  BgGray: "\x1B[100m"
};

// src/cli/utils.ts
var import_readline = require("readline");
function input(question) {
  return new Promise((resolve) => {
    const readline = (0, import_readline.createInterface)({
      input: process.stdin,
      output: process.stdout
    });
    readline.question(
      `${Colors.FgGreen}?${Colors.Reset} ${question} ${Colors.FgCyan}`,
      (result) => {
        readline.close();
        process.stdout.write(Colors.Reset);
        resolve(result);
      }
    );
  });
}
var FRAMES = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
function hideCursor() {
  process.stdout.write("\x1B[?25l");
}
function showCursor() {
  process.stdout.write("\x1B[?25h");
}
function spinner(message = "") {
  let keepSpinning = true;
  let frame = 0;
  const spin = () => {
    if (!keepSpinning) return;
    process.stdout.clearLine(-1);
    process.stdout.cursorTo(0);
    process.stdout.write(
      `${Colors.FgCyan}${FRAMES[frame]}${Colors.Reset} ${message}`
    );
    frame = (frame + 1) % FRAMES.length;
    setTimeout(spin, 100);
  };
  hideCursor();
  spin();
  return (success, updatedMessage) => {
    keepSpinning = false;
    process.stdout.clearLine(-1);
    process.stdout.cursorTo(0);
    showCursor();
    process.stdout.write(
      `${success ? `${Colors.FgGreen}\u2714` : `${Colors.FgRed}\u2716\uFE0F`}${Colors.Reset} ${message} ${updatedMessage}
`
    );
  };
}
function log(text) {
  console.log(`  ${text}`);
}
function bullet(text) {
  console.log(`  \u2022 ${text}`);
}

// src/cli/fetchSchema.ts
async function fetchSchema(url) {
  try {
    const pingJsonResult = await fetch(`${url}?json`);
    const pingJson = await pingJsonResult.json();
    if (!pingJson.schemaPath || typeof pingJson.schemaPath !== "string" || !pingJson.rpcPath || typeof pingJson.rpcPath !== "string") {
      return;
    }
    const schemaJsonResult = await fetch(pingJson.schemaPath);
    const schemaJson = await schemaJsonResult.json();
    if (!Array.isArray(schemaJson)) return;
    return { schema: schemaJson, rpcPath: pingJson.rpcPath };
  } catch (e) {
    return;
  }
}
function printConnectionAdvice() {
  bullet(
    "Make sure you entered a valid URL, beginning with http:// or https://"
  );
  bullet("If you're running locally, make sure the service is up");
  bullet(
    "Check your configuration: Make sure your service is not in dev mode, or hiding its ping / schema endpoints"
  );
  bullet(
    "Make sure the URL you entered is the ping URL for your service -- you should be able to go there and see the welcome message in your browser"
  );
  bullet(
    "If you changed your ping URL in your configuration, make sure you're using the one that you specified"
  );
  bullet(
    "If your server is remote, make sure your computer has an internet connection"
  );
  log("");
}

// src/cli/generationConfig.ts
var import_node_fs = require("fs");
var import_node_path = require("path");
function getConfigFilePath() {
  return (0, import_node_path.join)(process.cwd(), CONFIG_FILE_NAME);
}
function getGenerationConfig() {
  const path = getConfigFilePath();
  if (!(0, import_node_fs.existsSync)(path)) return { clients: [] };
  const contents = (0, import_node_fs.readFileSync)(path).toString();
  const json = JSON.parse(contents);
  if ("clients" in json && !Array.isArray(json.clients) || json.clients.some(
    (client) => !client || typeof client !== "object" || !("url" in client) || !("out" in client) || typeof client.url !== "string" || typeof client.out !== "string"
  )) {
    throw new Error(`Malformed clients array in ${CONFIG_FILE_NAME}`);
  }
  return { clients: json.clients ?? [] };
}
function updateGenerationConfig(config) {
  (0, import_node_fs.writeFileSync)(getConfigFilePath(), JSON.stringify(config, null, 2));
}

// src/cli/addClient/addClient.ts
async function addClient(existingConfig, urlFromArgs) {
  let url = urlFromArgs ?? "";
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

// src/cli/createServerProject/createServerProject.ts
var import_node_fs8 = require("fs");
var import_node_path7 = require("path");

// src/cli/createServerProject/steps/createProjectFolder.ts
var import_node_fs2 = require("fs");
function createProjectFolder(path) {
  (0, import_node_fs2.mkdirSync)(path);
}

// src/cli/createServerProject/steps/setUpYarn.ts
var import_node_child_process = require("child_process");
var import_node_fs3 = require("fs");
var import_node_path2 = require("path");
function setUpYarn(path, name) {
  const userName = (0, import_node_child_process.execSync)("/usr/bin/id -F").toString().trim();
  (0, import_node_fs3.writeFileSync)(
    (0, import_node_path2.join)(path, "package.json"),
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
  (0, import_node_child_process.spawnSync)(`yarn --cwd ${path} add ${LIBRARY_NAME}`, { shell: true });
  (0, import_node_child_process.spawnSync)(`yarn --cwd ${path} add --dev ts-patch esbuild`, { shell: true });
}

// src/cli/createServerProject/steps/setUpGit.ts
var import_node_child_process2 = require("child_process");
var import_node_fs4 = require("fs");
var import_node_path3 = require("path");
function setUpGit(path) {
  (0, import_node_fs4.writeFileSync)(
    (0, import_node_path3.join)(path, ".gitignore"),
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
  (0, import_node_child_process2.execSync)(`git init ${path}`);
  (0, import_node_child_process2.execSync)(`git -C ${path} add .`);
  (0, import_node_child_process2.execSync)(`git -C ${path} commit --all --message="Initial commit"`);
}

// src/cli/createServerProject/steps/setUpTsConfig.ts
var import_node_fs5 = require("fs");
var import_node_path4 = require("path");
function setUpTsConfig(path) {
  (0, import_node_fs5.writeFileSync)(
    (0, import_node_path4.join)(path, "tsconfig.json"),
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

// src/cli/createServerProject/steps/setUpExpressLaneConfig.ts
var import_node_fs6 = require("fs");
var import_node_path5 = require("path");
function setUpExpressLaneConfig(path) {
  (0, import_node_fs6.writeFileSync)(
    (0, import_node_path5.join)(path, CONFIG_FILE_NAME),
    JSON.stringify({ environment: "node" }, null, 2)
  );
}

// src/cli/createServerProject/steps/setUpSrcFolder.ts
var import_node_fs7 = require("fs");
var import_node_path6 = require("path");
function setUpSrcFolder(path) {
  const srcPath = (0, import_node_path6.join)(path, "src");
  (0, import_node_fs7.mkdirSync)(srcPath);
  (0, import_node_fs7.writeFileSync)((0, import_node_path6.join)(srcPath, "index.ts"), TEMPLATE_INDEX);
}
var TEMPLATE_INDEX = `import { init } from "${LIBRARY_NAME}";

/** @endpoint */
export function hello() {
  return "Hello, world!";
}

init({ devMode: true, port: 3000 });
`;

// src/cli/createServerProject/createServerProject.ts
async function createServerProject() {
  log(`${Colors.FgMagenta}Thanks for choosing ${LIBRARY_NAME}!${Colors.Reset}`);
  log("");
  log(`We'll create a new folder for your project in the current directory.`);
  log("");
  const name = await getProjectName();
  log("");
  const done = spinner("Hang tight...");
  const basePath = (0, import_node_path7.join)(process.cwd(), name);
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
}
async function getProjectName() {
  while (true) {
    const name = await input("What do you want to call it?");
    const folderAlreadyExists = (0, import_node_fs8.existsSync)((0, import_node_path7.join)(process.cwd(), name));
    if (!folderAlreadyExists) return name;
    log(
      `${Colors.FgYellow}An item with that name already exists here.${Colors.Reset} Please try something else`
    );
  }
}

// src/cli/generate/generate.ts
var import_node_fs9 = require("fs");

// src/cli/generate/flatTypeToTsType.ts
function flatTypeToTsType(type) {
  switch (type.type) {
    case "null":
      return "null";
    case "undefined":
      return "undefined";
    case "void":
      return "void";
    case "numberLiteral":
    case "stringLiteral":
    case "booleanLiteral":
      return JSON.stringify(type.value);
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "string":
      return "string";
    case "union":
      return `(${type.types.map((member) => flatTypeToTsType(member)).join("|")})`;
    case "array":
      return `${flatTypeToTsType(type.itemType)}[]`;
    case "object":
      return `{${type.keyValuePairTypes.map(([key, value]) => `${key}: ${flatTypeToTsType(value)}`).join(", ")}}`;
    case "date":
      return "Date";
  }
}

// src/cli/generate/generateTypescriptCodeAgainstSchema.ts
function generateTypescriptCodeAgainstSchema(schema, rpcPath) {
  let result = `//
// ******* AUTOGENERATED BY ${LIBRARY_NAME.toUpperCase()} *******
//

// Fetch + encoding helpers
function rpcFetch(t:string){return async(...e:any[])=>{let r=await(await fetch("${rpcPath}?"+t,{method:"POST",body:JSON.stringify({name:t,params:e.map(c)})})).json();return a(r)}}function c(t:any):any{return t instanceof Date?{v:t.toISOString(),t:"date"}:Array.isArray(t)?{v:t.map(e=>c(e))}:typeof t=="object"&&t!=null?{v:Object.entries(t).reduce((e,[n,r])=>({...e,[n]:c(r)}),{})}:{v:t}}function a(t:any):any{let e=t.v;return t.t==="date"&&typeof e=="string"?new Date(e):Array.isArray(e)?e.map(n=>a(n)):typeof e=="object"&&e!=null?Object.entries(e).reduce((n,[r,o])=>({...n,[r]:a(o)}),{}):e}

// Generated RPC methods

`;
  for (const signature of schema) {
    const name = signature.functionName;
    const params = signature.params.map(({ name: name2, type }) => `${name2}: ${flatTypeToTsType(type)}`).join(", ");
    const returnType = flatTypeToTsType(signature.returnType);
    if (signature.jsDoc) {
      result += "/**\n";
      for (const line of signature.jsDoc.split("\n")) {
        result += `* ${line}
`;
      }
      result += "*/\n";
    }
    result += `export const ${name}:(${params}) => Promise<${returnType}> = rpcFetch("${name}");

`;
  }
  return result;
}

// src/cli/generate/generate.ts
async function generate(config) {
  let failed = false;
  for (const client of config.clients) {
    const result = await generateClient(client);
    if (!result) failed = true;
  }
  log("");
  if (failed) {
    log("");
    log(`${Colors.FgRed}One or more clients failed to generate${Colors.Reset}`);
    printConnectionAdvice();
    return false;
  }
  return true;
}
async function generateClient(client) {
  const stop = spinner(`Generating ${client.out} against ${client.url}...`);
  const fetchResult = await fetchSchema(client.url);
  if (!fetchResult) {
    stop(false, "failed");
    return false;
  }
  const code = generateTypescriptCodeAgainstSchema(
    fetchResult.schema,
    fetchResult.rpcPath
  );
  (0, import_node_fs9.writeFileSync)(client.out, code);
  stop(true, "done");
  return true;
}

// src/cli/cli.ts
(0, import_node_dns.setDefaultResultOrder)("ipv4first");
async function cli() {
  const args = process.argv.slice(2);
  let config;
  try {
    config = getGenerationConfig();
  } catch (error) {
    log(`${Colors.FgRed}Failed to read config${Colors.Reset}`);
    log(error.message);
    return;
  }
  if (args[0] === "create-server-project") {
    await createServerProject();
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

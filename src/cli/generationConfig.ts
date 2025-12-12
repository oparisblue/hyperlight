import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Colors, CONFIG_FILE_NAME } from "../common";

export interface GenerationConfigClient {
  url: string;
  out: string;
}

export interface GenerationConfig {
  environment?: "node";
  clients: GenerationConfigClient[];
}

export function hasConfigFile() {
  return existsSync(getConfigFilePath());
}

function getConfigFilePath() {
  return join(process.cwd(), CONFIG_FILE_NAME);
}

export function getGenerationConfig(): GenerationConfig {
  const path = getConfigFilePath();

  if (!existsSync(path)) return { clients: [] };

  const contents = readFileSync(path).toString();
  const json = JSON.parse(contents);

  if (
    ("clients" in json && !Array.isArray(json.clients)) ||
    json.clients?.some(
      (client: unknown) =>
        !client ||
        typeof client !== "object" ||
        !("url" in client) ||
        !("out" in client) ||
        typeof client.url !== "string" ||
        typeof client.out !== "string"
    )
  ) {
    throw new Error(`Malformed clients array in ${CONFIG_FILE_NAME}`);
  }

  const environment =
    "environment" in json && json.environment === "node" ? "node" : undefined;

  return { clients: json.clients ?? [], environment };
}

export function updateGenerationConfig(config: GenerationConfig): void {
  writeFileSync(getConfigFilePath(), JSON.stringify(config, null, 2));
}

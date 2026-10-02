import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const wranglerCli = path.join(
  projectRoot,
  "node_modules",
  "wrangler",
  "wrangler-dist",
  "cli.js",
);
const configPath = path.join(projectRoot, "wrangler.docker.json");
const schemaPath = path.join(projectRoot, "scripts", "local-bootstrap.sql");
const statePath = path.join(projectRoot, ".wrangler", "state");

/**
 * Makes the local D1 schema safe to use on a brand-new clone and on previews
 * created before a later migration existed. The SQL is deliberately
 * idempotent: it never replaces crew content or media metadata.
 */
export function prepareLocalD1() {
  const result = spawnSync(
    process.execPath,
    [
      "--no-warnings",
      "--experimental-vm-modules",
      wranglerCli,
      "d1",
      "execute",
      "4l-chapeau-d1",
      "--config",
      configPath,
      "--local",
      "--persist-to",
      statePath,
      "--file",
      schemaPath,
    ],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        CLOUDFLARE_CF_FETCH_ENABLED: "false",
        WRANGLER_SEND_METRICS: "false",
        WRANGLER_WRITE_LOGS: "false",
      },
      stdio: "inherit",
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error("Impossible de préparer la base locale 4L CHAPEAU.");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  prepareLocalD1();
}

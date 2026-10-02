import { spawn } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const appRoot = process.env.APP_ROOT || "/app";
const runtimeRoot = process.env.RUNTIME_DIR || "/tmp/4l-chapeau-runtime";
const stateDir = process.env.STATE_DIR || "/var/lib/4l-chapeau";
const configSource = path.join(appRoot, "wrangler.docker.json");
const runtimeWorkerRoot = path.join(runtimeRoot, "worker");
const runtimeServerRoot = path.join(runtimeWorkerRoot, "server");
const runtimeClientRoot = path.join(runtimeWorkerRoot, "client");
const runtimeConfig = path.join(runtimeServerRoot, "wrangler.json");
const runtimeSecrets = path.join(runtimeServerRoot, ".dev.vars");
const workerCli = path.join(
  appRoot,
  "node_modules",
  "wrangler",
  "wrangler-dist",
  "cli.js",
);

let activeChild;
let stopping = false;
let runtimeDirectoryReady = false;

function fail(message) {
  throw new Error(`4L CHAPEAU Docker: ${message}`);
}

function requiredPassword(name) {
  const directValue = process.env[name];
  const filePath = process.env[`${name}_FILE`];

  if (directValue && filePath) {
    fail(`configure either ${name} or ${name}_FILE, not both.`);
  }

  let value = directValue;
  if (filePath) {
    try {
      // Docker secrets conventionally have exactly one trailing newline.
      value = readFileSync(filePath, "utf8").replace(/\r?\n$/u, "");
    } catch {
      fail(`cannot read the secret file configured by ${name}_FILE.`);
    }
  }

  if (!value) {
    fail(`missing ${name}. Supply it as an environment variable or Docker secret.`);
  }

  return value;
}

function absoluteFromApp(value) {
  return path.isAbsolute(value) ? value : path.resolve(appRoot, value);
}

function validateRuntimeDirectory() {
  const resolvedRuntime = path.resolve(runtimeRoot);
  const filesystemRoot = path.parse(resolvedRuntime).root;
  if (
    resolvedRuntime === filesystemRoot ||
    resolvedRuntime === path.resolve(appRoot) ||
    resolvedRuntime === path.resolve(stateDir)
  ) {
    fail("RUNTIME_DIR must be a dedicated temporary directory.");
  }
  runtimeDirectoryReady = true;
}

function stageRuntimeConfig() {
  let config;
  try {
    config = JSON.parse(readFileSync(configSource, "utf8"));
  } catch {
    fail("cannot read the packaged Wrangler configuration.");
  }

  validateRuntimeDirectory();
  const builtServer = path.join(appRoot, "dist", "server");
  const builtClient = path.join(appRoot, "dist", "client");

  // Workerd resolves no-bundle module imports from the configuration directory.
  // Stage the built server and client together in tmpfs so the container can
  // stay read-only without breaking relative Vinext imports.
  rmSync(runtimeWorkerRoot, { recursive: true, force: true });
  mkdirSync(runtimeWorkerRoot, { recursive: true, mode: 0o700 });
  try {
    cpSync(builtServer, runtimeServerRoot, { recursive: true });
    cpSync(builtClient, runtimeClientRoot, { recursive: true });
  } catch {
    fail("cannot stage the generated Worker output.");
  }

  config.main = "index.js";
  if (config.assets?.directory) config.assets.directory = "../client";
  for (const database of config.d1_databases ?? []) {
    if (database.migrations_dir) {
      database.migrations_dir = absoluteFromApp(database.migrations_dir);
    }
  }

  mkdirSync(stateDir, { recursive: true, mode: 0o700 });
  writeFileSync(runtimeConfig, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
}

function stageSecrets() {
  const baptiste = requiredPassword("ADMIN_BAPTISTE_PASSWORD");
  const maxence = requiredPassword("ADMIN_MAXENCE_PASSWORD");
  const nodeEnv = process.env.NODE_ENV === "development" ? "development" : "production";

  // JSON quoting is accepted by dotenv and correctly preserves punctuation in
  // passwords without placing them in process arguments or application files.
  const content = [
    `ADMIN_BAPTISTE_PASSWORD=${JSON.stringify(baptiste)}`,
    `ADMIN_MAXENCE_PASSWORD=${JSON.stringify(maxence)}`,
    `NODE_ENV=${JSON.stringify(nodeEnv)}`,
    "",
  ].join("\n");
  writeFileSync(runtimeSecrets, content, { mode: 0o600 });
  chmodSync(runtimeSecrets, 0o600);
}

function cleanup() {
  if (runtimeDirectoryReady) {
    rmSync(runtimeRoot, { recursive: true, force: true });
  }
}

function workerEnvironment() {
  return {
    ...process.env,
    CI: "true",
    CLOUDFLARE_CF_FETCH_ENABLED: "false",
    WRANGLER_SEND_METRICS: "false",
    WRANGLER_WRITE_LOGS: "false",
    WRANGLER_DISABLE_CONFIG_WATCHING: "true",
  };
}

function runWrangler(args) {
  return new Promise((resolve, reject) => {
    activeChild = spawn(
      process.execPath,
      ["--no-warnings", "--experimental-vm-modules", workerCli, ...args],
      {
        cwd: runtimeServerRoot,
        env: workerEnvironment(),
        stdio: "inherit",
      },
    );

    activeChild.once("error", reject);
    activeChild.once("exit", (code, signal) => {
      activeChild = undefined;
      if (stopping) {
        resolve();
        return;
      }
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Wrangler stopped (${signal ?? `exit code ${code ?? 1}`}).`));
    });
  });
}

function stop(signal) {
  stopping = true;
  if (activeChild && !activeChild.killed) activeChild.kill(signal);
}

process.once("SIGINT", () => stop("SIGINT"));
process.once("SIGTERM", () => stop("SIGTERM"));

async function main() {
  stageRuntimeConfig();
  stageSecrets();

  // Migration state and R2 objects share STATE_DIR, which is mounted as a
  // named Docker volume by docker-compose.yml.
  await runWrangler([
    "d1",
    "migrations",
    "apply",
    "4l-chapeau-d1",
    "--config",
    runtimeConfig,
    "--local",
    "--persist-to",
    stateDir,
  ]);

  await runWrangler([
    "dev",
    "--config",
    runtimeConfig,
    "--local",
    "--persist-to",
    stateDir,
    "--ip",
    "0.0.0.0",
    "--port",
    String(process.env.PORT || "8787"),
    "--inspector-port",
    "0",
  ]);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "4L CHAPEAU Docker startup failed.");
    process.exitCode = 1;
  })
  .finally(cleanup);

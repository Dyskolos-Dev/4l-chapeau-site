import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./sites-env.mjs";
import { prepareLocalD1 } from "./prepare-local-d1.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const wranglerCli = path.join(
  projectRoot,
  "node_modules",
  "wrangler",
  "wrangler-dist",
  "cli.js",
);

prepareLocalD1();

const child = spawn(
  process.execPath,
  [
    "--no-warnings",
    "--experimental-vm-modules",
    wranglerCli,
    "dev",
    "--config",
    path.join(projectRoot, "wrangler.docker.json"),
    "--local",
    "--persist-to",
    path.join(projectRoot, ".wrangler", "state"),
    "--ip",
    "127.0.0.1",
    "--port",
    process.env.PORT || "8787",
    "--inspector-port",
    "0",
  ],
  { cwd: projectRoot, env: process.env, stdio: "inherit" },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => child.kill(signal));
}

child.once("error", (error) => {
  throw error;
});
child.once("exit", (code) => {
  process.exitCode = code ?? 1;
});

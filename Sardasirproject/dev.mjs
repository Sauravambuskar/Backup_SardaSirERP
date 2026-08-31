import { readFileSync } from "fs";
import { spawn } from "child_process";
import { resolve } from "path";

// Load .env file
const envPath = resolve(import.meta.dirname, ".env");
const envContent = readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  envVars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const env = { ...process.env, ...envVars };

// Start API server (build then start)
const apiDir = resolve(import.meta.dirname, "artifacts/api-server");
const api = spawn("pnpm", ["run", "dev"], { cwd: apiDir, env, stdio: "inherit", shell: true });

// Start frontend with PORT override for Vite (uses 5173)
const frontendDir = resolve(import.meta.dirname, "artifacts/lawmind");
const frontendEnv = { ...env, PORT: "5173" };
const frontend = spawn("pnpm", ["run", "dev"], { cwd: frontendDir, env: frontendEnv, stdio: "inherit", shell: true });

process.on("SIGINT", () => {
  api.kill();
  frontend.kill();
  process.exit(0);
});

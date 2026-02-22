import { app } from "electron";
import { ChildProcess, spawn } from "node:child_process";
import path from "node:path";
import net from "node:net";

const isDev = !app.isPackaged;
const PROD_PORT = 3000;
const PROD_HOSTNAME = "localhost";

let serverProcess: ChildProcess | null = null;

/**
 * Find the standalone server.js path.
 */
function getServerPath(): string {
  if (isDev) {
    throw new Error("Production server should not be started in dev mode");
  }
  return path.join(process.resourcesPath!, "standalone", "server.js");
}

/**
 * Check if a port is available.
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, PROD_HOSTNAME);
  });
}

/**
 * Wait for the server to be ready (accepting connections).
 */
function waitForServer(
  port: number,
  host: string,
  timeoutMs: number = 30_000
): Promise<void> {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    function tryConnect() {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Server did not start within ${timeoutMs}ms`));
        return;
      }

      const socket = net.createConnection({ port, host }, () => {
        socket.destroy();
        resolve();
      });

      socket.on("error", () => {
        setTimeout(tryConnect, 200);
      });
    }

    tryConnect();
  });
}

/**
 * Start the standalone Next.js server as a child process.
 *
 * Uses spawn() instead of fork() because Electron's fork() uses its own
 * Node.js module resolution which can't find modules in the standalone
 * output's node_modules. By spawning with process.execPath (Electron's
 * Node binary) and setting NODE_PATH, the server resolves modules correctly.
 */
export async function startServer(): Promise<string> {
  if (isDev) {
    return `http://${PROD_HOSTNAME}:${PROD_PORT}`;
  }

  const available = await isPortAvailable(PROD_PORT);
  if (!available) {
    console.log(`[electron:server] Port ${PROD_PORT} already in use, assuming server is running`);
    return `http://${PROD_HOSTNAME}:${PROD_PORT}`;
  }

  const serverPath = getServerPath();
  const serverDir = path.dirname(serverPath);
  const standaloneNodeModules = path.join(serverDir, "node_modules");

  console.log(`[electron:server] Starting Next.js standalone server: ${serverPath}`);
  console.log(`[electron:server] Server working directory: ${serverDir}`);

  // Use spawn with Electron's Node binary (process.execPath) and pass
  // the server.js as a script argument. Set NODE_PATH so require() finds
  // modules in the standalone's node_modules directory.
  serverProcess = spawn(process.execPath, [serverPath], {
    env: {
      ...process.env,
      PORT: String(PROD_PORT),
      HOSTNAME: PROD_HOSTNAME,
      NODE_ENV: "production",
      NODE_PATH: standaloneNodeModules,
      // Electron sets this which interferes with the child process
      ELECTRON_RUN_AS_NODE: "1",
    },
    cwd: serverDir,
    stdio: "pipe",
  });

  // Log server output
  serverProcess.stdout?.on("data", (data: Buffer) => {
    console.log(`[next:server] ${data.toString().trim()}`);
  });

  serverProcess.stderr?.on("data", (data: Buffer) => {
    console.error(`[next:server:err] ${data.toString().trim()}`);
  });

  serverProcess.on("exit", (code) => {
    console.log(`[electron:server] Next.js server exited with code ${code}`);
    serverProcess = null;
  });

  // Wait for the server to accept connections
  console.log(`[electron:server] Waiting for server on port ${PROD_PORT}...`);
  await waitForServer(PROD_PORT, PROD_HOSTNAME);
  console.log(`[electron:server] Server is ready at http://${PROD_HOSTNAME}:${PROD_PORT}`);

  return `http://${PROD_HOSTNAME}:${PROD_PORT}`;
}

/**
 * Stop the standalone Next.js server.
 */
export function stopServer(): void {
  if (serverProcess) {
    console.log("[electron:server] Stopping Next.js server...");
    serverProcess.kill("SIGTERM");
    serverProcess = null;
  }
}

import * as http from "node:http";
import { EventEmitter } from "node:events";

import * as fs from "node:fs";
import * as path from "node:path";

export type HooksConfig = {
  serverPort: number;
  logToFile: boolean;
  logFolder: string;
};

export type HookEvent = {
  timestamp: string;
  hookType: string;
  payload: unknown;
};

export class FrikfrakCoreServer extends EventEmitter {
  private server: http.Server | undefined;
  private events: HookEvent[] = [];
  private port = 4321;
  private workspaceFolder = "";

  setWorkspaceFolder(folder: string): void {
    this.workspaceFolder = folder;
  }

  private loadHooksConfig(): HooksConfig {
    const defaults: HooksConfig = {
      serverPort: 4321,
      logToFile: false,
      logFolder: "logs",
    };
    if (!this.workspaceFolder) {
      return defaults;
    }
    const configPath = path.join(
      this.workspaceFolder,
      ".github",
      "hooks",
      "hooks-config.json",
    );
    try {
      const raw = fs.readFileSync(configPath, "utf8");
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return defaults;
    }
  }

  private writeHookLog(event: HookEvent): void {
    const config = this.loadHooksConfig();
    if (!config.logToFile || !this.workspaceFolder) {
      return;
    }
    try {
      const logDir = path.join(this.workspaceFolder, config.logFolder);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, "hooks.log");
      const line = `${event.timestamp} [${event.hookType}] ${JSON.stringify(event.payload)}\n`;
      fs.appendFileSync(logFile, line, "utf8");
    } catch {
      // silently ignore log write errors
    }
  }

  async start(startPort = 4321): Promise<number> {
    this.port = startPort;
    this.server = http.createServer((req, res) => this.handleRequest(req, res));

    while (true) {
      try {
        await new Promise<void>((resolve, reject) => {
          this.server?.once("error", reject);
          this.server?.listen(this.port, "127.0.0.1", () => resolve());
        });
        break;
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code !== "EADDRINUSE") {
          throw error;
        }
        this.port += 1;
      }
    }

    return this.port;
  }

  getPort(): number {
    return this.port;
  }

  stop(): void {
    this.server?.close();
  }

  private handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): void {
    const url = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "127.0.0.1"}`,
    );

    if (req.method === "GET" && url.pathname === "/api/health") {
      this.sendJson(res, 200, {
        status: "ok",
        port: this.port,
        events: this.events.length,
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/events") {
      this.sendJson(res, 200, { events: this.events });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/hooks/claude-code") {
      // legacy path kept for backward compat; fall through to generic handler below
    }

    if (req.method === "POST" && url.pathname.startsWith("/api/hooks/")) {
      const hookType = url.pathname.slice("/api/hooks/".length) || "unknown";
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        let payload: unknown = raw;
        try {
          payload = raw ? JSON.parse(raw) : {};
        } catch {
          payload = { raw };
        }

        const event: HookEvent = {
          timestamp: new Date().toISOString(),
          hookType,
          payload,
        };
        this.events.push(event);
        if (this.events.length > 100) {
          this.events.shift();
        }
        this.writeHookLog(event);
        this.emit("hookEvent", event);

        this.sendJson(res, 202, { received: true });
      });
      return;
    }

    this.sendJson(res, 404, { error: "Not found" });
  }

  private sendJson(
    res: http.ServerResponse,
    status: number,
    body: unknown,
  ): void {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(JSON.stringify(body));
  }
}

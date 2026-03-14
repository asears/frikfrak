import * as http from 'node:http';
import * as vscode from 'vscode';

type HookEvent = {
	timestamp: string;
	payload: unknown;
};

class FrikfrakCoreServer {
	private server: http.Server | undefined;
	private events: HookEvent[] = [];
	private port = 4321;

	async start(startPort = 4321): Promise<number> {
		this.port = startPort;
		this.server = http.createServer((req, res) => this.handleRequest(req, res));

		while (true) {
			try {
				await new Promise<void>((resolve, reject) => {
					this.server?.once('error', reject);
					this.server?.listen(this.port, '127.0.0.1', () => resolve());
				});
				break;
			} catch (error) {
				const nodeError = error as NodeJS.ErrnoException;
				if (nodeError.code !== 'EADDRINUSE') {
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

	private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
		const url = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`);

		if (req.method === 'GET' && url.pathname === '/api/health') {
			this.sendJson(res, 200, { status: 'ok', port: this.port, events: this.events.length });
			return;
		}

		if (req.method === 'GET' && url.pathname === '/api/events') {
			this.sendJson(res, 200, { events: this.events });
			return;
		}

		if (req.method === 'POST' && url.pathname === '/api/hooks/claude-code') {
			const chunks: Buffer[] = [];
			req.on('data', (chunk: Buffer) => chunks.push(chunk));
			req.on('end', () => {
				const raw = Buffer.concat(chunks).toString('utf8');
				let payload: unknown = raw;
				try {
					payload = raw ? JSON.parse(raw) : {};
				} catch {
					payload = { raw };
				}

				this.events.push({ timestamp: new Date().toISOString(), payload });
				if (this.events.length > 100) {
					this.events.shift();
				}

				this.sendJson(res, 202, { received: true });
			});
			return;
		}

		this.sendJson(res, 404, { error: 'Not found' });
	}

	private sendJson(res: http.ServerResponse, status: number, body: unknown): void {
		res.statusCode = status;
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.end(JSON.stringify(body));
	}
}

let coreServer: FrikfrakCoreServer | undefined;

export async function activate(context: vscode.ExtensionContext) {
	coreServer = new FrikfrakCoreServer();
	const serverPort = await coreServer.start(4321);

	console.log('Congratulations, your extension "frikfrak" is now active!');
	console.log(`Frikfrak core server listening at http://127.0.0.1:${serverPort}`);

	const disposable = vscode.commands.registerCommand('frikfrak.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from frikfrak!');
	});

	const testFrikfrakCommand = vscode.commands.registerCommand('frikfrak.testFrikfrak', () => {
		openTestFrikfrakClient(context, coreServer?.getPort() ?? serverPort);
	});

	context.subscriptions.push(disposable, testFrikfrakCommand, {
		dispose: () => coreServer?.stop(),
	});
}

function openTestFrikfrakClient(context: vscode.ExtensionContext, serverPort: number): void {
	const panel = vscode.window.createWebviewPanel(
		'frikfrakTest',
		'Test Frikfrak',
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'assets')],
		},
	);

	panel.webview.html = getClientHtml(panel.webview, context.extensionUri, serverPort);
}

function getClientHtml(webview: vscode.Webview, extensionUri: vscode.Uri, serverPort: number): string {
	const nonce = getNonce();
	const spriteUri = webview.asWebviewUri(
		vscode.Uri.joinPath(
			extensionUri,
			'assets',
			'miniverse',
			'universal_assets',
			'citizens',
			'dexter_walk.png',
		),
	);

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src http://127.0.0.1:${serverPort} http://localhost:${serverPort};" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Test Frikfrak</title>
  <style>
    body { margin: 0; background: #111; color: #ddd; font-family: sans-serif; }
    #hud { padding: 8px 12px; font-size: 12px; display: flex; gap: 16px; align-items: center; }
    canvas { display: block; margin: 0 auto; border: 1px solid #333; image-rendering: pixelated; }
  </style>
</head>
<body>
  <div id="hud">
    <span>Frikfrak Test Client</span>
    <span>Use W A S D to move</span>
    <span id="server">server: checking...</span>
  </div>
  <canvas id="stage" width="640" height="384"></canvas>
  <script nonce="${nonce}">
    const canvas = document.getElementById('stage');
    const ctx = canvas.getContext('2d');
    const serverText = document.getElementById('server');
    const sprite = new Image();
    sprite.src = '${spriteUri}';

    const position = { x: 240, y: 140 };
    const speed = 2;
    const keys = { w: false, a: false, s: false, d: false };

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (key in keys) {
        keys[key] = true;
        event.preventDefault();
      }
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      if (key in keys) {
        keys[key] = false;
        event.preventDefault();
      }
    });

    function update() {
      if (keys.w) position.y -= speed;
      if (keys.s) position.y += speed;
      if (keys.a) position.x -= speed;
      if (keys.d) position.x += speed;
      position.x = Math.max(0, Math.min(canvas.width - 32, position.x));
      position.y = Math.max(0, Math.min(canvas.height - 48, position.y));
    }

    function drawBackground() {
      ctx.fillStyle = '#1b1b1b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#2a2a2a';
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    function render() {
      update();
      drawBackground();

      if (sprite.complete) {
        ctx.drawImage(sprite, 0, 0, 32, 48, Math.round(position.x), Math.round(position.y), 64, 96);
      } else {
        ctx.fillStyle = '#8ec5ff';
        ctx.fillRect(Math.round(position.x), Math.round(position.y), 32, 48);
      }

      requestAnimationFrame(render);
    }

    fetch('http://127.0.0.1:${serverPort}/api/health')
      .then((response) => response.json())
      .then((data) => {
        serverText.textContent = 'server: online @ ' + data.port;
      })
      .catch(() => {
        serverText.textContent = 'server: unavailable';
      });

    render();
  </script>
</body>
</html>`;
}

function getNonce(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let nonce = '';
	for (let i = 0; i < 32; i++) {
		nonce += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return nonce;
}

export function deactivate() {
	coreServer?.stop();
}

import * as http from 'node:http';

export type HookEvent = {
	timestamp: string;
	payload: unknown;
};

export class FrikfrakCoreServer {
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

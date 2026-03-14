import { FrikfrakCoreServer } from './coreServer';

async function main(): Promise<void> {
	const coreServer = new FrikfrakCoreServer();
	const port = await coreServer.start(4321);
	console.log(`Frikfrak standalone server listening at http://127.0.0.1:${port}`);

	const shutdown = () => {
		coreServer.stop();
		process.exit(0);
	};

	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);
}

void main().catch((error) => {
	console.error('Failed to start Frikfrak standalone server', error);
	process.exit(1);
});

import * as vscode from 'vscode';
import * as path from 'node:path';
import { FrikfrakCoreServer } from './coreServer';
import { openTeletextPanel } from './teletextView';

type PropLayer = 'below' | 'above';

interface WorldProp {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  layer: PropLayer;
}

interface WorldData {
  gridCols: number;
  gridRows: number;
  floor: string[][];
  props: WorldProp[];
  propImages: Record<string, string>;
  tiles: Record<string, string>;
}

interface ClientPanelOptions {
  title: string;
  viewType: string;
  useWasm: boolean;
}

const FRIKFRAK_WASM_FILENAME = 'frikfrak_core.wasm';

const COZY_STARTUP_WORLD: WorldData = {
  gridCols: 16,
  gridRows: 12,
  floor: [
    Array(16).fill('exposed_brick_wall'),
    Array(16).fill('exposed_brick_wall'),
    Array(16).fill('main_floor'),
    Array(16).fill('main_floor'),
    Array(16).fill('main_floor'),
    Array(16).fill('main_floor'),
    Array(16).fill('main_floor'),
    Array(16).fill('main_floor'),
    Array(16).fill('main_floor'),
    Array(16).fill('main_floor'),
    Array(16).fill('main_floor'),
    Array(16).fill('main_floor'),
  ],
  props: [
    { id: 'large_window', x: 1.25, y: 0, w: 3, h: 2, layer: 'below' },
    { id: 'large_window', x: 6.5, y: 0, w: 3, h: 2, layer: 'below' },
    { id: 'large_window', x: 11.75, y: 0, w: 3, h: 2, layer: 'below' },
    {
      id: 'wooden_framed_whiteboard',
      x: 4.25,
      y: 0.5,
      w: 2,
      h: 1,
      layer: 'below',
    },
    { id: 'wooden_desk_single', x: 2, y: 4.5, w: 3, h: 2, layer: 'below' },
    { id: 'ergonomic_chair', x: 3, y: 6.5, w: 1, h: 1, layer: 'above' },
    { id: 'area_rug_lounge', x: 10.5, y: 4.75, w: 4, h: 3, layer: 'below' },
    {
      id: 'low_coffee_table',
      x: 11.5,
      y: 5.75,
      w: 1.5,
      h: 1.5,
      layer: 'below',
    },
    {
      id: 'bean_bag_chair_dark',
      x: 10,
      y: 5.25,
      w: 1.5,
      h: 1.5,
      layer: 'below',
    },
    {
      id: 'bean_bag_chair_light',
      x: 13,
      y: 5.25,
      w: 1.5,
      h: 1.5,
      layer: 'below',
    },
    { id: 'coffee_bar_counter', x: 0, y: 2, w: 2.7, h: 2.5, layer: 'below' },
    { id: 'bookshelf_packed', x: 12, y: 2.5, w: 2.3, h: 2, layer: 'below' },
    { id: 'wooden_desk_single', x: 6, y: 7, w: 3, h: 2, layer: 'below' },
    { id: 'ergonomic_chair', x: 7, y: 9, w: 1, h: 1, layer: 'above' },
    { id: 'tall_potted_plant', x: 10.75, y: 2.5, w: 1, h: 2, layer: 'below' },
    { id: 'mini_fridge', x: 14.5, y: 3.25, w: 0.8, h: 1.1, layer: 'below' },
    { id: 'espresso_machine', x: 0.5, y: 3, w: 1.1, h: 0.8, layer: 'below' },
  ],
  propImages: {
    wooden_desk_single: 'worlds/cozy-startup/world_assets/props/prop_0_wooden_desk_single.png',
    coffee_bar_counter: 'worlds/cozy-startup/world_assets/props/prop_4_coffee_bar_counter.png',
    ergonomic_chair: 'worlds/cozy-startup/world_assets/props/prop_1_ergonomic_chair.png',
    tall_potted_plant: 'worlds/cozy-startup/world_assets/props/prop_2_tall_potted_plant.png',
    mini_fridge: 'worlds/cozy-startup/world_assets/props/prop_6_mini_fridge.png',
    bookshelf_packed: 'worlds/cozy-startup/world_assets/props/prop_3_bookshelf_packed.png',
    espresso_machine: 'worlds/cozy-startup/world_assets/props/prop_5_espresso_machine.png',
    low_coffee_table: 'worlds/cozy-startup/world_assets/props/prop_9_low_coffee_table.png',
    bean_bag_chair_dark: 'worlds/cozy-startup/world_assets/props/prop_7_bean_bag_chair_dark.png',
    bean_bag_chair_light: 'worlds/cozy-startup/world_assets/props/prop_8_bean_bag_chair_light.png',
    wooden_framed_whiteboard:
      'worlds/cozy-startup/world_assets/props/prop_11_wooden_framed_whiteboard.png',
    area_rug_lounge: 'worlds/cozy-startup/world_assets/props/prop_12_area_rug_lounge.png',
    large_window: 'worlds/cozy-startup/world_assets/props/prop_10_large_window.png',
  },
  tiles: {
    main_floor: 'worlds/cozy-startup/world_assets/tiles/main_floor.png',
    exposed_brick_wall: 'worlds/cozy-startup/world_assets/tiles/exposed_brick_wall.png',
    concrete_accent: 'worlds/cozy-startup/world_assets/tiles/concrete_accent.png',
  },
};

let coreServer: FrikfrakCoreServer | undefined;
let hookOutputChannel: vscode.OutputChannel | undefined;

export async function activate(context: vscode.ExtensionContext) {
  coreServer = new FrikfrakCoreServer();
  const serverPort = await coreServer.start(4321);
  coreServer.setWorkspaceFolder(context.extensionUri.fsPath);

  console.log('Congratulations, your extension "frikfrak" is now active!');
  console.log(`Frikfrak core server listening at http://127.0.0.1:${serverPort}`);

  const disposable = vscode.commands.registerCommand('frikfrak.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from frikfrak!');
  });

  const testFrikfrakCommand = vscode.commands.registerCommand('frikfrak.testFrikfrak', () => {
    openTestFrikfrakClient(context, coreServer?.getPort() ?? serverPort);
  });

  const testWasmFrikfrakCommand = vscode.commands.registerCommand(
    'frikfrak.testWasmFrikfrak',
    () => {
      openTestWasmFrikfrakClient(context, coreServer?.getPort() ?? serverPort);
    },
  );

  const planFolder = path.join(context.extensionUri.fsPath, 'plan');
  const wikiCachePath = path.join(planFolder, 'wiki-events-cache.json');
  const nprCachePath = path.join(planFolder, 'npr-feed-cache.json');

  const testTeletextCommand = vscode.commands.registerCommand(
    'frikfrak.testFrikfrakTeletext',
    async () => {
      const hookEventsSnapshot = coreServer?.getEvents() ?? [];
      await openTeletextPanel(
        context,
        coreServer?.getPort() ?? serverPort,
        hookEventsSnapshot,
        planFolder,
        wikiCachePath,
        nprCachePath,
      );
    },
  );

  hookOutputChannel = vscode.window.createOutputChannel('Frikfrak Hooks');

  context.subscriptions.push(
    disposable,
    testFrikfrakCommand,
    testWasmFrikfrakCommand,
    testTeletextCommand,
    hookOutputChannel,
    {
      dispose: () => coreServer?.stop(),
    },
  );
}

function openTestFrikfrakClient(context: vscode.ExtensionContext, serverPort: number): void {
  const panel = createClientPanel(context, serverPort, {
    title: 'Test Frikfrak',
    viewType: 'frikfrakTest',
    useWasm: false,
  });
  bindProblemCount(panel);
  if (coreServer && hookOutputChannel) {
    bindHookEvents(panel, coreServer, hookOutputChannel);
  }
}

function openTestWasmFrikfrakClient(context: vscode.ExtensionContext, serverPort: number): void {
  const panel = createClientPanel(context, serverPort, {
    title: 'Test WASM Frikfrak',
    viewType: 'frikfrakWasmTest',
    useWasm: true,
  });
  bindProblemCount(panel);
  if (coreServer && hookOutputChannel) {
    bindHookEvents(panel, coreServer, hookOutputChannel);
  }
}

function createClientPanel(
  context: vscode.ExtensionContext,
  serverPort: number,
  options: ClientPanelOptions,
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    options.viewType,
    options.title,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'assets')],
    },
  );

  panel.webview.html = buildClientHtml(
    panel.webview,
    context.extensionUri,
    serverPort,
    options.useWasm,
  );
  return panel;
}

function bindHookEvents(
  panel: vscode.WebviewPanel,
  server: FrikfrakCoreServer,
  outputChannel: vscode.OutputChannel,
): void {
  const handler = (event: { timestamp: string; hookType: string; payload: unknown }) => {
    outputChannel.appendLine(
      `[${event.timestamp}] [${event.hookType}] ${JSON.stringify(event.payload)}`,
    );
    panel.webview.postMessage({ type: 'hookEvent', event });
  };
  server.on('hookEvent', handler);
  panel.onDidDispose(() => server.off('hookEvent', handler));
}

function bindProblemCount(panel: vscode.WebviewPanel): void {
  const postProblemCount = () => {
    const count = vscode.languages
      .getDiagnostics()
      .reduce((sum, [, diags]) => sum + diags.length, 0);
    panel.webview.postMessage({ type: 'problemCount', value: count });
  };

  const diagnosticsSubscription = vscode.languages.onDidChangeDiagnostics(() => {
    postProblemCount();
  });

  const visibilitySubscription = panel.onDidChangeViewState(() => {
    if (panel.visible) {
      postProblemCount();
    }
  });

  const receiveSubscription = panel.webview.onDidReceiveMessage((message) => {
    if (message && message.type === 'ready') {
      postProblemCount();
    }
  });

  panel.onDidDispose(() => {
    diagnosticsSubscription.dispose();
    visibilitySubscription.dispose();
    receiveSubscription.dispose();
  });

  postProblemCount();
}

function buildClientHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  serverPort: number,
  useWasm: boolean,
): string {
  const nonce = getNonce();
  const assetUri = (...segments: string[]): string =>
    webview
      .asWebviewUri(vscode.Uri.joinPath(extensionUri, 'assets', 'miniverse', ...segments))
      .toString();
  const wasmUri = webview
    .asWebviewUri(vscode.Uri.joinPath(extensionUri, 'assets', 'wasm', FRIKFRAK_WASM_FILENAME))
    .toString();

  const clientConfig = {
    useWasm,
    wasmUri,
    tileSize: 32,
    frameWidth: 64,
    frameHeight: 64,
    spriteSheets: {
      walk: assetUri('universal_assets', 'citizens', 'dexter_walk.png'),
      actions: assetUri('universal_assets', 'citizens', 'dexter_actions.png'),
    },
    world: {
      ...COZY_STARTUP_WORLD,
      tiles: Object.fromEntries(
        Object.entries(COZY_STARTUP_WORLD.tiles).map(([key, path]) => [
          key,
          assetUri(...path.split('/')),
        ]),
      ),
      propImages: Object.fromEntries(
        Object.entries(COZY_STARTUP_WORLD.propImages).map(([key, path]) => [
          key,
          assetUri(...path.split('/')),
        ]),
      ),
    },
    animations: {
      idle_down: { sheet: 'actions', row: 3, frames: 4, speed: 0.5 },
      idle_up: { sheet: 'actions', row: 3, frames: 4, speed: 0.5 },
      idle_left: { sheet: 'actions', row: 3, frames: 4, speed: 0.5 },
      idle_right: { sheet: 'actions', row: 3, frames: 4, speed: 0.5 },
      walk_down: { sheet: 'walk', row: 0, frames: 4, speed: 0.15 },
      walk_up: { sheet: 'walk', row: 1, frames: 4, speed: 0.15 },
      walk_left: { sheet: 'walk', row: 2, frames: 4, speed: 0.15 },
      walk_right: { sheet: 'walk', row: 3, frames: 4, speed: 0.15 },
      working: { sheet: 'actions', row: 0, frames: 4, speed: 0.3 },
      sleeping: { sheet: 'actions', row: 1, frames: 2, speed: 0.8 },
      talking: { sheet: 'actions', row: 2, frames: 4, speed: 0.15 },
    },
    player: {
      x: 6.5,
      y: 8.5,
      speed: 4.25,
      facing: 'down',
    },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'nonce-${nonce}'; connect-src ${webview.cspSource} http://127.0.0.1:${serverPort} http://localhost:${serverPort};" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Test Frikfrak</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap" rel="stylesheet">
  <style>
    :root {
      color-scheme: dark;
      --bg: #181816;
      --panel: #23211d;
      --panel-2: #2d2a24;
      --accent: #f2b257;
      --accent-2: #8cc7b5;
      --text: #f1ece1;
      --muted: #c3b9a8;
      --shadow: rgba(0, 0, 0, 0.32);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at top, rgba(242, 178, 87, 0.12), transparent 38%),
        linear-gradient(180deg, #141310 0%, #1d1b17 100%);
      color: var(--text);
      font-family: Consolas, 'Courier New', monospace;
    }

    .shell {
      width: min(100vw, 860px);
      padding: 18px;
    }

    #hud {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 14px;
      margin-bottom: 12px;
      background: linear-gradient(180deg, rgba(45, 42, 36, 0.96), rgba(32, 29, 25, 0.94));
      border: 1px solid rgba(242, 178, 87, 0.2);
      border-radius: 12px;
      box-shadow: 0 18px 40px var(--shadow);
      font-size: 12px;
      line-height: 1.45;
    }

    #hud strong {
      color: var(--accent);
      display: block;
      margin-bottom: 2px;
      font-size: 13px;
    }

    #interaction {
      color: var(--accent-2);
    }

    .stage-frame {
      position: relative;
      padding: 12px;
      background: linear-gradient(180deg, rgba(33, 30, 26, 0.96), rgba(24, 22, 19, 0.98));
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: 0 24px 50px var(--shadow);
      overflow: hidden;
    }

    .stage-frame::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), transparent 30%);
      pointer-events: none;
    }

    canvas {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 12px;
      image-rendering: pixelated;
      background: #111;
    }

    @media (max-width: 700px) {
      #hud {
        flex-direction: column;
      }
    }

    .ticker-bar {
      margin-top: 8px;
      overflow: hidden;
      background: linear-gradient(90deg, #06100a, #0c1a10);
      border: 1px solid rgba(0, 200, 80, 0.25);
      border-radius: 8px;
      height: 30px;
      display: flex;
      align-items: center;
      position: relative;
    }

    .ticker-inner {
      display: inline-block;
      white-space: nowrap;
      position: absolute;
      left: 0;
      font-family: 'Pixelify Sans', 'Courier New', monospace;
      font-size: 13px;
      font-weight: 700;
      color: #00e87d;
      letter-spacing: 0.06em;
      will-change: transform;
      text-shadow: 0 0 6px rgba(0, 232, 125, 0.5);
    }
  </style>
</head>
<body>
  <div class="shell">
    <div id="hud">
      <div>
        <strong>${useWasm ? 'Frikfrak WASM Client' : 'Frikfrak Test Client'}</strong>
        Cozy Startup office loaded from Miniverse assets.${useWasm ? ' Runtime state is driven by a Rust WASM core.' : ''}
      </div>
      <div>
        <strong>Controls</strong>
        W A S D + Z to throw [P1]. Arrow keys + Backslash to throw [P2]. Both can pick up computers or the espresso machine.
      </div>
      <div>
        <strong>Status</strong>
        <div id="server">server: checking...</div>
        <div id="interaction">tip: head to the coffee bar</div>
        <div id="runtime">runtime: ${useWasm ? 'loading wasm...' : 'javascript client'}</div>
      </div>
    </div>
    <div class="stage-frame">
      <canvas id="stage" width="512" height="384"></canvas>
    </div>
    <div class="ticker-bar">
      <span id="ticker-content" class="ticker-inner">◆ FRIKFRAK ONLINE ◆ HOOK EVENTS APPEAR HERE ◆</span>
    </div>
  </div>
  <script nonce="${nonce}">
    const config = ${JSON.stringify(clientConfig)};
    const canvas = document.getElementById('stage');
    const ctx = canvas.getContext('2d');
    const serverText = document.getElementById('server');
    const interactionText = document.getElementById('interaction');
    const runtimeText = document.getElementById('runtime');
    const vscodeApi = acquireVsCodeApi();
    ctx.imageSmoothingEnabled = false;

    const tileSize = config.tileSize;
    const frameWidth = config.frameWidth;
    const frameHeight = config.frameHeight;
    const worldWidth = config.world.gridCols * tileSize;
    const worldHeight = config.world.gridRows * tileSize;
    const gravity = 680;

    const keys = { w: false, a: false, s: false, d: false };
    const keys2 = { arrowup: false, arrowdown: false, arrowleft: false, arrowright: false };
    const images = new Map();
    const props = [...config.world.props].sort((left, right) => (left.y + left.h) - (right.y + right.h));
    const espressoProp = props.find((prop) => prop.id === 'espresso_machine') || null;
    const belowProps = props.filter((prop) => prop.layer === 'below');
    const aboveProps = props.filter((prop) => prop.layer === 'above');
    const deskPropsList = props.filter((prop) => prop.id === 'wooden_desk_single');
    const deskComputers = deskPropsList.map((desk) => ({
      deskProp: desk,
      visible: true,
      x: desk.x * tileSize + desk.w * tileSize * 0.42,
      y: desk.y * tileSize + desk.h * tileSize * 0.14,
      width: desk.w * tileSize * 0.22,
      height: desk.h * tileSize * 0.16,
    }));
    const thrownComputerObjects = deskPropsList.map(() => null);

    const player = {
      x: config.player.x * tileSize,
      y: config.player.y * tileSize,
      speed: config.player.speed * tileSize,
      facing: config.player.facing,
      animation: 'idle_down',
      frame: 0,
      frameTimer: 0,
      width: tileSize,
      height: tileSize,
      shadowWidth: 18,
      shadowHeight: 7,
    };

    const player2 = {
      x: 9.5 * tileSize,
      y: 6.5 * tileSize,
      speed: config.player.speed * tileSize,
      facing: 'down',
      animation: 'idle_down',
      frame: 0,
      frameTimer: 0,
      width: tileSize,
      height: tileSize,
      shadowWidth: 18,
      shadowHeight: 7,
    };

    const wasmState = {
      instance: null,
      exports: null,
      frameCount: 0,
      problemCount: 0,
      ready: !config.useWasm,
    };

    let thrownMachine = null;
    let espressoVisible = true;
    let statusUntil = 0;

    // Ticker
    const tickerEl = document.getElementById('ticker-content');
    const MAX_TICKER = 14;
    const tickerItems = ['FRIKFRAK ONLINE', 'P1: WASD+Z', 'P2: ARROWS+BACKSLASH', 'PROBLEMS: 0'];
    let tickerX = 0;
    let tickerContentWidth = 0;

    function updateTickerDisplay() {
      tickerEl.textContent = tickerItems.map((t) => '\u25c6 ' + t).join('   ');
      tickerContentWidth = tickerEl.scrollWidth;
      if (tickerX < -tickerContentWidth) {
        tickerX = canvas.clientWidth || 512;
      }
    }

    function updateTicker(delta) {
      tickerX -= 72 * delta;
      if (tickerContentWidth > 0 && tickerX < -tickerContentWidth) {
        tickerX = canvas.clientWidth || 512;
      }
      tickerEl.style.transform = 'translateX(' + Math.round(tickerX) + 'px)';
    }

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (!message) { return; }

      if (message.type === 'problemCount') {
        const nextCount = Number(message.value) || 0;
        wasmState.problemCount = nextCount;
        if (wasmState.exports && typeof wasmState.exports.set_problem_count === 'function') {
          wasmState.exports.set_problem_count(nextCount);
        }
        // Update ticker problems entry
        const pi = tickerItems.findIndex((t) => t.startsWith('PROBLEMS:'));
        const entry = 'PROBLEMS: ' + nextCount;
        if (pi >= 0) { tickerItems[pi] = entry; } else { tickerItems.push(entry); }
        updateTickerDisplay();
        return;
      }

      if (message.type === 'hookEvent') {
        const ev = message.event;
        const hookType = ev.hookType ||
          (ev.payload && typeof ev.payload === 'object' && (ev.payload.hookType || ev.payload.type)) ||
          'HOOK';
        const ts = new Date(ev.timestamp).toLocaleTimeString('en-US', { hour12: false });
        const label = String(hookType).toUpperCase().slice(0, 18);
        tickerItems.unshift(label + ' ' + ts);
        if (tickerItems.length > MAX_TICKER) { tickerItems.pop(); }
        updateTickerDisplay();
      }
    });

    function getPropRect(prop) {
      return {
        x: prop.x * tileSize,
        y: prop.y * tileSize,
        width: prop.w * tileSize,
        height: prop.h * tileSize,
      };
    }

    function setInteractionMessage(message, durationMs) {
      interactionText.textContent = message;
      if (durationMs) {
        statusUntil = performance.now() + durationMs;
      }
    }

    function loadImage(key, src) {
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          images.set(key, image);
          resolve();
        };
        image.onerror = () => resolve();
        image.src = src;
      });
    }

    async function loadAssets() {
      const assetLoads = [
        loadImage('sheet:walk', config.spriteSheets.walk),
        loadImage('sheet:actions', config.spriteSheets.actions),
        ...Object.entries(config.world.tiles).map(([id, src]) => loadImage('tile:' + id, src)),
        ...Object.entries(config.world.propImages).map(([id, src]) => loadImage('prop:' + id, src)),
      ];
      await Promise.all(assetLoads);
    }

    function getAnimation(name) {
      return config.animations[name] || config.animations.idle_down;
    }

    function playAnimation(name) {
      if (player.animation === name) {
        return;
      }
      player.animation = name;
      player.frame = 0;
      player.frameTimer = 0;
    }

    function updateAnimation(delta) {
      const animation = getAnimation(player.animation);
      player.frameTimer += delta;
      while (player.frameTimer >= animation.speed) {
        player.frameTimer -= animation.speed;
        player.frame = (player.frame + 1) % animation.frames;
      }
    }

    function updatePlayer(delta) {
      let moveX = 0;
      let moveY = 0;

      if (keys.w) moveY -= 1;
      if (keys.s) moveY += 1;
      if (keys.a) moveX -= 1;
      if (keys.d) moveX += 1;

      if (moveX !== 0 || moveY !== 0) {
        const length = Math.hypot(moveX, moveY) || 1;
        moveX /= length;
        moveY /= length;
        player.x += moveX * player.speed * delta;
        player.y += moveY * player.speed * delta;

        if (Math.abs(moveX) > Math.abs(moveY)) {
          player.facing = moveX > 0 ? 'right' : 'left';
        } else {
          player.facing = moveY > 0 ? 'down' : 'up';
        }

        playAnimation('walk_' + player.facing);
      } else {
        playAnimation('idle_' + player.facing);
      }

      player.x = Math.max(0, Math.min(worldWidth - tileSize, player.x));
      player.y = Math.max(tileSize, Math.min(worldHeight - tileSize, player.y));
    }

    function updateThrownMachine(delta) {
      if (!thrownMachine) {
        return;
      }

      if (thrownMachine.restTimer > 0) {
        thrownMachine.restTimer -= delta;
        if (thrownMachine.restTimer <= 0) {
          thrownMachine = null;
          espressoVisible = true;
          setInteractionMessage('espresso machine reset on the coffee bar');
        }
        return;
      }

      thrownMachine.vy += gravity * delta;
      thrownMachine.x += thrownMachine.vx * delta;
      thrownMachine.y += thrownMachine.vy * delta;
      thrownMachine.angle += thrownMachine.angularVelocity * delta;
      thrownMachine.x = Math.max(0, Math.min(worldWidth - thrownMachine.width, thrownMachine.x));

      if (thrownMachine.y >= thrownMachine.groundY) {
        thrownMachine.y = thrownMachine.groundY;
        if (Math.abs(thrownMachine.vy) > 70 && thrownMachine.bounces < 3) {
          thrownMachine.vy *= -0.42;
          thrownMachine.vx *= 0.82;
          thrownMachine.angularVelocity *= 0.7;
          thrownMachine.bounces += 1;
        } else {
          thrownMachine.vx = 0;
          thrownMachine.vy = 0;
          thrownMachine.angularVelocity = 0;
          thrownMachine.restTimer = 0.45;
        }
      }
    }

    function isNearEspressoMachine() {
      if (!espressoProp || !espressoVisible || thrownMachine) {
        return false;
      }
      const rect = getPropRect(espressoProp);
      const playerCenterX = player.x + tileSize * 0.5;
      const playerCenterY = player.y + tileSize * 0.7;
      const propCenterX = rect.x + rect.width * 0.5;
      const propCenterY = rect.y + rect.height * 0.5;
      return Math.hypot(playerCenterX - propCenterX, playerCenterY - propCenterY) < tileSize * 2.4;
    }

    function getNearestThrowable(forPlayer) {
      const px = forPlayer.x + tileSize * 0.5;
      const py = forPlayer.y + tileSize * 0.7;
      const range = tileSize * 2.4;
      if (espressoVisible && !thrownMachine && espressoProp) {
        const rect = getPropRect(espressoProp);
        if (Math.hypot(px - (rect.x + rect.width * 0.5), py - (rect.y + rect.height * 0.5)) < range) {
          return { type: 'espresso' };
        }
      }
      for (let i = 0; i < deskComputers.length; i++) {
        const comp = deskComputers[i];
        if (!comp.visible || thrownComputerObjects[i]) { continue; }
        if (Math.hypot(px - (comp.x + comp.width * 0.5), py - (comp.y + comp.height * 0.5)) < range) {
          return { type: 'computer', index: i };
        }
      }
      return null;
    }

    function tryThrow(forPlayer) {
      const target = getNearestThrowable(forPlayer);
      if (!target) {
        setInteractionMessage('nothing nearby to throw', 1200);
        return;
      }
      if (target.type === 'espresso') {
        const rect = getPropRect(espressoProp);
        const hDir = forPlayer.facing === 'left' ? -1 : forPlayer.facing === 'right' ? 1 : forPlayer.x < rect.x ? -1 : 1;
        thrownMachine = {
          x: rect.x, y: rect.y, width: rect.width, height: rect.height,
          vx: hDir * 92, vy: -255, angle: 0, angularVelocity: hDir * 8,
          bounces: 0,
          groundY: Math.min(worldHeight - rect.height - 8, rect.y + tileSize * 2.25),
          restTimer: 0,
        };
        espressoVisible = false;
        setInteractionMessage('espresso machine airborne', 1000);
      } else if (target.type === 'computer') {
        const comp = deskComputers[target.index];
        const hDir = forPlayer.facing === 'left' ? -1 : forPlayer.facing === 'right' ? 1 : forPlayer.x < comp.x ? -1 : 1;
        thrownComputerObjects[target.index] = {
          x: comp.x, y: comp.y, width: comp.width, height: comp.height,
          vx: hDir * 110, vy: -240, angle: 0, angularVelocity: hDir * 10,
          bounces: 0,
          groundY: Math.min(worldHeight - comp.height - 8, comp.y + tileSize * 2),
          restTimer: 0,
          computerIndex: target.index,
        };
        comp.visible = false;
        setInteractionMessage('computer monitor airborne', 1000);
      }
    }

    function playAnimation2(name) {
      if (player2.animation === name) { return; }
      player2.animation = name;
      player2.frame = 0;
      player2.frameTimer = 0;
    }

    function updateAnimation2(delta) {
      const animation = getAnimation(player2.animation);
      player2.frameTimer += delta;
      while (player2.frameTimer >= animation.speed) {
        player2.frameTimer -= animation.speed;
        player2.frame = (player2.frame + 1) % animation.frames;
      }
    }

    function updatePlayer2(delta) {
      let moveX = 0;
      let moveY = 0;
      if (keys2.arrowup) { moveY -= 1; }
      if (keys2.arrowdown) { moveY += 1; }
      if (keys2.arrowleft) { moveX -= 1; }
      if (keys2.arrowright) { moveX += 1; }
      if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY) || 1;
        moveX /= len; moveY /= len;
        player2.x += moveX * player2.speed * delta;
        player2.y += moveY * player2.speed * delta;
        if (Math.abs(moveX) > Math.abs(moveY)) {
          player2.facing = moveX > 0 ? 'right' : 'left';
        } else {
          player2.facing = moveY > 0 ? 'down' : 'up';
        }
        playAnimation2('walk_' + player2.facing);
      } else {
        playAnimation2('idle_' + player2.facing);
      }
      player2.x = Math.max(0, Math.min(worldWidth - tileSize, player2.x));
      player2.y = Math.max(tileSize, Math.min(worldHeight - tileSize, player2.y));
    }

    function updateThrownComputers(delta) {
      for (let i = 0; i < thrownComputerObjects.length; i++) {
        const obj = thrownComputerObjects[i];
        if (!obj) { continue; }
        if (obj.restTimer > 0) {
          obj.restTimer -= delta;
          if (obj.restTimer <= 0) {
            thrownComputerObjects[i] = null;
            deskComputers[i].visible = true;
            setInteractionMessage('computer monitor returned to the desk');
          }
          continue;
        }
        obj.vy += gravity * delta;
        obj.x += obj.vx * delta;
        obj.y += obj.vy * delta;
        obj.angle += obj.angularVelocity * delta;
        obj.x = Math.max(0, Math.min(worldWidth - obj.width, obj.x));
        if (obj.y >= obj.groundY) {
          obj.y = obj.groundY;
          if (Math.abs(obj.vy) > 70 && obj.bounces < 3) {
            obj.vy *= -0.42;
            obj.vx *= 0.82;
            obj.angularVelocity *= 0.7;
            obj.bounces += 1;
          } else {
            obj.vx = 0; obj.vy = 0; obj.angularVelocity = 0;
            obj.restTimer = 0.45;
          }
        }
      }
    }

    function drawTiles() {
      for (let row = 0; row < config.world.floor.length; row += 1) {
        for (let col = 0; col < config.world.floor[row].length; col += 1) {
          const tileId = config.world.floor[row][col];
          const image = images.get('tile:' + tileId);
          if (image) {
            ctx.drawImage(image, col * tileSize, row * tileSize, tileSize, tileSize);
          } else {
            ctx.fillStyle = row < 2 ? '#734838' : '#907553';
            ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
          }
        }
      }
    }

    function drawProp(prop) {
      if (prop.id === 'espresso_machine' && !espressoVisible) {
        return;
      }
      const rect = getPropRect(prop);
      const image = images.get('prop:' + prop.id);
      if (image) {
        ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
      } else {
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      }

	  if (prop.id === 'wooden_desk_single') {
	    const compState = deskComputers.find((c) => c.deskProp === prop);
	    if (!compState || compState.visible) {
	      drawDeskMonitor(rect, wasmState.problemCount);
	    }
	  }
    }

    function drawDeskMonitor(rect, problemCount) {
      const screenX = rect.x + rect.width * 0.42;
      const screenY = rect.y + rect.height * 0.14;
      const screenWidth = rect.width * 0.22;
      const screenHeight = rect.height * 0.16;
      ctx.fillStyle = '#112719';
      ctx.fillRect(screenX, screenY, screenWidth, screenHeight);
      ctx.strokeStyle = '#2d4c3a';
      ctx.strokeRect(screenX, screenY, screenWidth, screenHeight);
      ctx.fillStyle = '#7df4a7';
      ctx.font = 'bold 9px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(problemCount), screenX + screenWidth / 2, screenY + screenHeight / 2 + 0.5);
    }

    function drawProps(collection) {
      for (const prop of collection) {
        drawProp(prop);
      }
    }

    function drawPlayer() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(
        Math.round(player.x + tileSize * 0.5),
        Math.round(player.y + tileSize * 0.86),
        player.shadowWidth,
        player.shadowHeight,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      const animation = getAnimation(player.animation);
      const spriteSheet = images.get('sheet:' + animation.sheet);
      const drawX = Math.round(player.x + (tileSize - frameWidth) / 2);
      const drawY = Math.round(player.y + (tileSize - frameHeight));

      if (spriteSheet) {
        ctx.drawImage(
          spriteSheet,
          player.frame * frameWidth,
          animation.row * frameHeight,
          frameWidth,
          frameHeight,
          drawX,
          drawY,
          frameWidth,
          frameHeight,
        );
      } else {
        ctx.fillStyle = '#f2b257';
        ctx.fillRect(drawX + 16, drawY + 12, 32, 48);
      }
    }

    function drawPlayer2() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(
        Math.round(player2.x + tileSize * 0.5),
        Math.round(player2.y + tileSize * 0.86),
        player2.shadowWidth, player2.shadowHeight, 0, 0, Math.PI * 2,
      );
      ctx.fill();
      const animation = getAnimation(player2.animation);
      const spriteSheet = images.get('sheet:' + animation.sheet);
      const drawX = Math.round(player2.x + (tileSize - frameWidth) / 2);
      const drawY = Math.round(player2.y + (tileSize - frameHeight));
      if (spriteSheet) {
        ctx.save();
        ctx.filter = 'hue-rotate(140deg) saturate(1.4)';
        ctx.drawImage(spriteSheet, player2.frame * frameWidth, animation.row * frameHeight,
          frameWidth, frameHeight, drawX, drawY, frameWidth, frameHeight);
        ctx.filter = 'none';
        ctx.restore();
      } else {
        ctx.fillStyle = '#8cc7b5';
        ctx.fillRect(drawX + 16, drawY + 12, 32, 48);
      }
    }

    function drawThrownComputers() {
      for (const obj of thrownComputerObjects) {
        if (!obj) { continue; }
        ctx.save();
        ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
        ctx.rotate(obj.angle);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
        ctx.fillStyle = '#112719';
        ctx.fillRect(-obj.width * 0.38, -obj.height * 0.4, obj.width * 0.76, obj.height * 0.6);
        ctx.fillStyle = '#7df4a7';
        ctx.font = 'bold 5px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!ERR', 0, -obj.height * 0.12);
        ctx.restore();
      }
    }

    function drawThrowableHighlight(target) {
      ctx.fillStyle = 'rgba(242, 178, 87, 0.2)';
      ctx.strokeStyle = 'rgba(242, 178, 87, 0.85)';
      ctx.lineWidth = 1.5;
      if (target.type === 'espresso' && espressoProp) {
        const rect = getPropRect(espressoProp);
        ctx.beginPath();
        ctx.roundRect(rect.x - 6, rect.y - 6, rect.width + 12, rect.height + 12, 8);
      } else if (target.type === 'computer') {
        const comp = deskComputers[target.index];
        ctx.beginPath();
        ctx.roundRect(comp.x - 4, comp.y - 4, comp.width + 8, comp.height + 8, 5);
      }
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    function drawThrownMachine() {
      if (!thrownMachine) {
        return;
      }

      const sprite = images.get('prop:espresso_machine');
      ctx.save();
      ctx.translate(thrownMachine.x + thrownMachine.width / 2, thrownMachine.y + thrownMachine.height / 2);
      ctx.rotate(thrownMachine.angle);
      if (sprite) {
        ctx.drawImage(
          sprite,
          -thrownMachine.width / 2,
          -thrownMachine.height / 2,
          thrownMachine.width,
          thrownMachine.height,
        );
      } else {
        ctx.fillStyle = '#c4c7cc';
        ctx.fillRect(-thrownMachine.width / 2, -thrownMachine.height / 2, thrownMachine.width, thrownMachine.height);
      }
      ctx.restore();
    }

    function drawScene() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawTiles();
      drawProps(belowProps);
      const drawOrder = [
        { y: player.y, draw: drawPlayer },
        { y: player2.y, draw: drawPlayer2 },
      ].sort((a, b) => a.y - b.y);
      for (const entry of drawOrder) { entry.draw(); }
      drawProps(aboveProps);
      drawThrownMachine();
      drawThrownComputers();
      const p1Target = getNearestThrowable(player);
      const p2Target = getNearestThrowable(player2);
      if (p1Target) { drawThrowableHighlight(p1Target); }
      else if (p2Target) { drawThrowableHighlight(p2Target); }
    }

    function updateUi(now) {
      if (statusUntil > 0 && now > statusUntil) {
        statusUntil = 0;
      }

      if (statusUntil === 0) {
        const p1target = getNearestThrowable(player);
        const p2target = getNearestThrowable(player2);
        if (p1target) {
          const label = p1target.type === 'espresso' ? 'espresso machine' : 'computer monitor';
          setInteractionMessage('P1: press Z to launch the ' + label);
        } else if (p2target) {
          const label = p2target.type === 'espresso' ? 'espresso machine' : 'computer monitor';
          setInteractionMessage('P2: press Backslash to launch the ' + label);
        } else {
          setInteractionMessage('tip: head to the coffee bar or a desk');
        }
      }
    }

    function updateRuntime() {
      if (config.useWasm && wasmState.exports) {
        wasmState.frameCount = wasmState.exports.frame_count();
        wasmState.problemCount = wasmState.exports.problem_count();
        runtimeText.textContent = 'runtime: wasm frame ' + wasmState.frameCount + ' | problems ' + wasmState.problemCount;
        return;
      }

      runtimeText.textContent = config.useWasm ? 'runtime: wasm unavailable' : 'runtime: javascript client';
    }

    async function initWasm() {
      if (!config.useWasm) {
        runtimeText.textContent = 'runtime: javascript client';
        return;
      }

      try {
        const response = await fetch(config.wasmUri);
        const bytes = await response.arrayBuffer();
        const result = await WebAssembly.instantiate(bytes, {});
        wasmState.instance = result.instance;
        wasmState.exports = result.instance.exports;
        if (typeof wasmState.exports.set_problem_count === 'function') {
          wasmState.exports.set_problem_count(wasmState.problemCount);
        }
        wasmState.ready = true;
        runtimeText.textContent = 'runtime: wasm online';
      } catch (error) {
        runtimeText.textContent = 'runtime: wasm failed';
        console.error(error);
      }
    }

    let previousTime = performance.now();
    function frame(now) {
      const delta = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      if (config.useWasm && wasmState.exports && typeof wasmState.exports.tick === 'function') {
        wasmState.exports.tick();
      }
      updatePlayer(delta);
      updateAnimation(delta);
      updatePlayer2(delta);
      updateAnimation2(delta);
      updateThrownMachine(delta);
      updateThrownComputers(delta);
      updateTicker(delta);
      updateUi(now);
      updateRuntime();
      drawScene();
      requestAnimationFrame(frame);
    }

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (key in keys) { keys[key] = true; event.preventDefault(); return; }
      if (key in keys2) { keys2[key] = true; event.preventDefault(); return; }
      if (key === 'z' && !event.repeat) { tryThrow(player); event.preventDefault(); }
      if (event.code === 'Backslash' && !event.repeat) { tryThrow(player2); event.preventDefault(); }
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      if (key in keys) { keys[key] = false; event.preventDefault(); }
      if (key in keys2) { keys2[key] = false; event.preventDefault(); }
    });

    fetch('http://127.0.0.1:${serverPort}/api/health')
      .then((response) => response.json())
      .then((data) => {
        serverText.textContent = 'server: online @ ' + data.port;
      })
      .catch(() => {
        serverText.textContent = 'server: unavailable';
      });

    Promise.all([loadAssets(), initWasm()]).then(() => {
      updateTickerDisplay();
      tickerX = canvas.clientWidth || 512;
      drawScene();
      vscodeApi.postMessage({ type: 'ready' });
      requestAnimationFrame(frame);
    });
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

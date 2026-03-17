/**
 * teletextView.ts
 * Teletext-style VS Code WebView with:
 *  - WebGL CRT scanline + phosphor-glow post-process
 *  - Screen 1: live metrics (CPU, memory, VS Code diagnostics, agent status)
 *  - Screen 2: Wikipedia "Current events" summary
 *  - Screen 3: NPR latest news RSS summary
 *  - Date/time header, agents ticker footer
 *  - Left/right arrow key screen switching
 *  - AST index of open workspace files (saved to plan/ast-index.json)
 *  - Agent simulation rows (status, heartbeat, soul)
 */

import * as vscode from 'vscode';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as https from 'node:https';
import * as http from 'node:http';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AstEntry {
  file: string;
  symbols: string[];
  kind: string;
}

export interface TeletextMetrics {
  memUsedMb: number;
  memTotalMb: number;
  cpuModel: string;
  platform: string;
  extensionVersion: string;
  diagnosticsByCategory: Record<string, number>;
  openFiles: number;
  workspaceFolders: number;
  activeEditor: string | null;
  agents: AgentStatus[];
  astEntries: AstEntry[];
}

export interface AgentStatus {
  name: string;
  role: string;
  state: 'RUNNING' | 'IDLE' | 'ERROR' | 'WAITING';
  lastSeen: string;
  taskSummary: string;
}

export interface WikiEventLink {
  title: string;
  url: string;
}

export interface WikiEvent {
  text: string;
  links: WikiEventLink[];
}

export interface NprFeedItem {
  title: string;
  summary: string;
  url: string;
  published: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCharCode(parseInt(dec, 10)));
}

function stripHtmlTags(input: string): string {
  return decodeHtmlEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function extractTagValue(xml: string, tagName: string): string {
  const re = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const m = re.exec(xml);
  if (!m?.[1]) {
    return '';
  }
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function fetchTextUrl(urlText: string, maxRedirects = 4): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlText);
    const transport = url.protocol === 'http:' ? http : https;

    const req = transport.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers: {
          'User-Agent': 'FrikfrakVSCodeExtension/0.0.1 (teletext feed reader)',
          Accept: 'application/json, application/xml, text/xml, text/html;q=0.9, */*;q=0.8',
        },
      },
      (res) => {
        const statusCode = res.statusCode ?? 0;
        const location = res.headers.location;

        if (statusCode >= 300 && statusCode < 400 && location && maxRedirects > 0) {
          const redirected = new URL(location, url).toString();
          resolve(fetchTextUrl(redirected, maxRedirects - 1));
          return;
        }

        if (statusCode >= 400) {
          reject(new Error(`HTTP ${statusCode} for ${urlText}`));
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      },
    );

    req.on('error', reject);
    req.setTimeout(12000, () => req.destroy(new Error(`Timeout fetching ${urlText}`)));
    req.end();
  });
}

/** Categorise VS Code diagnostics by severity label. */
function collectDiagnosticsByCategory(): Record<string, number> {
  const counts: Record<string, number> = { error: 0, warning: 0, info: 0, hint: 0 };
  for (const [, diags] of vscode.languages.getDiagnostics()) {
    for (const d of diags) {
      const sev = vscode.DiagnosticSeverity;
      if (d.severity === sev.Error) {
        counts.error += 1;
      } else if (d.severity === sev.Warning) {
        counts.warning += 1;
      } else if (d.severity === sev.Information) {
        counts.info += 1;
      } else if (d.severity === sev.Hint) {
        counts.hint += 1;
      }
    }
  }
  return counts;
}

/** Build a lightweight AST symbol index from open workspace TypeScript/JavaScript files. */
async function buildAstIndex(planFolder: string): Promise<AstEntry[]> {
  const entries: AstEntry[] = [];

  const folders = vscode.workspace.workspaceFolders ?? [];
  for (const folder of folders) {
    let files: vscode.Uri[];
    try {
      files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, '**/*.{ts,js}'),
        '**/node_modules/**',
        80,
      );
    } catch {
      continue;
    }

    for (const fileUri of files) {
      try {
        const syms = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
          'vscode.executeDocumentSymbolProvider',
          fileUri,
        );
        if (!syms || !syms.length) {
          continue;
        }

        const flatten = (arr: vscode.DocumentSymbol[]): string[] =>
          arr.flatMap((s) => [s.name, ...flatten(s.children)]);

        entries.push({
          file: vscode.workspace.asRelativePath(fileUri),
          symbols: flatten(syms).slice(0, 24),
          kind: 'ts/js',
        });
      } catch {
        // language server not ready for this file — skip
      }
    }
  }

  // Save index for reuse
  try {
    if (!fs.existsSync(planFolder)) {
      fs.mkdirSync(planFolder, { recursive: true });
    }
    const indexPath = path.join(planFolder, 'ast-index.json');
    fs.writeFileSync(
      indexPath,
      JSON.stringify({ generated: new Date().toISOString(), entries }, null, 2),
      'utf8',
    );
  } catch {
    // ignore write errors
  }

  return entries;
}

/**
 * Parse raw wikitext from Portal:Current_events into structured event entries.
 * Handles multiple Wikipedia date-header formats:
 *   == March 15 ==   === March 15, 2026 ===   ==2026 March 15==
 * Falls back to parsing ALL bullet lines when no section headers are found.
 */
function parseCurrentEventsWikitext(wikitext: string): WikiEvent[] {
  const events: WikiEvent[] = [];
  const lines = wikitext.split('\n');
  let inLatestSection = false;
  let foundSection = false;

  // Months pattern for detecting date section headings
  const MONTH_NAMES =
    'January|February|March|April|May|June|July|August|September|October|November|December';
  const dateSectionRe = new RegExp(
    `^={2,3}\\s*(?:\\d{1,2}\\s+)?(?:${MONTH_NAMES})(?:\\s+\\d{1,2})?(?:[,\\s]+\\d{4})?\\s*={2,3}$`,
    'i',
  );

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect date section header in any reasonable format
    if (dateSectionRe.test(trimmed)) {
      if (foundSection) {
        break;
      } // stop after first (most-recent) dated section
      inLatestSection = true;
      foundSection = true;
      continue;
    }

    if (!inLatestSection) {
      continue;
    }
    // Category sub-headers (;Armed conflicts) — skip
    if (trimmed.startsWith(';')) {
      continue;
    }
    // Only process bullet-point event lines
    if (!trimmed.startsWith('*')) {
      continue;
    }

    // Extract [[Article|Display]] links
    const links: WikiEventLink[] = [];
    const linkRegex = /\[\[([^\]|#]+?)(?:\|([^\]]+?))?\]\]/g;
    let match;
    while ((match = linkRegex.exec(trimmed)) !== null) {
      const wikiTitle = match[1].trim();
      if (wikiTitle && !wikiTitle.startsWith('File:') && !wikiTitle.startsWith('Category:')) {
        links.push({
          title: (match[2]?.trim() ?? wikiTitle).slice(0, 50),
          url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(wikiTitle.replace(/ /g, '_')),
        });
      }
    }

    // Strip wikitext markup for plain display text
    const text = trimmed
      .replace(/^\*+\s*/, '')
      .replace(/\[\[([^\]|#]+)\|([^\]]+)\]\]/g, '$2')
      .replace(/\[\[([^\]]+)\]\]/g, '$1')
      .replace(/\{\{[^}]*?\}\}/g, '')
      .replace(/''/g, '')
      .replace(/'''?/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\[https?:\/\/[^\s\]]+\s*([^\]]*?)\]/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length > 5 && links.length > 0) {
      events.push({ text, links });
      if (events.length >= 18) {
        break;
      }
    }
  }

  // Fallback: if no dated section header matched, scan the entire wikitext for bullets
  if (events.length === 0 && !foundSection) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('*')) {
        continue;
      }
      const links: WikiEventLink[] = [];
      const linkRegex2 = /\[\[([^\]|#]+?)(?:\|([^\]]+?))?\]\]/g;
      let m2: RegExpExecArray | null;
      while ((m2 = linkRegex2.exec(trimmed)) !== null) {
        const wt = m2[1].trim();
        if (wt && !wt.startsWith('File:') && !wt.startsWith('Category:')) {
          links.push({
            title: (m2[2]?.trim() ?? wt).slice(0, 50),
            url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(wt.replace(/ /g, '_')),
          });
        }
      }
      const text2 = trimmed
        .replace(/^\*+\s*/, '')
        .replace(/\[\[([^\]|#]+)\|([^\]]+)\]\]/g, '$2')
        .replace(/\[\[([^\]]+)\]\]/g, '$1')
        .replace(/\{\{[^}]*?\}\}/g, '')
        .replace(/'''?/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\[https?:\/\/[^\s\]]+\s*([^\]]*?)\]/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
      if (text2.length > 5 && links.length > 0) {
        events.push({ text: text2, links });
        if (events.length >= 18) {
          break;
        }
      }
    }
  }

  if (events.length === 0) {
    events.push({
      text: 'No current events parsed. Check network or Wikipedia API.',
      links: [
        {
          title: 'Portal:Current_events',
          url: 'https://en.wikipedia.org/wiki/Portal:Current_events',
        },
      ],
    });
  }
  return events;
}

function extractCurrentEventsFromHtml(html: string): WikiEvent[] {
  const events: WikiEvent[] = [];
  const monthRe =
    /(January|February|March|April|May|June|July|August|September|October|November|December)/i;

  const headingRe = /<h[23][^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>[\s\S]*?<\/h[23]>/gi;
  const headings: Array<{ index: number; rawText: string }> = [];
  let headingMatch: RegExpExecArray | null;
  while ((headingMatch = headingRe.exec(html)) !== null) {
    headings.push({
      index: headingMatch.index,
      rawText: stripHtmlTags(headingMatch[1]),
    });
  }

  let start = 0;
  let end = html.length;
  const firstDateHeadingIndex = headings.findIndex((h) => monthRe.test(h.rawText));
  if (firstDateHeadingIndex >= 0) {
    start = headings[firstDateHeadingIndex].index;
    const nextDateHeading = headings
      .slice(firstDateHeadingIndex + 1)
      .find((h) => monthRe.test(h.rawText));
    if (nextDateHeading) {
      end = nextDateHeading.index;
    }
  }

  const section = html.slice(start, end);
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let liMatch: RegExpExecArray | null;
  while ((liMatch = liRe.exec(section)) !== null) {
    const liHtml = liMatch[1];
    if (/class\s*=\s*"(?:[^"\\]|\\.)*navbox/.test(liHtml)) {
      continue;
    }

    const links: WikiEventLink[] = [];
    const aRe = /<a[^>]+href="(\/wiki\/[^"#?]+)[^">]*"[^>]*>([\s\S]*?)<\/a>/gi;
    let aMatch: RegExpExecArray | null;
    while ((aMatch = aRe.exec(liHtml)) !== null) {
      const href = aMatch[1];
      const title = stripHtmlTags(aMatch[2]).slice(0, 50);
      const article = href.replace('/wiki/', '').trim();
      if (!article || article.startsWith('File:') || article.startsWith('Category:')) {
        continue;
      }
      links.push({
        title: title || decodeURIComponent(article.replace(/_/g, ' ')),
        url: 'https://en.wikipedia.org' + href,
      });
      if (links.length >= 4) {
        break;
      }
    }

    const text = stripHtmlTags(
      liHtml
        .replace(/<sup[^>]*class="reference"[\s\S]*?<\/sup>/gi, ' ')
        .replace(/\[[^\]]+\]/g, ' '),
    );

    if (text.length > 12 && links.length > 0) {
      events.push({ text, links });
      if (events.length >= 18) {
        break;
      }
    }
  }

  return events;
}

function formatWikiCurrentEventsSubpage(date: Date): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const y = date.getUTCFullYear();
  const m = months[date.getUTCMonth()];
  const d = date.getUTCDate();
  return `Portal:Current_events/${y}_${m}_${d}`;
}

async function fetchWikipediaEventsFromPage(pageTitle: string): Promise<WikiEvent[]> {
  const page = encodeURIComponent(pageTitle);
  const jsonText = await fetchTextUrl(
    `https://en.wikipedia.org/w/api.php?action=parse&page=${page}&prop=wikitext|text&format=json&formatversion=2&redirects=1`,
  );
  const json = JSON.parse(jsonText) as {
    parse?: { text?: string; wikitext?: string };
  };

  const wikitext = json.parse?.wikitext ?? '';
  const byWikitext = wikitext ? parseCurrentEventsWikitext(wikitext) : [];
  if (byWikitext.length > 0 && !/No current events parsed/i.test(byWikitext[0].text)) {
    return byWikitext;
  }

  const html = json.parse?.text ?? '';
  const byHtml = html ? extractCurrentEventsFromHtml(html) : [];
  return byHtml;
}

/** Fetch Wikipedia Portal:Current_events wikitext via MediaWiki Action API and parse into events. */
async function fetchWikipediaCurrentEvents(): Promise<WikiEvent[]> {
  try {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const candidates = [
      formatWikiCurrentEventsSubpage(today),
      formatWikiCurrentEventsSubpage(yesterday),
    ];

    for (const pageTitle of candidates) {
      try {
        const events = await fetchWikipediaEventsFromPage(pageTitle);
        if (events.length > 0 && !/No current events parsed/i.test(events[0].text)) {
          return events;
        }
      } catch {
        // Continue to the next candidate page.
      }
    }

    const jsonText = await fetchTextUrl(
      'https://en.wikipedia.org/w/api.php?action=parse&page=Portal%3ACurrent_events&prop=text|wikitext&format=json&formatversion=2&redirects=1',
    );
    const json = JSON.parse(jsonText) as {
      parse?: { text?: string; wikitext?: string };
    };

    const html = json.parse?.text ?? '';
    const byHtml = html ? extractCurrentEventsFromHtml(html) : [];
    if (byHtml.length > 0) {
      return byHtml;
    }

    const wikitext = json.parse?.wikitext ?? '';
    const byWikitext = wikitext ? parseCurrentEventsWikitext(wikitext) : [];
    if (byWikitext.length > 0) {
      return byWikitext;
    }

    return [
      {
        text: 'No current events parsed. Check Wikipedia API shape.',
        links: [
          {
            title: 'Portal:Current_events',
            url: 'https://en.wikipedia.org/wiki/Portal:Current_events',
          },
        ],
      },
    ];
  } catch {
    return [
      {
        text: 'Network unavailable while fetching Wikipedia events.',
        links: [
          {
            title: 'Portal:Current_events',
            url: 'https://en.wikipedia.org/wiki/Portal:Current_events',
          },
        ],
      },
    ];
  }
}

async function fetchNprNewsFeed(): Promise<NprFeedItem[]> {
  try {
    const xml = await fetchTextUrl('https://feeds.npr.org/1004/rss.xml');
    const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
    const result: NprFeedItem[] = [];

    for (const itemXml of items) {
      const title = stripHtmlTags(extractTagValue(itemXml, 'title'));
      const description = stripHtmlTags(extractTagValue(itemXml, 'description'));
      const link = decodeHtmlEntities(extractTagValue(itemXml, 'link'));
      const pubDateRaw = stripHtmlTags(extractTagValue(itemXml, 'pubDate'));
      const parsed = pubDateRaw ? new Date(pubDateRaw) : undefined;
      const published =
        parsed && !Number.isNaN(parsed.getTime())
          ? parsed.toLocaleString('en-GB', { hour12: false })
          : pubDateRaw;

      if (!title || !link) {
        continue;
      }

      result.push({
        title: title.slice(0, 180),
        summary: description.slice(0, 420),
        url: link,
        published,
      });

      if (result.length >= 20) {
        break;
      }
    }

    if (result.length > 0) {
      return result;
    }

    return [
      {
        title: 'No NPR items parsed from feed.',
        summary: 'The NPR RSS feed returned no readable items.',
        url: 'https://feeds.npr.org/1004/rss.xml',
        published: '',
      },
    ];
  } catch {
    return [
      {
        title: 'NPR feed unavailable',
        summary: 'Network unavailable while fetching NPR RSS.',
        url: 'https://feeds.npr.org/1004/rss.xml',
        published: '',
      },
    ];
  }
}

/** Simulate agent states — in a real deployment these come from actual hook events. */
function buildAgentStatuses(
  hookEvents: Array<{ timestamp: string; hookType: string }>,
): AgentStatus[] {
  const now = Date.now();
  const agentTemplates: AgentStatus[] = [
    {
      name: 'COPILOT',
      role: 'code-gen',
      state: 'RUNNING',
      lastSeen: '',
      taskSummary: 'Generating teletext view',
    },
    {
      name: 'HEARTBEAT',
      role: 'monitor',
      state: 'IDLE',
      lastSeen: '',
      taskSummary: 'Pulse every 30s',
    },
    {
      name: 'TICKER',
      role: 'events',
      state: 'WAITING',
      lastSeen: '',
      taskSummary: 'Awaiting hook events',
    },
    { name: 'AST-SCAN', role: 'analysis', state: 'IDLE', lastSeen: '', taskSummary: 'Index built' },
    {
      name: 'WIKI-FEED',
      role: 'info',
      state: 'IDLE',
      lastSeen: '',
      taskSummary: 'Current events loaded',
    },
  ];

  // Simulate state cycling based on time
  const cycle = Math.floor(now / 5000) % 4;
  const stateMap: Array<AgentStatus['state']> = ['RUNNING', 'IDLE', 'WAITING', 'ERROR'];
  for (let i = 0; i < agentTemplates.length; i++) {
    agentTemplates[i].state = stateMap[(i + cycle) % stateMap.length];
    agentTemplates[i].lastSeen = new Date(
      now - (i * 3000 + Math.floor(Math.random() * 2000)),
    ).toISOString();
  }

  // Overlay real hook events
  if (hookEvents.length > 0) {
    const latest = hookEvents[hookEvents.length - 1];
    const tickerAgent = agentTemplates.find((a) => a.name === 'TICKER');
    if (tickerAgent) {
      tickerAgent.state = 'RUNNING';
      tickerAgent.taskSummary = latest.hookType.toUpperCase().slice(0, 22);
      tickerAgent.lastSeen = latest.timestamp;
    }
  }

  return agentTemplates;
}

/** Collect all metrics needed for the teletext display. */
async function collectMetrics(
  context: vscode.ExtensionContext,
  hookEvents: Array<{ timestamp: string; hookType: string }>,
): Promise<TeletextMetrics> {
  const memInfo = process.memoryUsage();
  const totalMem = os.totalmem();
  const cpus = os.cpus();

  const planFolder = path.join(context.extensionUri.fsPath, 'plan');
  const astEntries = await buildAstIndex(planFolder);

  return {
    memUsedMb: Math.round(memInfo.heapUsed / 1024 / 1024),
    memTotalMb: Math.round(totalMem / 1024 / 1024),
    cpuModel: cpus[0]?.model?.replace(/\s+/g, ' ').slice(0, 28) ?? 'Unknown',
    platform: os.platform(),
    extensionVersion: (context.extension.packageJSON.version as string) ?? '0.0.1',
    diagnosticsByCategory: collectDiagnosticsByCategory(),
    openFiles: vscode.window.tabGroups.all.reduce((sum, tg) => sum + tg.tabs.length, 0),
    workspaceFolders: vscode.workspace.workspaceFolders?.length ?? 0,
    activeEditor: vscode.window.activeTextEditor?.document.fileName ?? null,
    agents: buildAgentStatuses(hookEvents),
    astEntries,
  };
}

// ── HTML Builder ──────────────────────────────────────────────────────────────

export function buildTeletextHtml(
  webview: vscode.Webview,
  metrics: TeletextMetrics,
  wikiEvents: WikiEvent[],
  nprFeed: NprFeedItem[],
  planFolder: string,
  serverPort: number,
): string {
  const nonce = getNonce();

  const wikiEventsJson = JSON.stringify(wikiEvents);
  const nprFeedJson = JSON.stringify(nprFeed);
  const metricsJson = JSON.stringify(metrics);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'nonce-${nonce}'; connect-src http://127.0.0.1:${serverPort} http://localhost:${serverPort};" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Frikfrak Teletext</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000;
      color: #fff;
      font-family: 'VT323', 'Share Tech Mono', monospace;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    #teletext-root {
      position: relative;
      width: 100%;
      height: 100%;
    }
    /* WebGL canvas sits behind as CRT post-process layer */
    #crt-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }
    /* Content canvas — teletext text rendered here */
    #tt-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
      z-index: 1;
    }
  </style>
</head>
<body>
  <div id="teletext-root">
    <canvas id="tt-canvas"></canvas>
    <canvas id="crt-canvas"></canvas>
  </div>

  <script nonce="${nonce}">
  (function() {
    'use strict';

    // ── Data ──────────────────────────────────────────────────────────────────
    const METRICS = ${metricsJson};
    const WIKI_EVENTS = ${wikiEventsJson};
    const NPR_FEED = ${nprFeedJson};
    const vscodeApi = acquireVsCodeApi();

    // ── Canvas setup ─────────────────────────────────────────────────────────
    const ttCanvas = document.getElementById('tt-canvas');
    const ttCtx = ttCanvas.getContext('2d');
    const crtCanvas = document.getElementById('crt-canvas');

    const TT_COLS = 40;
    const TT_ROWS = 25;
    let CW = 0; // cell width px
    let CH = 0; // cell height px
    let W = 0;  // canvas pixel width
    let H = 0;  // canvas pixel height

    function resizeCanvases() {
      W = window.innerWidth;
      H = window.innerHeight;
      ttCanvas.width = W;
      ttCanvas.height = H;
      crtCanvas.width = W;
      crtCanvas.height = H;
      CW = Math.floor(W / TT_COLS);
      CH = Math.floor(H / TT_ROWS);
    }
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);

    // ── Teletext colour palette ───────────────────────────────────────────────
    const C = {
      BLACK:   '#000000',
      WHITE:   '#ffffff',
      RED:     '#ff2222',
      GREEN:   '#00e87d',
      YELLOW:  '#ffff00',
      BLUE:    '#1a1aff',
      MAGENTA: '#ff22ff',
      CYAN:    '#00ffff',
      GREY:    '#888888',
      D_BLUE:  '#000088',
      D_GREEN: '#005500',
      D_CYAN:  '#006666',
      D_RED:   '#660000',
    };

    // ── Screen state ─────────────────────────────────────────────────────────
    let currentScreen = 0;
    const SCREEN_COUNT = 3;

    // Live metrics that get updated
    let liveMetrics = { ...METRICS };
    let agentFrame = 0;
    let tickerItems = ['FRIKFRAK TELETEXT ONLINE', 'PRESS LEFT/RIGHT TO CHANGE SCREEN'];
    let tickerX = 0;
    let lastTime = 0;

    // AST tree-map data
    const astNodes = METRICS.astEntries ?? [];

    // ── Input ─────────────────────────────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        currentScreen = (currentScreen - 1 + SCREEN_COUNT) % SCREEN_COUNT;
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === 'ArrowRight') {
        currentScreen = (currentScreen + 1) % SCREEN_COUNT;
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // ── VS Code message bus ───────────────────────────────────────────────────
    window.addEventListener('message', (ev) => {
      const msg = ev.data;
      if (!msg) { return; }
      if (msg.type === 'metricsUpdate') {
        liveMetrics = msg.metrics;
        agentFrame++;
      }
      if (msg.type === 'hookEvent') {
        const ev2 = msg.event;
        const label = (ev2.hookType || 'HOOK').toUpperCase().slice(0, 20);
        const ts = new Date(ev2.timestamp).toLocaleTimeString('en-US', { hour12: false });
        tickerItems.unshift(label + ' @ ' + ts);
        if (tickerItems.length > 20) { tickerItems.pop(); }
      }
      if (msg.type === 'ready') {
        vscodeApi.postMessage({ type: 'ready' });
      }
    });
    vscodeApi.postMessage({ type: 'ready' });

    // ── Drawing helpers ───────────────────────────────────────────────────────

    /** Fill a cell background at (col, row) grid position. */
    function fillCell(col, row, color, colSpan = 1, rowSpan = 1) {
      ttCtx.fillStyle = color;
      ttCtx.fillRect(col * CW, row * CH, CW * colSpan, CH * rowSpan);
    }

    /**
     * Draw text at grid (col, row).
     * fontSize defaults to ~90% of cell height.
     */
    function drawText(text, col, row, fgColor = C.WHITE, bgColor = null, fontOverride = null) {
      const fs = fontOverride ?? Math.max(10, Math.floor(CH * 0.9));
      ttCtx.font = fs + 'px "VT323", monospace';
      if (bgColor) {
        const w = text.length * CW;
        ttCtx.fillStyle = bgColor;
        ttCtx.fillRect(col * CW, row * CH, w, CH);
      }
      ttCtx.fillStyle = fgColor;
      ttCtx.fillText(text, col * CW + 2, row * CH + fs - 1);
    }

    /** Draw a horizontal rule. */
    function hRule(row, color = C.CYAN, char = '\u2500') {
      drawText(char.repeat(TT_COLS), 0, row, color);
    }

    /** Draw header row (page number, title, time). */
    function drawHeader(pageNum, title) {
      fillCell(0, 0, C.D_BLUE, TT_COLS, 1);
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
      const pageStr = 'P' + String(pageNum).padStart(3, '0');
      drawText(pageStr, 0, 0, C.WHITE, null);
      drawText('FRIKFRAK', 4, 0, C.CYAN, null);
      // centred title
      const titlePad = Math.max(0, Math.floor((TT_COLS / 2) - title.length / 2));
      drawText(title, titlePad, 0, C.YELLOW, null);
      drawText(dateStr, TT_COLS - 22, 0, C.WHITE, null);
      drawText(timeStr, TT_COLS - 9, 0, C.GREEN, null);
    }

    /** Draw footer ticker. */
    function drawFooter(delta) {
      const row = TT_ROWS - 1;
      fillCell(0, row, C.D_GREEN, TT_COLS, 1);
      const tickerText = tickerItems.map((t) => '\u25c6 ' + t).join('   ');

      // Scroll
      tickerX -= 60 * delta;
      const textWidth = tickerText.length * (CW * 0.65);
      if (tickerX < -textWidth) { tickerX = W; }

      ttCtx.save();
      ttCtx.beginPath();
      ttCtx.rect(0, row * CH, W, CH);
      ttCtx.clip();
      ttCtx.font = Math.max(10, Math.floor(CH * 0.82)) + 'px "VT323", monospace';
      ttCtx.fillStyle = C.YELLOW;
      ttCtx.fillText(tickerText, tickerX, row * CH + Math.floor(CH * 0.82));
      ttCtx.restore();
    }

    // ── Screen 1: Metrics dashboard ───────────────────────────────────────────

    function drawMetricsLabels() {
      // Section: System
      fillCell(0, 1, C.D_BLUE, TT_COLS, 1);
      drawText('SYSTEM METRICS', 1, 1, C.CYAN);

      const m = liveMetrics;
      drawText('CPU  ' + m.cpuModel, 0, 2, C.WHITE);
      drawText('MEM  ' + m.memUsedMb + 'MB HEAP / ' + m.memTotalMb + 'MB TOTAL', 0, 3, C.GREEN);
      drawText('PLAT ' + m.platform.toUpperCase() + '  EXT v' + m.extensionVersion, 0, 4, C.WHITE);

      hRule(5, C.GREY, '\u2500');

      // Diagnostics
      fillCell(0, 6, C.D_RED, 20, 1);
      fillCell(20, 6, C.D_GREEN, 20, 1);
      drawText('PROBLEMS', 1, 6, C.YELLOW);
      drawText('WORKSPACE', 21, 6, C.YELLOW);

      const diag = m.diagnosticsByCategory ?? {};
      const lines = [
        ['ERR   ', String(diag.error ?? 0), C.RED],
        ['WARN  ', String(diag.warning ?? 0), C.YELLOW],
        ['INFO  ', String(diag.info ?? 0), C.CYAN],
        ['HINT  ', String(diag.hint ?? 0), C.WHITE],
      ];
      lines.forEach(([label, val, col], i) => {
        drawText(label + val, 1, 7 + i, col);
        // bar
        const barLen = Math.min(14, Number(val));
        drawText('\u2588'.repeat(barLen), 9, 7 + i, col);
      });

      drawText('FILES  ' + m.openFiles, 21, 7, C.WHITE);
      drawText('FOLDERS ' + m.workspaceFolders, 21, 8, C.WHITE);
      const editorName = m.activeEditor
        ? m.activeEditor.split(/[\\/]/).pop()?.slice(0, 18) ?? '—'
        : '—';
      drawText('ACTIVE ' + editorName, 21, 9, C.CYAN);

      hRule(11, C.GREY, '\u2500');

      // Agents table
      fillCell(0, 12, C.MAGENTA, TT_COLS, 1);
      drawText(' AGENT SIMULATION', 0, 12, C.BLACK);

      const stateColors = { RUNNING: C.GREEN, IDLE: C.WHITE, WAITING: C.YELLOW, ERROR: C.RED };
      const agents = m.agents ?? [];
      agents.forEach((ag, i) => {
        const row = 13 + i;
        if (row >= TT_ROWS - 3) { return; }
        const stateCol = stateColors[ag.state] ?? C.WHITE;
        const stateStr = ag.state.padEnd(7);
        drawText(ag.name.padEnd(10) + stateStr + ag.role.padEnd(10) + ag.taskSummary.slice(0, 12), 0, row, stateCol);
        // blinky dot for RUNNING
        if (ag.state === 'RUNNING') {
          const blink = Math.floor(Date.now() / 500) % 2 === 0 ? '\u25cf' : '\u25cb';
          drawText(blink, TT_COLS - 2, row, C.GREEN);
        }
      });

      hRule(TT_ROWS - 3, C.GREY, '\u2500');

      // Mini AST tree-map
      fillCell(0, TT_ROWS - 2, C.D_CYAN, TT_COLS, 1);
      drawText(' AST INDEX  ' + astNodes.length + ' FILES', 0, TT_ROWS - 2, C.BLACK);
    }

    // ── Screen 2: Wikipedia current events ───────────────────────────────────

    function drawWikiScreen() {
      fillCell(0, 1, C.D_GREEN, TT_COLS, 1);
      drawText('CURRENT EVENTS  wikipedia.org', 1, 1, C.WHITE);

      hRule(2, C.CYAN, '\u2550');

      const maxCols = TT_COLS - 2;
      let row = 3;

      for (const event of WIKI_EVENTS) {
        if (row >= TT_ROWS - 4) { break; }

        // Word-wrap event text
        const words = event.text.split(/\s+/);
        let line = '';
        const textLines = [];
        for (const word of words) {
          if (line.length + word.length + 1 > maxCols) {
            textLines.push(line);
            line = word;
          } else {
            line = line ? line + ' ' + word : word;
          }
        }
        if (line) { textLines.push(line); }

        for (const tl of textLines) {
          if (row >= TT_ROWS - 4) { break; }
          drawText(tl, 1, row, C.WHITE);
          row++;
        }

        // Show first article link as a compact reference
        if (event.links.length > 0 && row < TT_ROWS - 4) {
          const slug = decodeURIComponent(event.links[0].url.replace('https://en.wikipedia.org/wiki/', '').replace(/_/g, ' ')).slice(0, maxCols - 4);
          drawText('\u00bb ' + slug, 1, row, C.CYAN);
          row++;
        }

        row++; // gap between events
      }

      if (row < TT_ROWS - 3) {
        hRule(row, C.GREY, '\u2500');
        if (row + 1 < TT_ROWS - 2) {
          drawText('SOURCE: EN.WIKIPEDIA.ORG/WIKI/PORTAL:CURRENT_EVENTS', 0, row + 1, C.GREY);
        }
        if (row + 2 < TT_ROWS - 1) {
          const dateStr = new Date().toLocaleDateString('en-GB');
          drawText('FETCHED ' + dateStr, 0, row + 2, C.GREY);
        }
      }
    }

    // ── AST Tree-map (overlay on screen 1 bottom) ─────────────────────────────

    function drawAstTreemap() {
      if (!astNodes.length) { return; }
      // Draw a tiny block-per-file treemap in the very bottom row
      const rowY = (TT_ROWS - 1) * CH - CH;
      const cellW = Math.max(4, Math.floor(W / astNodes.length));
      const palette = [C.CYAN, C.GREEN, C.YELLOW, C.MAGENTA, C.RED, C.WHITE];
      astNodes.forEach((node, i) => {
        const x = i * cellW;
        const symCount = node.symbols.length;
        const barH = Math.min(CH, Math.max(4, Math.floor((symCount / 24) * CH)));
        ttCtx.fillStyle = palette[i % palette.length];
        ttCtx.fillRect(x, rowY + CH - barH, Math.max(2, cellW - 1), barH);
      });
    }

    // ── Pixel noise / CRT scanlines via WebGL ─────────────────────────────────

    function initCrtGl() {
      const gl = crtCanvas.getContext('webgl2') || crtCanvas.getContext('webgl');
      if (!gl) { return null; }

      const vsSource = \`
        attribute vec2 a_pos;
        varying vec2 v_uv;
        void main() {
          v_uv = (a_pos + 1.0) * 0.5;
          gl_Position = vec4(a_pos, 0.0, 1.0);
        }
      \`;

      const fsSource = \`
        precision mediump float;
        varying vec2 v_uv;
        uniform float u_time;
        uniform vec2 u_resolution;

        float rand(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec2 uv = v_uv;

          // Subtle barrel-distortion (CRT curvature)
          vec2 cc = uv - 0.5;
          float dist = dot(cc, cc) * 0.06;
          uv = uv + cc * dist;

          // Outside-screen vignette
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.85);
            return;
          }

          // Scanlines
          float scanline = sin(uv.y * u_resolution.y * 1.5) * 0.04;

          // Pixel noise
          float noise = rand(uv + vec2(u_time * 0.001, 0.0)) * 0.018;

          // Phosphor glow on green channel only
          float glow = 0.0;
          if (mod(floor(uv.y * u_resolution.y), 2.0) < 1.0) {
            glow = 0.03;
          }

          vec4 vignette = vec4(0.0, glow, 0.0, 0.72 + scanline + noise);
          gl_FragColor = vignette;
        }
      \`;

      function compileShader(type, src) {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { return null; }
        return sh;
      }

      const vs = compileShader(gl.VERTEX_SHADER, vsSource);
      const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) { return null; }

      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { return null; }

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

      const aPos = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(prog, 'u_time');
      const uRes  = gl.getUniformLocation(prog, 'u_resolution');

      return { gl, prog, uTime, uRes };
    }

    const crtGl = initCrtGl();

    function renderCrt(time) {
      if (!crtGl) { return; }
      const { gl, prog, uTime, uRes } = crtGl;
      gl.viewport(0, 0, crtCanvas.width, crtCanvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uRes, crtCanvas.width, crtCanvas.height);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // ── Micropixel animation for blocky effects ───────────────────────────────

    let microPixels = [];
    function initMicroPixels() {
      microPixels = [];
      for (let i = 0; i < 30; i++) {
        microPixels.push({
          x: Math.random() * TT_COLS | 0,
          y: (2 + Math.random() * (TT_ROWS - 4)) | 0,
          char: String.fromCharCode(0x2580 + (Math.random() * 8 | 0)),
          color: [C.CYAN, C.MAGENTA, C.GREEN, C.YELLOW][Math.random() * 4 | 0],
          ttl: 0.4 + Math.random() * 1.2,
          age: 0,
        });
      }
    }
    initMicroPixels();

    function updateAndDrawMicroPixels(delta) {
      const spawnRate = 0.15;
      if (Math.random() < spawnRate) {
        microPixels.push({
          x: Math.random() * TT_COLS | 0,
          y: (2 + Math.random() * (TT_ROWS - 5)) | 0,
          char: String.fromCharCode(0x2580 + (Math.random() * 8 | 0)),
          color: [C.CYAN, C.MAGENTA, C.GREEN, C.YELLOW][Math.random() * 4 | 0],
          ttl: 0.3 + Math.random() * 1.0,
          age: 0,
        });
      }
      microPixels = microPixels.filter((p) => {
        p.age += delta;
        if (p.age >= p.ttl) { return false; }
        const alpha = 1 - p.age / p.ttl;
        ttCtx.globalAlpha = alpha * 0.55;
        drawText(p.char, p.x, p.y, p.color);
        ttCtx.globalAlpha = 1.0;
        return true;
      });
    }

    // ── Screen navigation indicator ───────────────────────────────────────────

    function screenName(idx) {
      if (idx === 0) { return 'METRICS'; }
      if (idx === 1) { return 'WIKIPEDIA'; }
      return 'NPR RSS';
    }

    function drawNavHint() {
      const prev = screenName((currentScreen - 1 + SCREEN_COUNT) % SCREEN_COUNT);
      const next = screenName((currentScreen + 1) % SCREEN_COUNT);
      const hint = '\u2190 ' + prev + '   |   ' + next + ' \u2192';
      drawText(hint, TT_COLS - hint.length - 1, TT_ROWS - 2, C.GREY);
    }

    function drawNprScreen() {
      fillCell(0, 1, C.D_RED, TT_COLS, 1);
      drawText('LATEST NEWS  NPR.ORG RSS', 1, 1, C.WHITE);

      hRule(2, C.YELLOW, '\u2550');

      const maxCols = TT_COLS - 2;
      let row = 3;

      for (const item of NPR_FEED) {
        if (row >= TT_ROWS - 4) { break; }

        drawText(item.title.slice(0, maxCols), 1, row, C.YELLOW);
        row++;

        const summaryWords = item.summary.split(/\s+/);
        let summaryLine = '';
        for (const word of summaryWords) {
          if (row >= TT_ROWS - 4) { break; }
          if (summaryLine.length + word.length + 1 > maxCols) {
            drawText(summaryLine, 1, row, C.WHITE);
            row++;
            summaryLine = word;
          } else {
            summaryLine = summaryLine ? summaryLine + ' ' + word : word;
          }
          if (row >= TT_ROWS - 4) { break; }
        }
        if (summaryLine && row < TT_ROWS - 4) {
          drawText(summaryLine, 1, row, C.WHITE);
          row++;
        }

        if (item.published && row < TT_ROWS - 4) {
          drawText('PUB ' + item.published.slice(0, maxCols - 4), 1, row, C.CYAN);
          row++;
        }

        row++;
      }

      if (row < TT_ROWS - 2) {
        hRule(row, C.GREY, '\u2500');
        if (row + 1 < TT_ROWS - 1) {
          drawText('SOURCE: FEEDS.NPR.ORG/1004/RSS.XML', 0, row + 1, C.GREY);
        }
      }
    }

    // ── Main render loop ──────────────────────────────────────────────────────

    function render(timestamp) {
      const delta = Math.min(0.1, (timestamp - lastTime) / 1000);
      lastTime = timestamp;

      // Clear
      ttCtx.fillStyle = C.BLACK;
      ttCtx.fillRect(0, 0, W, H);

      // Header (every screen)
      if (currentScreen === 0) {
        drawHeader(100, 'FRIKFRAK METRICS');
        drawMetricsLabels();
        drawAstTreemap();
      } else if (currentScreen === 1) {
        drawHeader(200, 'CURRENT EVENTS');
        drawWikiScreen();
      } else {
        drawHeader(300, 'NPR LATEST NEWS');
        drawNprScreen();
      }

      // Micropixel animations
      updateAndDrawMicroPixels(delta);

      // Nav hint
      drawNavHint();

      // Footer ticker
      drawFooter(delta);

      // CRT WebGL overlay
      renderCrt(timestamp);

      requestAnimationFrame(render);
    }

    requestAnimationFrame((t) => { lastTime = t; requestAnimationFrame(render); });

  })();
  </script>
</body>
</html>`;
}

// ── Open Teletext Panel ───────────────────────────────────────────────────────

export async function openTeletextPanel(
  context: vscode.ExtensionContext,
  serverPort: number,
  hookEvents: Array<{ timestamp: string; hookType: string; payload: unknown }>,
  planFolder: string,
  wikiCachePath: string,
  nprCachePath: string,
): Promise<void> {
  const panel = vscode.window.createWebviewPanel(
    'frikfrakTeletext',
    'Test Frikfrak Teletext',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

  const isFeedPlaceholder = (text: string): boolean =>
    /(network unavailable|unable to parse|no current events parsed|timed out|no npr items parsed|feed unavailable)/i.test(
      text,
    );

  // Fetch Wikipedia events (network first, then cache fallback)
  let wikiEvents: WikiEvent[];
  try {
    const fetched = await fetchWikipediaCurrentEvents();
    if (fetched.length > 0 && !isFeedPlaceholder(fetched[0].text)) {
      wikiEvents = fetched;
      try {
        fs.writeFileSync(
          wikiCachePath,
          JSON.stringify({ ts: Date.now(), events: wikiEvents }),
          'utf8',
        );
      } catch {
        // ignore cache write errors
      }
    } else {
      throw new Error('wiki-fallback');
    }
  } catch {
    try {
      const cached = JSON.parse(fs.readFileSync(wikiCachePath, 'utf8')) as {
        ts: number;
        events?: WikiEvent[];
      };
      if (cached.events?.length) {
        wikiEvents = cached.events;
      } else {
        throw new Error('wiki-cache-empty');
      }
    } catch {
      wikiEvents = [{ text: 'Wikipedia feed unavailable and no cache exists.', links: [] }];
    }
  }

  // Fetch NPR feed (network first, then cache fallback)
  let nprFeed: NprFeedItem[];
  try {
    const fetched = await fetchNprNewsFeed();
    if (fetched.length > 0 && !isFeedPlaceholder(fetched[0].title)) {
      nprFeed = fetched;
      try {
        fs.writeFileSync(nprCachePath, JSON.stringify({ ts: Date.now(), items: nprFeed }), 'utf8');
      } catch {
        // ignore cache write errors
      }
    } else {
      throw new Error('npr-fallback');
    }
  } catch {
    try {
      const cached = JSON.parse(fs.readFileSync(nprCachePath, 'utf8')) as {
        ts: number;
        items?: NprFeedItem[];
      };
      if (cached.items?.length) {
        nprFeed = cached.items;
      } else {
        throw new Error('npr-cache-empty');
      }
    } catch {
      nprFeed = [
        {
          title: 'NPR feed unavailable and no cache exists.',
          summary: '',
          url: 'https://feeds.npr.org/1004/rss.xml',
          published: '',
        },
      ];
    }
  }

  const metrics = await collectMetrics(context, hookEvents);

  panel.webview.html = buildTeletextHtml(
    panel.webview,
    metrics,
    wikiEvents,
    nprFeed,
    planFolder,
    serverPort,
  );

  // Push live metrics updates every 5 seconds
  const metricsInterval = setInterval(async () => {
    if (!panel.visible) {
      return;
    }
    const updated = await collectMetrics(context, hookEvents);
    panel.webview.postMessage({ type: 'metricsUpdate', metrics: updated });
  }, 5000);

  // Forward hook events to the panel
  const hookHandler = (event: { timestamp: string; hookType: string; payload: unknown }) => {
    panel.webview.postMessage({ type: 'hookEvent', event });
  };

  panel.onDidDispose(() => {
    clearInterval(metricsInterval);
  });

  // Return the hook handler so the caller can wire it up
  (panel as unknown as { _frikfrakHookHandler: typeof hookHandler })._frikfrakHookHandler =
    hookHandler;
}

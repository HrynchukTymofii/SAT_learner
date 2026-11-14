// Renders every creative to PNG with Playwright's headless Chromium.
//   node render.mjs            everything
//   node render.mjs iphone-6.3 only kinds whose name contains the filter
import { execFile } from "node:child_process";
import { mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
import { pathToFileURL } from "node:url";

const here = dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1"));
const out = resolve(here, "..");
const pw = join(homedir(), "AppData/Local/ms-playwright");
const shell = readdirSync(pw).filter((d) => d.startsWith("chromium_headless_shell")).sort().pop();
const sub = readdirSync(join(pw, shell))[0];
const exe = join(pw, shell, sub, "chrome-headless-shell.exe");
if (!existsSync(exe)) throw new Error("chrome-headless-shell not found: " + exe);

// [kind, count, export W, export H, output folder, file name]
const JOBS = [
  ["iphone-6.9", 6, 1320, 2868, "app-store/iphone-6.9", (s) => `${s}.png`],
  ["iphone-6.3", 6, 1206, 2622, "app-store/iphone-6.3", (s) => `${s}.png`],
  ["ipad-13", 6, 2064, 2752, "app-store/ipad-13", (s) => `${s}.png`],
  ["header", 1, 3840, 1646, "app-store/header", () => `header.png`],
  ["listing", 2, 3840, 2560, "app-store/listing", (s) => `listing-${s}.png`],
  ["feature", 2, 1024, 500, "google-play/feature-graphic", (s) => `feature-${s}.png`],
  ["gp-phone", 6, 1080, 1920, "google-play/phone", (s) => `${s}.png`],
  ["gp-tablet-7", 6, 2560, 1440, "google-play/tablet-7", (s) => `${s}.png`],
  ["gp-tablet-10", 6, 3840, 2160, "google-play/tablet-10", (s) => `${s}.png`],
];
const filter = process.argv[2];
const page = pathToFileURL(join(here, "creatives.html")).href;

const tasks = [];
for (const [kind, n, w, h, dir, name] of JOBS) {
  if (filter && !kind.includes(filter)) continue;
  mkdirSync(join(out, dir), { recursive: true });
  for (let s = 1; s <= n; s++) tasks.push({ url: `${page}?v=${kind}&s=${s}`, w, h, file: join(out, dir, name(s)) });
}

const run = (t) => new Promise((ok, fail) =>
  execFile(exe, ["--headless", "--hide-scrollbars", "--force-device-scale-factor=1", `--window-size=${t.w},${t.h}`,
    "--allow-file-access-from-files", "--virtual-time-budget=15000", `--screenshot=${t.file}`, t.url],
    { timeout: 90000 }, (e) => (e ? fail(e) : (console.log("ok", t.file.slice(out.length + 1)), ok()))));

const queue = [...tasks];
await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await run(queue.shift()); }));
console.log(tasks.length, "images");

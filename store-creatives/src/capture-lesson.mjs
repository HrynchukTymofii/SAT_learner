// Screenshots a real lesson page the way the app shows it (same CSS the lesson screen injects into its webview).
//   node capture-lesson.mjs [chapterId] [lessonId]
// Writes src/lesson.png at 3x, 362pt wide (phone width minus the 20pt gutters).
import { spawn } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const here = dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1"));
const [chapterId = "e9b92cc5-6155-497e-9288-c3637156122c", lessonId = "b6ae1dc7-393b-4eed-b423-075629a076e4"] = process.argv.slice(2);
const url = `https://www.satlearner.com/expo-course/${chapterId}/lessons/${lessonId}`;

const pw = join(homedir(), "AppData/Local/ms-playwright");
const shell = readdirSync(pw).filter((d) => d.startsWith("chromium_headless_shell")).sort().pop();
const exe = join(pw, shell, readdirSync(join(pw, shell))[0], "chrome-headless-shell.exe");
const port = 9333;
const proc = spawn(exe, [`--remote-debugging-port=${port}`, "--headless", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// app/course/[chapterId]/lesson/[lessonId]/index.tsx webCss (light theme)
const css = `html, body { margin:0; background:#F4F1F9 !important; color:#0B0A0F; font-family: Manrope, system-ui, sans-serif; }
.expo-content { background:#F4F1F9 !important; color:#0B0A0F !important; padding: 4px 4px 8px; font-size: 16px; line-height: 1.6; }
.expo-content h1, .expo-content h2, .expo-content h3 { font-family: Outfit, system-ui, sans-serif; letter-spacing: -0.02em; }`;

try {
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(250);
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {}
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result); pending.delete(d.id); } };
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result.value;

  await send("Emulation.setDeviceMetricsOverride", { width: 362, height: 1600, deviceScaleFactor: 3, mobile: true });
  await send("Page.enable");
  await send("Page.navigate", { url });
  for (let i = 0; i < 60; i++) { await sleep(500); if (await evaluate(`!!document.querySelector('.expo-content') && document.readyState === 'complete'`)) break; }
  await evaluate(`(() => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&family=Outfit:wght@600&display=swap'; document.head.appendChild(l);
    const s = document.createElement('style'); s.textContent = ${JSON.stringify(css)}; document.head.appendChild(s); })()`);
  await sleep(2500);
  await evaluate(`document.fonts.ready.then(() => 1)`);
  const h = await evaluate(`Math.ceil(document.querySelector('.expo-content').getBoundingClientRect().bottom)`);
  console.log("content height", h, "pt");
  const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 362, height: Math.min(h, 1600), scale: 1 }, captureBeyondViewport: true });
  writeFileSync(join(here, "lesson.png"), Buffer.from(shot.data, "base64"));
  console.log("saved src/lesson.png");
  ws.close();
} finally {
  proc.kill();
}

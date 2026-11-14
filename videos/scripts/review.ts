// Contact sheet of moments in a video, to check layout without rendering it all.
//   npx tsx scripts/review.ts <composition> <sec,sec,…>   → out/review/<composition>.png
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const [id, secs] = process.argv.slice(2);

const main = async () => {
  const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
  const composition = await selectComposition({ serveUrl, id });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "review-"));
  const shots: string[] = [];
  for (const sec of secs.split(",").map(Number)) {
    const output = path.join(dir, `${shots.length}.png`);
    const frame = Math.min(composition.durationInFrames - 1, Math.round(sec * composition.fps));
    await renderStill({ serveUrl, composition, frame, scale: 0.5, output });
    shots.push(output);
  }
  const out = path.resolve("out/review", `${id}.png`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (shots.length === 1) fs.copyFileSync(shots[0], out);
  else execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...shots.flatMap((s) => ["-i", s]), "-filter_complex", `hstack=inputs=${shots.length}`, out]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(out, `(${(composition.durationInFrames / composition.fps).toFixed(1)} s)`);
};
main();

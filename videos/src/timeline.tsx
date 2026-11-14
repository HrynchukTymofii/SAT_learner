import React from "react";
import { Audio, CalculateMetadataFunction, Sequence, staticFile, useVideoConfig } from "remotion";

// Every video is narrated line by line (src/videos/<video>/script.json, voiced by scripts/voice.py).
// The timeline is just those lines one after another, each followed by its gap, so scenes key their
// animation to `at[id]` / `len[id]` and the video re-times itself whenever the voice changes.

export type ScriptLine = { id: string; text?: string; gap?: number; silence?: number };
export type Script = { voice: string; rate?: string; tight?: boolean; lines: ScriptLine[] };
export type Word = { w: string; t: number; d: number };
export type Timing = Record<string, { src: string; duration: number; words: Word[]; env?: number[] }>;
export type Timeline = { at: Record<string, number>; len: Record<string, number>; total: number; timing: Timing };

const LEAD_IN = 0.5;

export const makeTimeline = (script: Script, timing: Timing): Timeline => {
  const at: Record<string, number> = {};
  const len: Record<string, number> = {};
  let t = LEAD_IN;
  for (const line of script.lines) {
    // Lines with no audio yet get a reading-speed estimate, so a video can be previewed before it is voiced
    // `tight` scripts cut each line's trailing silence: the next line starts right after the last word
    const words = timing[line.id]?.words;
    const last = script.tight && words?.length ? words[words.length - 1] : undefined;
    len[line.id] = line.silence ?? (last ? last.t + last.d + 0.06 : undefined) ?? timing[line.id]?.duration ?? Math.max(1.2, (line.text ?? "").length / 15);
    at[line.id] = t;
    t += len[line.id] + (line.gap ?? 0);
  }
  return { at, len, total: t, timing };
};

export type VideoProps = { tl?: Timeline };

export const timelineMetadata =
  (video: string, script: Script): CalculateMetadataFunction<VideoProps> =>
  async ({ props }) => {
    const res = await fetch(staticFile(`voice/${video}/timing.json`));
    const timing = (res.ok ? await res.json() : {}) as Timing;
    const tl = makeTimeline(script, timing);
    return { durationInFrames: Math.ceil(tl.total * 30), props: { ...props, tl } };
  };

export const Voice: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {Object.entries(tl.timing).map(([id, a]) => (
        <Sequence key={id} from={Math.round(tl.at[id] * fps)} layout="none">
          <Audio src={staticFile(a.src)} />
        </Sequence>
      ))}
    </>
  );
};

// The second at which line `id` says `word` (its nth occurrence), so a highlight lands on the spoken word.
// Without word timings (a recorded voice) it falls back to `frac` of the line.
export const cue = (tl: Timeline, id: string, word: string, nth = 0, frac = 0.5) => {
  const target = norm(word);
  // Whisper writes numbers as digits and glues units on ("$20", "15x"), Edge TTS spells them out
  const hits = (tl.timing[id]?.words ?? []).filter((w) => {
    const n = norm(w.w);
    return n === target || (/^\d+$/.test(target) && new RegExp(`^${target}[a-z]$`).test(n));
  });
  return tl.at[id] + (hits[nth] ? hits[nth].t : tl.len[id] * frac);
};

const NUMBERS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
  twelve: "12", fifteen: "15", eighteen: "18", twenty: "20", "twenty-four": "24", sixty: "60",
};
const norm = (w: string) => {
  const s = w.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return NUMBERS[s] ?? s;
};

// Voice loudness at second s, 0..1, whichever line is playing (0 in the gaps)
export const loudness = (tl: Timeline, s: number) => {
  for (const [id, a] of Object.entries(tl.timing)) {
    const i = Math.floor((s - tl.at[id]) * 30);
    if (a.env && i >= 0 && i < a.env.length) return a.env[i];
  }
  return 0;
};

// How far the voice has got through line `id` at second s, 0..1, by its word timings
export const spoken = (tl: Timeline, id: string, s: number) => {
  const local = s - tl.at[id];
  const words = tl.timing[id]?.words ?? [];
  if (!words.length) return Math.max(0, Math.min(1, local / tl.len[id]));
  const done = words.filter((w) => w.t <= local).length;
  return done / words.length;
};

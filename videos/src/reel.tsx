import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { C, graphPaper, heading, lerp, pop, ramp } from "./brand";
import { Timeline } from "./timeline";

// Shared kit for the fast 9:16 promo / explainer reels: kinetic captions with highlight boxes, graph-paper
// background with a tilted 3D grid floor (light or dark), scene transitions, chips, odometers, sound effects.

export const W = 1080;
export const BG = "#F7F2FF";
export const outC = Easing.out(Easing.cubic);
export const inC = Easing.in(Easing.cubic);
export const swing = Easing.out(Easing.back(1.25));

// Camera punch: a quick zoom kick that decays, fired at each time in `at`
export const kick = (s: number, at: number[], amount = 0.06, dur = 0.3) =>
  at.reduce((a, t) => (s >= t && s < t + dur ? a + amount * Math.pow(1 - (s - t) / dur, 2) : a), 0);

// ---------- captions ----------
// One chunk on screen at a time; *starred* words get the highlight box; "~" is a spoken word shown as nothing.
// Word counts per line must match the voice's word timings.
export const wordTimes = (tl: Timeline, id: string, n: number) => {
  const words = tl.timing[id]?.words ?? [];
  return Array.from({ length: n }, (_, i) => tl.at[id] + (words[i] ? words[i].t : (tl.len[id] * i) / n));
};

type Tok = { w: string; hi: boolean; t: number };

export const Captions: React.FC<{ s: number; tl: Timeline; dark: number; caps: Record<string, string[]>; size?: number }> = ({ s, tl, dark, caps, size = 84 }) => {
  // Every chunk with its words' times, in order
  const chunks: { toks: Tok[]; start: number }[] = [];
  for (const id of Object.keys(caps)) {
    const parsed = caps[id].map((c) => {
      let hi = false;
      return c.split(" ").map((raw) => {
        const open = raw.startsWith("*");
        if (open) hi = true;
        const tok = { w: raw.replace(/\*/g, ""), hi };
        if (raw.endsWith("*") || raw.replace(/[.,:?]$/, "").endsWith("*")) hi = false;
        return tok;
      });
    });
    const times = wordTimes(tl, id, parsed.flat().length);
    let k = 0;
    for (const c of parsed) {
      const toks = c.map((t) => ({ ...t, t: times[k++] }));
      chunks.push({ toks, start: toks[0].t - 0.06 });
    }
  }
  let ci = -1;
  for (let i = 0; i < chunks.length; i++) if (s >= chunks[i].start) ci = i;
  if (ci < 0) return null;
  const { toks } = chunks[ci];
  const isDark = dark > 0.5;

  // group consecutive highlighted words into one box
  const groups: Tok[][] = [];
  toks.forEach((t, i) => {
    if (i > 0 && t.hi && toks[i - 1].hi) groups[groups.length - 1].push(t);
    else groups.push([t]);
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        width: 960,
        top: 200,
        height: 240,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "center",
        columnGap: 22,
        rowGap: 6,
        fontFamily: heading,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: -2,
        color: isDark ? C.white : C.ink,
        textAlign: "center",
      }}
    >
      {groups.map((g, gi) => {
        const words = g.map((t, i) => {
          if (t.w === "~") return null;
          const k = pop(s, t.t - 0.05, 0.32);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: Math.min(1, k * 2),
                transform: `translateY(${(1 - k) * 34}px) scale(${0.7 + 0.3 * k})`,
                marginRight: i < g.length - 1 && g[i + 1].w !== "~" ? 22 : 0,
              }}
            >
              {t.w}
            </span>
          );
        });
        if (!g[0].hi) return <React.Fragment key={gi}>{words}</React.Fragment>;
        // the box grows with the words as they are said (weighted by their length)
        const shown = g.filter((t) => t.w !== "~");
        const total = shown.reduce((n, t) => n + t.w.length + 1, 0);
        const said = shown.reduce((n, t) => n + (t.w.length + 1) * ramp(s, t.t - 0.08, 0.22, swing), 0);
        const box = total ? said / total : 0;
        return (
          <span key={gi} style={{ position: "relative", display: "inline-block", padding: "0 18px", transform: "rotate(-2deg)" }}>
            <span
              style={{
                position: "absolute",
                inset: "4px 0 0 0",
                borderRadius: 18,
                background: isDark ? C.butter : C.ink,
                transform: `scaleX(${box})`,
                transformOrigin: "0 50%",
              }}
            />
            <span style={{ position: "relative", color: box > 0.3 ? (isDark ? C.ink : C.lav) : undefined }}>{words}</span>
          </span>
        );
      })}
    </div>
  );
};

// ---------- background ----------
export const Background: React.FC<{ s: number; dark: number }> = ({ s, dark }) => (
  <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
    <AbsoluteFill style={graphPaper("rgba(124,77,219,.07)", 54)} />
    <AbsoluteFill style={{ background: C.ink, opacity: dark }} />
    <AbsoluteFill style={{ ...graphPaper("rgba(228,205,255,.07)", 54), opacity: dark }} />
    {/* spotlight rays in the dark scenes */}
    <div
      style={{
        position: "absolute",
        left: -460,
        top: -900,
        width: 2000,
        height: 2000,
        opacity: dark * 0.55,
        background: `repeating-conic-gradient(from ${s * 6}deg at 50% 50%, rgba(201,170,251,.22) 0deg 6deg, transparent 6deg 18deg)`,
        maskImage: "radial-gradient(circle at 50% 50%, black 0%, transparent 62%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 0%, transparent 62%)",
      }}
    />
    {/* glow behind the stage */}
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 650,
        width: 900,
        height: 900,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${dark > 0.5 ? "rgba(124,77,219,.45)" : "rgba(201,170,251,.55)"} 0%, transparent 65%)`,
      }}
    />
    {/* tilted 3D grid floor, drifting toward the viewer */}
    <div style={{ position: "absolute", left: 0, top: 1040, width: W, height: 900, perspective: 700, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: -900,
          top: 0,
          width: 2880,
          height: 1600,
          transform: "rotateX(64deg)",
          transformOrigin: "50% 0%",
          backgroundImage: `linear-gradient(${dark > 0.5 ? "rgba(201,170,251,.35)" : "rgba(124,77,219,.28)"} 3px, transparent 3px), linear-gradient(90deg, ${dark > 0.5 ? "rgba(201,170,251,.35)" : "rgba(124,77,219,.28)"} 3px, transparent 3px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: `0 ${(s * 70) % 120}px`,
          maskImage: "linear-gradient(to bottom, transparent 0%, black 35%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 35%)",
        }}
      />
    </div>
  </AbsoluteFill>
);

// Scene wrapper: zooms in on enter, blurs + pushes past the camera on exit, slow camera drift in between
// `fast` makes it a snappy cut (for the rapid explainers); `dir` flips which way it twists in.
export const Scene: React.FC<{ s: number; from: number; to: number; children: React.ReactNode; last?: boolean; fast?: boolean; dir?: 1 | -1 }> = ({
  s,
  from,
  to,
  children,
  last,
  fast,
  dir = 1,
}) => {
  const inDur = fast ? 0.2 : 0.38;
  const outDur = fast ? 0.14 : 0.3;
  if (s < from - 0.02 || (!last && s > to + outDur + 0.05)) return null;
  const inK = ramp(s, from, inDur, outC);
  const outK = last ? 0 : ramp(s, to, outDur, inC);
  const drift = interpolate(s, [from, to], [1, 1.035], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(1, inK * 1.6) * (1 - outK),
        transform: `scale(${lerp(0.86, 1, inK) * lerp(1, 1.18, outK) * drift}) rotate(${lerp(-3 * dir, 0, inK)}deg)`,
        filter: outK > 0.01 ? `blur(${outK * 14}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---------- shared bits ----------
export const card: React.CSSProperties = { background: C.white, border: `4px solid ${C.ink}`, borderRadius: 34, boxShadow: `0 10px 0 ${C.ink}` };

export const Chip: React.FC<{ k: number; x: number; y: number; bg: string; rot?: number; children: React.ReactNode; size?: number; color?: string }> = ({
  k,
  x,
  y,
  bg,
  rot = 0,
  children,
  size = 40,
  color = C.ink,
}) =>
  k <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${k}) rotate(${rot}deg)`,
        opacity: Math.min(1, k * 2),
        background: bg,
        border: `4px solid ${C.ink}`,
        borderRadius: 26,
        boxShadow: `0 8px 0 ${C.ink}`,
        padding: "14px 26px",
        fontFamily: heading,
        fontWeight: 800,
        fontSize: size,
        color,
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {children}
    </div>
  );

export const Tag: React.FC<{ bg: string; children: React.ReactNode; color?: string }> = ({ bg, children, color = C.ink }) => (
  <div style={{ alignSelf: "flex-start", background: bg, color, border: `3px solid ${C.ink}`, borderRadius: 999, padding: "6px 16px", fontFamily: heading, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>
    {children}
  </div>
);

// Odometer: each digit rolls; higher digits turn over only when the lower ones pass 9
export const Odometer: React.FC<{ n: number; digits: number; h: number; style?: React.CSSProperties }> = ({ n, digits, h, style }) => {
  const cols = [];
  for (let i = digits - 1; i >= 0; i--) {
    const p = Math.pow(10, i);
    const lowerFrac = (n % p) / p;
    const pos = i === 0 ? n % 10 : (Math.floor(n / p) % 10) + Math.max(0, (lowerFrac - 0.9) / 0.1);
    const hidden = i > 0 && n < p - 0.0001 && Math.round(n) < p;
    cols.push(
      <div key={i} style={{ height: h, overflow: "hidden", width: hidden ? 0 : h * 0.6, transition: "none" }}>
        <div style={{ transform: `translateY(${-pos * h}px)` }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, j) => (
            <div key={j} style={{ height: h, lineHeight: `${h}px`, textAlign: "center" }}>
              {d}
            </div>
          ))}
        </div>
      </div>,
    );
  }
  return <div style={{ display: "flex", fontVariantNumeric: "tabular-nums", ...style }}>{cols}</div>;
};

// ---------- sound effects ----------
export type Sfx = { t: number; src: string; v?: number };
export const Sfxs: React.FC<{ list: Sfx[] }> = ({ list }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {list.map((x, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(x.t * fps))} layout="none">
          <Audio src={staticFile(`sfx/${x.src}.wav`)} volume={x.v ?? 0.5} />
        </Sequence>
      ))}
    </>
  );
};


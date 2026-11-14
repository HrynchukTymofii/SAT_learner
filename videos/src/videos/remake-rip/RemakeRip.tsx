import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerif } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { lerp, pop, ramp } from "../../brand";
import WORDS from "./words.json";

// Private study: a scene-for-scene remake of a 45 s SaaS promo reel (reference/rip.mp4, not in git),
// to test how close Remotion gets. Laid out on the reel's own 720 × 1280 grid and scaled 1.5× to 1080 × 1920.
// Timing comes from Whisper word timings of the original voice (words.json); the original audio plays under it.
// Photos and real logos are replaced by drawn placeholders.

const sans = loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
const serif = loadSerif("normal", { weights: ["500", "600"], subsets: ["latin"] }).fontFamily;
const mono = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;

const K = {
  paper: "#F2F0EB",
  night: "#0D0C0B",
  ink: "#141414",
  gray: "#86827C",
  line: "#E6E2DA",
  amber: "#B2640C",
  amber2: "#C98424",
  gold: "#E2B23C",
  goldDeep: "#C48F1E",
  cream: "#F7EEDF",
  red: "#E5352B",
  green: "#2E9E57",
};
const AMBER_GRAD = `linear-gradient(180deg, ${K.amber2}, ${K.amber})`;
const W = WORDS as { w: string; t: number; e: number }[];
const wt = (i: number) => W[i].t;
const out = Easing.out(Easing.cubic);
const back = Easing.out(Easing.back(1.6));
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// scene starts (s), read off the reference frame by frame
const T = { s1: 0, s2: 2.45, s3: 4.0, s4: 5.95, s5: 7.6, s6: 10.3, s7: 12.5, s8: 15.4, s9: 18.0, s10: 20.5, s11: 22.4, s12: 26.5, s13: 29.4, s14: 32.3, s15: 33.8, s16: 36.5, s17: 39.1, s18: 42.4, end: 44.82 };
const DARK: [number, number][] = [
  [T.s3, T.s5],
  [T.s8, T.s11],
  [T.s14, T.s17],
];

// ---------------- captions ----------------
// Chunks of the voice; a token eats one Whisper word unless marked ^n; *x* is amber; "/" breaks the line.
const CHUNKS = [
  "What would happen if you / used Claude to post *100*",
  "*trial* *reels* promoting / your software?",
  "Well, there's a new / 🔌^0 Claude plugin",
  "that can make videos like / these for your software,",
  "But the crazy part is",
  "it 📈^0 *gets* *better* / every time you post.",
  "I posted 30 times over / the last 2 weeks",
  "~ got *3.1^2* *million* views, / 14K followers,",
  "~ 📱^0 *1,341^2* new app users.",
  "But what if you posted / 100 times about",
  "your own app?",
  "Well, even if your conversion / rates are 📉^0 lower,",
  "~ ~ almost guarantee posting / about your startup is",
  "the *best* *possible* use of / your ⏳^0 time as a founder.",
  "Let's say you / posted 100 times",
  "this month and / got an average of",
  "*5,000^2* 👀^0 views per video.",
  "That's *half* *a* *million* views.",
  "5 Michigan football / 🏟️^0 stadiums.",
  "And if you can't get",
  "a *couple* *conversions* from / half a million views,",
  "you probably need to / work on",
  "your landing page / and your app idea.",
  "If you want to try the / system I used to make",
  "and post these videos / all day long,",
  "~ 💬^0 comment *RIP* and / I'll send you access.",
];
type Tok = { text: string; t: number; hi: boolean; br: boolean };
const PARSED: { toks: Tok[]; start: number }[] = (() => {
  let i = 0;
  return CHUNKS.map((c) => {
    const toks: Tok[] = [];
    let br = false;
    for (const raw of c.split(" ")) {
      if (raw === "/") {
        br = true;
        continue;
      }
      const hi = raw.startsWith("*");
      const m = raw.replace(/\*/g, "").match(/^(.*?)(\^(\d+))?$/)!;
      const n = m[3] !== undefined ? Number(m[3]) : 1;
      toks.push({ text: m[1], t: wt(Math.min(i, W.length - 1)) - 0.02, hi, br });
      br = false;
      i += n;
    }
    return { toks, start: toks[0].t };
  });
})();

const Captions: React.FC<{ s: number; dark: number }> = ({ s, dark }) => {
  let ci = -1;
  PARSED.forEach((c, i) => {
    if (s >= c.start) ci = i;
  });
  if (ci < 0) return null;
  const { toks } = PARSED[ci];
  const shown = toks.filter((t) => s >= t.t && t.text !== "~");
  const lastIdx = shown.length - 1;
  const lines: Tok[][] = [[]];
  shown.forEach((t) => {
    if (t.br && lines[lines.length - 1].length) lines.push([]);
    lines[lines.length - 1].push(t);
  });
  const isDark = dark > 0.5;
  let k = -1;
  return (
    <div style={{ position: "absolute", left: 0, width: 720, top: 168, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ fontFamily: sans, fontSize: 38, lineHeight: 1.05, letterSpacing: -1, textAlign: "left" }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ whiteSpace: "nowrap" }}>
            {ln.map((t) => {
              k++;
              const newest = k === lastIdx;
              const p = ramp(s, t.t, 0.16, out);
              const color = t.hi ? K.amber2 : newest ? (isDark ? "#FFFFFF" : K.ink) : isDark ? "#8E8A84" : K.gray;
              return (
                <span
                  key={k}
                  style={{
                    display: "inline-block",
                    marginRight: 10,
                    fontWeight: newest || t.hi ? 700 : 600,
                    color,
                    transform: `scale(${lerp(1.18, 1, p)})`,
                    transformOrigin: "50% 80%",
                    textShadow: t.hi ? `0 0 14px rgba(201,132,36,${isDark ? 0.75 : 0.45})` : undefined,
                  }}
                >
                  {t.text}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------- shared pieces ----------------
const shadow = "0 18px 40px rgba(40,30,15,.10), 0 2px 6px rgba(40,30,15,.07)";
const Card: React.FC<{ x: number; y: number; w: number; h?: number; dark?: boolean; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, dark, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: dark ? "#161513" : "#FFFFFF",
      border: dark ? "1px solid #2A2724" : "1px solid #ECE8E1",
      borderRadius: 14,
      boxShadow: dark ? "0 20px 50px rgba(0,0,0,.5)" : shadow,
      overflow: "hidden",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

const Glyph: React.FC<{ kind: string; size: number; color?: string }> = ({ kind, size, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    {kind === "eye" && (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx={12} cy={12} r={3} />
      </>
    )}
    {kind === "people" && (
      <>
        <circle cx={9} cy={8} r={3} />
        <path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 5a3 3 0 0 1 0 6M18 15c2 .5 3 2 3 5" />
      </>
    )}
    {kind === "check" && <path d="M5 12l5 5 9-10" />}
    {kind === "cal" && (
      <>
        <rect x={3} y={5} width={18} height={16} rx={3} />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    )}
    {kind === "play" && <path d="M8 5l12 7-12 7z" fill={color} />}
    {kind === "key" && (
      <>
        <circle cx={8} cy={12} r={4} />
        <path d="M12 12h9M18 12v3M21 12v2" />
      </>
    )}
  </svg>
);

const AppIcon: React.FC<{ kind: string; size?: number }> = ({ kind, size = 30 }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, background: AMBER_GRAD, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)" }}>
    <Glyph kind={kind} size={size * 0.58} />
  </div>
);

const Live: React.FC = () => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: sans, fontWeight: 600, fontSize: 13, color: K.amber, background: "#FBF1E2", border: "1px solid #EFD3A8", borderRadius: 999, padding: "3px 9px" }}>
    <span style={{ width: 6, height: 6, borderRadius: 3, background: K.amber }} />
    Live
  </div>
);

const Header: React.FC<{ icon: string; title: string; sub?: string; dark?: boolean; right?: React.ReactNode }> = ({ icon, title, sub, dark, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 18px 0" }}>
    <AppIcon kind={icon} size={34} />
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 19, color: dark ? "#fff" : K.ink, lineHeight: 1.1 }}>{title}</div>
      {sub && <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 14, color: K.gray }}>{sub}</div>}
    </div>
    {right ?? <Live />}
  </div>
);

// Selection box with corner handles, used around highlighted numbers
const Sel: React.FC<{ k: number; children: React.ReactNode; style?: React.CSSProperties; color?: string }> = ({ k, children, style, color = K.amber2 }) => (
  <div style={{ position: "relative", display: "inline-block", ...style }}>
    {k > 0 && (
      <div style={{ position: "absolute", inset: -6, border: `2px solid ${color}`, background: `rgba(201,132,36,${0.14 * k})`, opacity: k, transform: `scale(${lerp(1.15, 1, k)})` }}>
        {[
          [-4, -4],
          [-4, "auto"],
          ["auto", -4],
          ["auto", "auto"],
        ].map(([l, t], i) => (
          <span key={i} style={{ position: "absolute", width: 7, height: 7, background: color, left: l === "auto" ? undefined : l, right: l === "auto" ? -4 : undefined, top: t === "auto" ? undefined : t, bottom: t === "auto" ? -4 : undefined }} />
        ))}
      </div>
    )}
    <div style={{ position: "relative" }}>{children}</div>
  </div>
);

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const seven = (n: number) => {
  const d = String(Math.round(n)).padStart(7, "0");
  return `${d[0]},${d.slice(1, 4)},${d.slice(4)}`;
};

const Browser: React.FC<{ x: number; y: number; w: number; h: number; url: string; dark?: boolean; children?: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, url, dark, children, style }) => (
  <Card x={x} y={y} w={w} h={h} dark={dark} style={{ borderRadius: 12, ...style }}>
    <div style={{ height: 32, background: dark ? "#1E1C1A" : "#2A2826", display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
      {["#FF5F57", "#555", "#555"].map((c, i) => (
        <span key={i} style={{ width: 9, height: 9, borderRadius: 5, background: c }} />
      ))}
      <div style={{ marginLeft: 18, flex: 0.62, height: 20, borderRadius: 10, background: "#121110", color: "#BDB8B0", fontFamily: mono, fontSize: 11, display: "flex", alignItems: "center", padding: "0 10px" }}>🔒 {url}</div>
    </div>
    <div style={{ position: "relative", height: h - 32 }}>{children}</div>
  </Card>
);

const RLogo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.24, background: "#0E0E0E", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>
    <span style={{ fontFamily: sans, fontWeight: 800, fontSize: size * 0.62, color: "#fff", letterSpacing: -2, fontStyle: "italic" }}>R</span>
  </div>
);

// generic orange starburst standing in for the AI brand's mark
const Burst: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return <line key={i} x1={12} y1={12} x2={12 + Math.cos(a) * 10} y2={12 + Math.sin(a) * 10} stroke="#D97757" strokeWidth={2.6} strokeLinecap="round" />;
    })}
  </svg>
);

const ReelCard: React.FC<{ w: number; h: number; gold?: boolean; dark?: boolean; title?: string; views?: string; draft?: boolean; style?: React.CSSProperties }> = ({ w, h, gold, dark, title, views, draft, style }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: w * 0.09,
      background: gold ? `linear-gradient(170deg, #EBC04E, ${K.goldDeep})` : dark ? "linear-gradient(170deg,#2B2622,#151311)" : draft ? "#FFFFFF" : `linear-gradient(170deg, #C98A3E, #8E4F12)`,
      border: draft ? "1px solid #E4E0D8" : "none",
      boxShadow: "0 8px 20px rgba(60,40,10,.18)",
      padding: w * 0.08,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: w * 0.06,
      fontFamily: sans,
      flex: "none",
      ...style,
    }}
  >
    <div style={{ alignSelf: "flex-start", fontSize: w * 0.085, fontWeight: 600, color: draft ? K.gray : "#fff", background: draft ? "#F1EEE8" : "rgba(255,255,255,.22)", borderRadius: 99, padding: `${w * 0.015}px ${w * 0.06}px` }}>{draft ? "• Draft" : "• Trial"}</div>
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: w * 0.26, height: w * 0.26, borderRadius: "50%", background: draft ? "#F1EEE8" : "rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Glyph kind="play" size={w * 0.12} color={draft ? "#BEB8AE" : "#fff"} />
      </div>
    </div>
    {title && <div style={{ fontSize: w * 0.1, fontWeight: 700, color: draft ? K.ink : "#fff", lineHeight: 1.15 }}>{title}</div>}
    {views && <div style={{ fontSize: w * 0.08, fontWeight: 600, color: draft ? K.gray : "rgba(255,255,255,.85)" }}>▸ {views}</div>}
  </div>
);

// Scene wrapper: quick blur-zoom in and out, like the reference's cuts
const Sc: React.FC<{ s: number; a: number; b: number; children: React.ReactNode; last?: boolean }> = ({ s, a, b, children, last }) => {
  if (s < a - 0.05 || (!last && s > b + 0.25)) return null;
  const i = ramp(s, a - 0.05, 0.28, out);
  const o = last ? 0 : ramp(s, b - 0.05, 0.22, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{ opacity: Math.min(i * 1.4, 1) * (1 - o), transform: `scale(${lerp(0.94, 1, i) * lerp(1, 1.06, o)})`, filter: i < 0.99 || o > 0.01 ? `blur(${(1 - i) * 10 + o * 10}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

// ---------------- backgrounds ----------------
const Backdrop: React.FC<{ s: number; dark: number }> = ({ s, dark }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: K.paper, backgroundImage: "linear-gradient(rgba(0,0,0,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.055) 1px, transparent 1px)", backgroundSize: "61px 61px", backgroundPosition: "-8px 10px" }} />
    <AbsoluteFill style={{ opacity: dark, background: K.night, backgroundImage: "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)", backgroundSize: "61px 61px" }}>
      {/* the stage light: a soft amber beam from the top */}
      <div style={{ position: "absolute", left: 160, top: 260, width: 400, height: 1020, background: "linear-gradient(180deg, rgba(190,130,50,.22), rgba(190,130,50,.05) 60%, transparent)", clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)", filter: "blur(6px)" }} />
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 211) % 700, top: 300 + ((i * 337 + s * 8) % 950), width: 2.5, height: 2.5, borderRadius: 2, background: "rgba(255,255,255,.5)" }} />
      ))}
    </AbsoluteFill>
  </AbsoluteFill>
);

// ---------------- scenes ----------------
// 1 · floor of drafts, AI pill, 100 stamp, cards turning amber
const S1: React.FC<{ s: number }> = ({ s }) => {
  const ring = ramp(s, wt(6) - 0.1, 0.6, out) * (1 - ramp(s, wt(9), 0.3));
  const wave = Math.max(0, s - wt(9) + 0.05) * 900;
  const stamp = pop(s, wt(9) - 0.05, 0.35);
  const cols = 19;
  const rows = 15;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -340, top: -60, width: 1400, height: 1150, perspective: 1100, maskImage: "radial-gradient(ellipse 42% 40% at 50% 55%, black 50%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 42% 40% at 50% 55%, black 50%, transparent 100%)" }}>
        <div style={{ position: "absolute", inset: 0, transform: `rotateX(46deg) translateY(${-20 + s * 6}px)`, transformOrigin: "50% 55%" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 62px)`, gap: 9, justifyContent: "center", paddingTop: 40 }}>
            {Array.from({ length: cols * rows }, (_, i) => {
              const cx = (i % cols) - cols / 2 + 0.5;
              const cy = Math.floor(i / cols) - rows / 2 + 0.5;
              const d = Math.hypot(cx * 71, cy * 92);
              const lit = d < wave;
              const fade = 1 - clamp01((d - 300) / 700);
              return (
                <div key={i} style={{ height: 83, borderRadius: 7, background: lit ? `linear-gradient(170deg, #E3B060, ${K.amber})` : "#FFFFFF", border: lit ? "none" : "1px solid #E7E2DA", opacity: 0.25 + 0.75 * fade, transform: lit ? `scale(${1 + 0.06 * Math.max(0, 1 - (wave - d) / 200)})` : undefined }} />
              );
            })}
          </div>
        </div>
      </div>
      {ring > 0 && <div style={{ position: "absolute", left: 360 - 170 * ring, top: 576 - 85 * ring, width: 340 * ring, height: 170 * ring, borderRadius: "50%", border: `4px solid ${K.amber2}`, opacity: ring, boxShadow: `0 0 30px rgba(201,132,36,.55), inset 0 0 30px rgba(201,132,36,.35)` }} />}
      <div style={{ position: "absolute", left: 360, top: 576, transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 14, padding: "14px 26px", display: "flex", alignItems: "center", gap: 10, boxShadow: shadow }}>
        <Burst size={30} />
        <span style={{ fontFamily: serif, fontWeight: 500, fontSize: 36, color: K.ink, letterSpacing: -0.5 }}>Claude</span>
      </div>
      {stamp > 0 && (
        <div style={{ position: "absolute", left: 360, top: 400, transform: `translate(-50%,-50%) scale(${lerp(1.6, 1, Math.min(1, stamp))})`, opacity: Math.min(1, stamp * 2) }}>
          <Sel k={1} style={{ padding: "0 14px" }}>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 160, color: K.amber, lineHeight: 1, letterSpacing: -6 }}>100</div>
          </Sel>
        </div>
      )}
      {[
        { x: 255, t: "Get paid before Friday", v: "4.8K views" },
        { x: 360, t: "Late payers hate this", v: "5.2K views" },
        { x: 465, t: "Invoice in ten seconds", v: "8.9K views" },
      ].map((c, i) => {
        const rise = ramp(s, 0.1 + i * 0.08, 0.6, back);
        const f = ramp(s, wt(8) - 0.05 + i * 0.07, 0.4, back);
        const showGold = f > 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: c.x * 1.22 - 80 - 57, top: 750 + (1 - rise) * 400, transform: `perspective(600px) rotateY(${(f > 0.5 ? 1 - f : f) * 180}deg) rotate(${(i - 1) * (showGold ? 6 : 0)}deg)` }}>
            <ReelCard w={115} h={190} draft={!showGold} title={c.t} views={showGold ? c.v : "Draft"} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 2 · trial-reels setting, phone, app icon, a row of reels
const S2: React.FC<{ s: number }> = ({ s }) => {
  const a = pop(s, T.s2, 0.4);
  const tog = ramp(s, wt(11), 0.25);
  const fill = (i: number) => pop(s, wt(12) + i * 0.08, 0.35);
  const pill = pop(s, wt(14), 0.35);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 80, top: 345, width: 360, height: 175, borderRadius: 14, background: "linear-gradient(120deg,#FF3E7A,#FF6A3D)", transform: `scale(${a}) rotate(-2deg)`, padding: 22, boxSizing: "border-box", color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 21, lineHeight: 1.2, boxShadow: shadow }}>
        Trial reels: Try content with non-followers first to see what performs best
        <div style={{ marginTop: 14, width: 120, height: 26, borderRadius: 13, background: "rgba(255,255,255,.95)" }} />
      </div>
      <div style={{ position: "absolute", left: 432, top: 290, width: 165, height: 330, borderRadius: 26, background: "#E9E6E1", border: "5px solid #CFCAC2", transform: `scale(${a})`, boxShadow: shadow, overflow: "hidden" }}>
        <div style={{ margin: 10, height: 120, borderRadius: 14, background: "linear-gradient(160deg,#F45C9B,#7E2D7A)" }} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ margin: "8px 12px", height: 14, borderRadius: 7, background: "#D6D1C9", display: "flex", justifyContent: "flex-end" }}>
            {i === 0 && (
              <div style={{ width: 30, height: 16, marginTop: -1, borderRadius: 8, background: tog > 0.5 ? "#3E8BFF" : "#B9B4AC", position: "relative" }}>
                <div style={{ position: "absolute", top: 2, left: lerp(2, 16, tog), width: 12, height: 12, borderRadius: 6, background: "#fff" }} />
              </div>
            )}
          </div>
        ))}
        <div style={{ position: "absolute", bottom: 14, right: 12, width: 60, height: 22, borderRadius: 6, background: "#3E8BFF" }} />
      </div>
      <div style={{ position: "absolute", left: 200, top: 665, transform: `scale(${pop(s, T.s2 + 0.15, 0.4)})`, display: "flex", alignItems: "center", gap: 14 }}>
        <AppIcon kind="check" size={92} />
        <div>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 18, color: K.ink }}>Tallybird</div>
          {pill > 0 && <div style={{ marginTop: 6, transform: `scale(${pill})`, transformOrigin: "0 50%", fontFamily: sans, fontWeight: 700, fontSize: 28, color: K.amber, background: "#FBEBD2", border: `2px solid ${K.amber2}`, borderRadius: 99, padding: "2px 16px" }}>software</div>}
        </div>
      </div>
      <div style={{ position: "absolute", left: 150, top: 800, display: "flex", gap: 14 }}>
        {["My freelance tax system", "Stop chasing clients", "Price your work right", "Get paid before Friday"].map((t, i) => {
          const k = fill(i);
          return (
            <div key={i} style={{ width: 96, height: 150, position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 9, border: "2px dashed #DAD5CC" }} />
              {k > 0 && (
                <div style={{ position: "absolute", inset: 0, transform: `scale(${k})` }}>
                  <ReelCard w={96} h={150} title={t} views={["4.3K views", "6.4K views", "3.1K views", "4.8K views"][i]} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 3 + 4 · dark: plugin announcement, R badge, then the video-style picker with gold reels
const S3: React.FC<{ s: number }> = ({ s }) => {
  const tag = pop(s, wt(18) - 0.05, 0.35);
  const r = pop(s, wt(21) - 0.1, 0.4);
  const titleSel = ramp(s, wt(19) - 0.05, 0.25);
  const swap = ramp(s, T.s4 - 0.1, 0.35, out);
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - swap, filter: swap > 0 ? `blur(${swap * 14}px)` : undefined }}>
        <Browser x={83} y={398} w={555} h={440} url="claude.com">
          <div style={{ background: "#F9F7F3", position: "absolute", inset: 0, padding: "22px 25px" }}>
            <div style={{ width: 140, height: 140, borderRadius: 22, background: "#EBC5B2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={80} height={90} viewBox="0 0 80 90" fill="#fff" stroke="#1A1A1A" strokeWidth={2.4}>
                <path d="M20 14h34v62H20z" transform="translate(6,6)" />
                <path d="M14 8h34v62H14z" />
                <path d="M26 36l-6 6 6 6M38 36l6 6-6 6M34 32l-4 20" fill="none" />
              </svg>
            </div>
            <div style={{ marginTop: 36 }}>
              <Sel k={titleSel}>
                <div style={{ fontFamily: serif, fontWeight: 500, fontSize: 40, color: K.ink, lineHeight: 1.12, letterSpacing: -0.6 }}>
                  Customize Claude
                  <br />
                  Code with plugins
                </div>
              </Sel>
            </div>
            <div style={{ fontFamily: sans, fontSize: 17.5, color: "#3a3a3a", lineHeight: 1.6, marginTop: 18 }}>Claude Code now supports plugins: custom collections of slash commands, agents, MCP servers, and hooks that install with a single command.</div>
          </div>
        </Browser>
        {tag > 0 && <div style={{ position: "absolute", left: 600, top: 390, transform: `translate(-50%,-50%) scale(${tag}) rotate(4deg)`, background: K.gold, color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 20, borderRadius: 10, padding: "4px 14px" }}>new</div>}
        {r > 0 && (
          <>
            <div style={{ position: "absolute", left: 300, top: 470, width: 150, height: 150, border: `2px dashed ${K.amber2}`, borderRadius: 12, opacity: r * 0.7 }} />
            <div style={{ position: "absolute", left: 315, top: 315, transform: `scale(${r})` }}>
              <RLogo size={150} />
            </div>
          </>
        )}
      </div>
      {swap > 0 && <S4 s={s} k={swap} />}
    </AbsoluteFill>
  );
};

const S4: React.FC<{ s: number; k: number }> = ({ s, k }) => {
  const golds = [0, 1, 2].map((i) => ramp(s, wt(26) - 0.1 + i * 0.08, 0.45, back));
  const styles = [
    { n: "Ripping", bg: "#F3EFE8", fg: K.ink, sel: true },
    { n: "Operator", bg: "linear-gradient(180deg,#3B2F14,#1B160B)", fg: "#E7C46A" },
    { n: "Neon Night", bg: "linear-gradient(180deg,#24113D,#0E0718)", fg: "#E4A6FF" },
    { n: "Editorial", bg: "#F6F2EA", fg: K.ink },
  ];
  return (
    <AbsoluteFill style={{ opacity: k, transform: `scale(${lerp(1.08, 1, k)})` }}>
      <Browser x={83} y={370} w={555} h={70} url="getripping.com/video" dark style={{ opacity: 0.5, transform: "scale(.94)" }} />
      <Browser x={83} y={400} w={555} h={70} url="getripping.com/video" dark style={{ opacity: 0.7, transform: "scale(.97)" }} />
      <Browser x={83} y={430} w={555} h={390} url="getripping.com/video">
        <div style={{ position: "absolute", inset: 0, background: "#FAF8F4", padding: 18, display: "flex", gap: 12 }}>
          {styles.map((st, i) => (
            <div key={i} style={{ flex: 1, borderRadius: 12, border: st.sel ? `2px solid ${K.amber2}` : "1px solid #E4DFD6", background: "#fff", padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ height: 230, borderRadius: 9, background: st.bg, padding: 10, boxSizing: "border-box", fontFamily: sans, fontWeight: 700, fontSize: 13, color: st.fg }}>
                Third ship it
                <div style={{ marginTop: 10, fontWeight: 500, fontSize: 11, opacity: 0.8, lineHeight: 1.6 }}>open the template · invite your team · ship it</div>
              </div>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 12, color: K.ink }}>{st.n}</div>
            </div>
          ))}
        </div>
      </Browser>
      <div style={{ position: "absolute", left: 560, top: 390 }}>
        <RLogo size={58} />
      </div>
      <div style={{ position: "absolute", left: 600, top: 362, background: K.gold, color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 16, borderRadius: 8, padding: "2px 10px", transform: "rotate(4deg)" }}>new</div>
      {[
        ["Get paid before Friday", "4.8K views"],
        ["Late payers hate this", "5.2K views"],
        ["Invoice in ten seconds", "3.9K views"],
      ].map(([t, v], i) => (
        <div key={i} style={{ position: "absolute", left: 195 + i * 120, top: 640 + (1 - golds[i]) * 600, transform: `rotate(${(i - 1) * 3}deg)` }}>
          <ReelCard w={112} h={190} gold title={t} views={v} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

// 5 · light: script engine card, views-per-post chart with "better", next script learning
const S5: React.FC<{ s: number }> = ({ s }) => {
  const under = ramp(s, wt(36), 0.5, out);
  const step = ramp(s, wt(37) - 0.1, 0.8, out);
  const better = pop(s, wt(37), 0.35);
  const learned = ["learned: shorter hook", "learned: open on the number", "learned: end on a question"];
  return (
    <AbsoluteFill>
      <Card x={83} y={290} w={555} h={250} dark>
        <div style={{ padding: "12px 16px", fontFamily: mono, fontSize: 11, color: "#7E7A74" }}>● ● ●  getripping.com · Claude vs. Claude • Ripping</div>
        <div style={{ padding: "6px 20px", fontFamily: sans, fontSize: 18, color: "#EDEAE4", lineHeight: 1.45 }}>
          Track specific creators, sort by performance, and tweak messaging for your own audience.
          <div style={{ margin: "14px 0 6px", fontFamily: mono, fontSize: 11, color: "#7E7A74", letterSpacing: 1 }}>TOPICS & HOOKS</div>
          <span>Hooks based on psychology and trained on 40M winners, and </span>
          <span style={{ background: `linear-gradient(90deg, rgba(201,132,36,.55) ${under * 100}%, transparent ${under * 100}%)`, borderRadius: 3 }}>gets better with every run.</span>
          <div style={{ marginTop: 16, height: 8, borderRadius: 4, background: "#2A2724" }}>
            <div style={{ width: `${30 + 70 * under}%`, height: "100%", borderRadius: 4, background: AMBER_GRAD }} />
          </div>
        </div>
      </Card>
      <Card x={83} y={560} w={268} h={250}>
        <div style={{ padding: "14px 14px 0", display: "flex", alignItems: "center", gap: 8, fontFamily: sans, fontWeight: 700, fontSize: 13, color: K.ink }}>
          <AppIcon kind="eye" size={22} /> VIEWS PER POST
        </div>
        <svg width={268} height={200} style={{ position: "absolute", left: 0, top: 40 }}>
          {[50, 90, 130].map((y) => (
            <line key={y} x1={20} x2={250} y1={y} y2={y} stroke="#EFEBE4" strokeDasharray="4 4" />
          ))}
          <path d={`M 25 150 L 70 150 L 70 ${lerp(150, 125, step)} L 120 ${lerp(150, 125, step)} L 120 ${lerp(150, 95, step)} L 170 ${lerp(150, 95, step)} L 170 ${lerp(150, 60, step)} L 240 ${lerp(150, 60, step)}`} stroke={K.amber} strokeWidth={3} fill="none" />
          {[25, 70, 120, 170].map((x, i) => (
            <circle key={i} cx={x} cy={[150, lerp(150, 125, step), lerp(150, 95, step), lerp(150, 60, step)][i]} r={4} fill={K.amber} />
          ))}
        </svg>
        {better > 0 && <div style={{ position: "absolute", left: 140, top: 70, transform: `scale(${better})`, background: AMBER_GRAD, color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 22, borderRadius: 999, padding: "4px 18px", boxShadow: "0 6px 14px rgba(178,100,12,.35)" }}>better</div>}
      </Card>
      <Card x={370} y={560} w={268} h={250}>
        <div style={{ padding: "14px 14px 0", display: "flex", alignItems: "center", gap: 8, fontFamily: sans, fontWeight: 700, fontSize: 13, color: K.ink }}>
          <AppIcon kind="check" size={22} /> NEXT SCRIPT
        </div>
        <div style={{ margin: "12px 14px", padding: "8px 10px", borderRadius: 8, border: "1px solid #EAE5DD", fontFamily: sans, fontWeight: 700, fontSize: 13 }}>Stop chasing clients</div>
        {learned.map((l, i) => {
          const k = pop(s, wt(38) + i * 0.3, 0.3);
          return k > 0 ? (
            <div key={i} style={{ margin: "6px 14px", fontFamily: sans, fontSize: 12, color: K.ink, display: "flex", gap: 6, alignItems: "center", transform: `translateX(${(1 - k) * 30}px)`, opacity: k }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: K.amber2 }} /> {l}
            </div>
          ) : null;
        })}
      </Card>
    </AbsoluteFill>
  );
};

// 6 · 30x posted + two-week posting calendar
const S6: React.FC<{ s: number }> = ({ s }) => {
  const n = interpolate(s, [T.s6, wt(44) + 0.1], [1, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out });
  const box = ramp(s, wt(44), 0.25);
  const weeks = pop(s, wt(49), 0.35);
  const days = ["Oct 27", "Oct 28", "Oct 29", "Oct 30", "Oct 31", "Nov 1", "Nov 2", "Nov 3", "Nov 4", "Nov 5", "Nov 6", "Nov 7", "Nov 8", "Nov 9"];
  const per = [2, 3, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2];
  let idx = 0;
  const shownCards = Math.floor(n);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 360, top: 345, transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <Sel k={box}>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 96, color: K.amber, lineHeight: 1, letterSpacing: -3, padding: "0 10px" }}>{Math.floor(n)}x</div>
        </Sel>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 22, color: K.gray, marginTop: 8 }}>posted</div>
      </div>
      <Card x={83} y={435} w={555} h={360}>
        <Header icon="cal" title="Posting calendar" sub="Last two weeks · every reel" right={<div style={{ fontFamily: sans, fontWeight: 600, fontSize: 12, color: K.amber, background: "#FBF1E2", borderRadius: 99, padding: "3px 10px" }}>● Oct 27 – Nov 9</div>} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, padding: "14px 16px" }}>
          {days.map((d, i) => {
            const cards = Array.from({ length: per[i] }, () => idx++);
            return (
              <div key={i} style={{ height: 112, borderRadius: 8, background: "#FAF8F4", border: "1px solid #EEEAE2", padding: 5, boxSizing: "border-box" }}>
                <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 10.5, color: K.ink }}>{d}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
                  {cards.map((c) => {
                    const k = c < shownCards ? 1 : 0;
                    return <div key={c} style={{ width: 22, height: 30, borderRadius: 4, background: `linear-gradient(170deg,#E9BE55,${K.goldDeep})`, opacity: k, transform: `translateY(${(1 - k) * -10}px)` }} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      {weeks > 0 && (
        <div style={{ position: "absolute", left: 360, top: 830, transform: `translate(-50%,-50%) scale(${weeks})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 540, height: 12, borderLeft: `2px solid ${K.amber2}`, borderRight: `2px solid ${K.amber2}`, borderBottom: `2px solid ${K.amber2}`, marginTop: -30 }} />
          <div style={{ marginTop: 8, fontFamily: sans, fontWeight: 700, fontSize: 26, color: K.ink, background: "#fff", border: `2px solid ${K.amber2}`, borderRadius: 99, padding: "2px 20px" }}>
            <span style={{ color: K.amber }}>2</span> weeks
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const FlipTiles: React.FC<{ text: string; blur?: number; dark?: boolean; size?: number }> = ({ text, blur = 0, dark, size = 46 }) => (
  <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
    {text.split("").map((ch, i) =>
      ch === "," ? (
        <span key={i} style={{ fontFamily: mono, fontWeight: 700, fontSize: size, color: dark ? K.gold : K.ink, marginBottom: -4 }}>,</span>
      ) : (
        <div key={i} style={{ width: size * 1.22, height: size * 1.7, borderRadius: 6, background: dark ? "#1E1C1A" : "#F7F6F3", border: dark ? "1px solid #33302B" : "1px solid #E1DDD5", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: "inset 0 -2px 0 rgba(0,0,0,.04)" }}>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: size * 1.05, color: dark ? K.gold : K.ink, filter: blur > 0 ? `blur(${blur}px)` : undefined }}>{ch}</span>
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1.5, background: dark ? "#0D0C0B" : "#D9D4CB" }} />
        </div>
      ),
    )}
  </div>
);

// 7 · daily views odometer + audience counter with avatars
const S7: React.FC<{ s: number }> = ({ s }) => {
  const r1 = ramp(s, T.s7 + 0.05, 0.7, out);
  const v = s < wt(55) ? 3100582 * r1 : 3100000;
  const rolling = r1 < 1 && r1 > 0;
  const chart = ramp(s, T.s7, 1.2, out);
  const viewsPill = pop(s, wt(56) - 0.05, 0.35);
  const fol = s < wt(56) - 0.1 ? 0 : interpolate(s, [wt(56) - 0.1, wt(57) + 0.35], [10000, 14000], { extrapolateRight: "clamp", easing: out });
  const avatars = Math.floor(interpolate(s, [T.s7 + 0.4, wt(58) + 0.3], [2, 20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const followersBox = ramp(s, wt(57), 0.25);
  const tones = ["#C08A52", "#8C5A33", "#D79E6E", "#5E3B22", "#E7B78F", "#A06640", "#D98F8F", "#B48B6A"];
  const pts = Array.from({ length: 30 }, (_, i) => {
    const x = 20 + (i / 29) * 490;
    const y = 190 - Math.pow(i / 29, 3.2) * 170 - Math.sin(i * 1.3) * 3;
    return `${x},${y}`;
  });
  const cut = Math.max(2, Math.round(pts.length * chart));
  return (
    <AbsoluteFill>
      <Card x={83} y={292} w={555} h={328}>
        <Header icon="eye" title="Daily views" sub="Last two weeks" />
        <svg width={555} height={230} style={{ position: "absolute", left: 0, top: 80 }}>
          <defs>
            <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#C98424" stopOpacity={0.25} />
              <stop offset="1" stopColor="#C98424" stopOpacity={0} />
            </linearGradient>
          </defs>
          <polygon points={`20,200 ${pts.slice(0, cut).join(" ")} ${pts[cut - 1].split(",")[0]},200`} fill="url(#vg)" />
          <polyline points={pts.slice(0, cut).join(" ")} fill="none" stroke={K.amber} strokeWidth={3.5} strokeLinecap="round" />
          <circle cx={Number(pts[cut - 1].split(",")[0])} cy={Number(pts[cut - 1].split(",")[1])} r={6} fill={K.amber} />
          <line x1={20} x2={535} y1={200} y2={200} stroke="#E8E4DD" />
        </svg>
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, display: "flex", justifyContent: "space-between", fontFamily: sans, fontSize: 13, color: K.gray }}>
          <span>Oct 27</span>
          <span>Nov 2</span>
          <span>Nov 9</span>
        </div>
        <div style={{ position: "absolute", left: 32, top: 92 }}>
          <FlipTiles text={seven(v)} blur={rolling ? 1.5 : 0} />
        </div>
        {viewsPill > 0 && (
          <div style={{ position: "absolute", left: 210, top: 198, transform: `scale(${viewsPill})`, display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `2px solid ${K.amber2}`, borderRadius: 99, padding: "3px 16px", fontFamily: sans, fontWeight: 700, fontSize: 20, color: K.ink }}>
            <Glyph kind="eye" size={20} color={K.ink} /> views
          </div>
        )}
      </Card>
      <Card x={83} y={660} w={555} h={290}>
        <Header icon="people" title="Audience" sub="New followers · two weeks" right={<span />} />
        <div style={{ position: "absolute", left: 22, top: 100 }}>
          {fol > 0 ? (
            <Sel k={followersBox}>
              <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 64, color: K.amber, letterSpacing: -2, lineHeight: 1 }}>{Math.round(fol / 1000)}K</div>
            </Sel>
          ) : (
            <div style={{ width: 150, height: 40, borderRadius: 8, background: "#F0EDE8" }} />
          )}
          {followersBox > 0.5 && <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, color: K.ink, marginTop: 8 }}>followers</div>}
        </div>
        <div style={{ position: "absolute", left: 22, bottom: 34, display: "flex", gap: 4, alignItems: "flex-end" }}>
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} style={{ width: 12, height: 6 + Math.pow(i / 13, 2) * 50 * chart, borderRadius: 3, background: "#E7C79A" }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 290, top: 120, width: 240, height: 150 }}>
          {Array.from({ length: avatars }, (_, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            return (
              <div key={i} style={{ position: "absolute", left: col * 46, top: 110 - row * 40, width: 44, height: 44, borderRadius: 22, background: tones[i % tones.length], border: "3px solid #fff", boxShadow: "0 3px 8px rgba(0,0,0,.15)", overflow: "hidden" }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: "rgba(255,255,255,.85)", margin: "8px auto 0" }} />
                <div style={{ width: 30, height: 20, borderRadius: 15, background: "rgba(255,255,255,.85)", margin: "3px auto 0" }} />
              </div>
            );
          })}
        </div>
        {[
          ["Priya followed you", "2m", T.s7 + 0.6],
          ["Theo followed you", "now", wt(58)],
        ].map(([t, a, at], i) => {
          const k = pop(s, at as number, 0.35);
          return k > 0 ? (
            <div key={i} style={{ position: "absolute", left: 290, top: 20 + i * 44, transform: `scale(${k})`, transformOrigin: "0 50%", display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #E8E3DB", borderRadius: 10, padding: "6px 12px", boxShadow: shadow, fontFamily: sans, fontWeight: 600, fontSize: 14, color: K.ink }}>
              <span style={{ width: 20, height: 20, borderRadius: 10, background: tones[i + 1] }} /> {t} <span style={{ color: K.gray, fontWeight: 500, marginLeft: 10 }}>{a}</span>
            </div>
          ) : null;
        })}
      </Card>
    </AbsoluteFill>
  );
};

// 8 · dark: 1,341 + sign-ups table
const S8: React.FC<{ s: number }> = ({ s }) => {
  const n = interpolate(s, [T.s8, T.s8 + 0.6], [1243, 1341], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out });
  const box = ramp(s, T.s8 + 0.6, 0.25);
  const hiRow = ramp(s, wt(62), 0.25);
  const names = ["Alex", "Sam", "Jordan", "Priya", "Theo", "Maya", "Lena", "Omar"];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 360, top: 340, transform: "translate(-50%,-50%)" }}>
        <Sel k={box}>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 110, color: K.gold, letterSpacing: -3, lineHeight: 1, padding: "0 12px", textShadow: "0 0 30px rgba(226,178,60,.4)" }}>{fmt(n)}</div>
        </Sel>
      </div>
      <Card x={83} y={440} w={555} h={420} dark>
        <div style={{ height: 30, background: "#1E1C1A", display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <span key={c} style={{ width: 9, height: 9, borderRadius: 5, background: c }} />
          ))}
          <span style={{ marginLeft: 150, fontFamily: sans, fontSize: 12, color: "#8E8A84" }}>📱 App · Sign-ups</span>
        </div>
        <div style={{ display: "flex", gap: 22, padding: "12px 18px", fontFamily: sans, fontSize: 13, color: "#8E8A84" }}>
          <span style={{ color: "#fff", fontWeight: 600 }}>• All users</span>
          <span>Trials</span>
          <span>Paid</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 18px 10px", fontFamily: sans, fontWeight: 700, fontSize: 16, color: "#fff" }}>
          Latest sign-ups
          <span style={{ fontSize: 12, color: K.gold, background: "rgba(226,178,60,.15)", borderRadius: 99, padding: "3px 10px" }}>+{fmt(n)} total</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "0 18px 6px", fontFamily: mono, fontSize: 10, color: "#6E6A64", letterSpacing: 1 }}>
          <span>NAME</span>
          <span>PLAN</span>
          <span>SOURCE</span>
          <span>JOINED</span>
        </div>
        {names.map((nm, i) => (
          <div key={nm} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", alignItems: "center", margin: "0 10px", padding: "7px 8px", borderRadius: 8, borderTop: "1px solid #24221F", fontFamily: sans, fontSize: 13, color: "#D8D4CD", background: i === 0 ? `rgba(226,178,60,${0.14 * hiRow})` : undefined, outline: i === 0 && hiRow > 0.5 ? `1.5px solid ${K.gold}` : undefined }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 20, height: 20, borderRadius: 10, background: ["#C08A52", "#8C5A33", "#D79E6E", "#5E3B22"][i % 4] }} />
              {nm}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: K.gold, background: "rgba(226,178,60,.14)", borderRadius: 99, padding: "1px 8px", justifySelf: "start" }}>Trial</span>
            <span style={{ fontFamily: mono, fontSize: 11, color: "#8E8A84" }}>reel {String(17 + i * 3).padStart(3, "0")}</span>
            <span style={{ fontSize: 11, color: "#8E8A84" }}>{i === 0 ? "just now" : `${i * 2}m ago`}</span>
          </div>
        ))}
      </Card>
    </AbsoluteFill>
  );
};

// 9 · dark: posted flip counter → 100x, Post button, up-next queue
const S9: React.FC<{ s: number }> = ({ s }) => {
  const seq = s < wt(70) - 0.3 ? "0631" : s < wt(70) ? "1008" : "100x";
  const roll = s >= T.s9 && s < wt(70) + 0.05 ? (Math.floor(s * 20) % 2) * 1.2 : 0;
  const box = ramp(s, wt(70), 0.25);
  const post = 1 + 0.06 * Math.sin(s * 10) * ramp(s, wt(69), 0.2);
  return (
    <AbsoluteFill>
      <Card x={83} y={330} w={370} h={250} dark>
        <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 10, fontFamily: sans, fontWeight: 700, fontSize: 18, color: "#fff" }}>
          <span style={{ fontFamily: mono, color: "#8E8A84", fontSize: 14 }}>▤</span> posted <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: 4, background: K.gold }} />
        </div>
        <div style={{ padding: "4px 18px" }}>
          <Sel k={box} color={K.gold}>
            <FlipTiles text={seq} dark blur={roll} size={44} />
          </Sel>
        </div>
        <div style={{ display: "flex", gap: 3, padding: "26px 18px 0" }}>
          {Array.from({ length: 34 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 14, borderRadius: 2, background: i < (s - T.s9) * 16 ? K.gold : "#2A2724" }} />
          ))}
        </div>
      </Card>
      <Card x={468} y={330} w={170} h={250} dark>
        <div style={{ padding: 12, display: "flex", alignItems: "center", gap: 8, fontFamily: sans, fontWeight: 700, fontSize: 12, color: "#fff" }}>
          <AppIcon kind="check" size={26} />
          <div>
            Tallybird
            <div style={{ fontSize: 9, color: "#8E8A84", letterSpacing: 1 }}>AUTO-POST</div>
          </div>
        </div>
        <div style={{ margin: "4px 12px", transform: `scale(${post})`, background: K.gold, color: "#fff", borderRadius: 8, textAlign: "center", fontFamily: sans, fontWeight: 700, fontSize: 18, padding: "8px 0" }}>↑ Post</div>
        {["reel 097  9:14 AM", "reel 098  9:16 AM", "reel 099  9:18 AM", "reel 100  9:20 AM"].map((r, i) => (
          <div key={i} style={{ margin: "8px 14px 0", fontFamily: mono, fontSize: 10.5, color: i < (s - T.s9) * 2 ? "#E7E3DC" : "#55514B" }}>{r}</div>
        ))}
      </Card>
      <Card x={83} y={600} w={555} h={290} dark>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, fontFamily: sans, fontWeight: 700, fontSize: 20, color: "#fff" }}>
          <AppIcon kind="check" size={30} />
          <div>
            <div style={{ fontSize: 9, color: "#8E8A84", letterSpacing: 1 }}>TALLYBIRD</div>
            Up next
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, color: K.gold, background: "rgba(226,178,60,.15)", borderRadius: 99, padding: "3px 10px" }}>+ 100 queued</span>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "0 16px", transform: `translateX(${-((s - T.s9) * 60) % 128}px)` }}>
          {["My freelance tax system", "Stop chasing clients", "Price your work right", "Never chase an invoice", "Late payers hate this", "Get paid before Friday"].map((t, i) => (
            <ReelCard key={i} w={118} h={200} dark title={t} views={`${(4 + (i % 3)) % 9}.${(i * 3) % 10}K views`} />
          ))}
        </div>
      </Card>
    </AbsoluteFill>
  );
};

// 10 · dark: conversion gauge drops to 1.2%, "lower"
const S10: React.FC<{ s: number }> = ({ s }) => {
  const d1 = ramp(s, wt(81) - 0.1, 0.4, out);
  const d = ramp(s, wt(83) - 0.12, 0.45, Easing.out(Easing.back(1.4)));
  const val = lerp(lerp(4.1, 2.3, d1), 1.2, d);
  const ang = -90 + (val / 5) * 180;
  const pill = pop(s, wt(80) - 0.05, 0.35);
  const lower = pop(s, wt(83), 0.35);
  const CX = 277;
  const CY = 250;
  const R = 185;
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [CX + R * Math.cos(((a - 90) * Math.PI) / 180), CY + R * Math.sin(((a - 90) * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
  };
  return (
    <AbsoluteFill>
      <Card x={83} y={300} w={555} h={490} dark>
        <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <AppIcon kind="check" size={32} />
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 16, color: "#fff" }}>
            Tallybird
            <div style={{ fontSize: 10, color: "#8E8A84", letterSpacing: 1, fontWeight: 600 }}>ANALYTICS · TRIAL TO PAID</div>
          </div>
          <span style={{ marginLeft: "auto", fontFamily: sans, fontSize: 12, color: "#8E8A84" }}>Last 30 days</span>
          <span style={{ fontFamily: sans, fontSize: 11, color: K.gold, background: "rgba(226,178,60,.15)", borderRadius: 99, padding: "3px 10px" }}>● Live</span>
        </div>
        <svg width={555} height={380} style={{ position: "absolute", left: 0, top: 60 }}>
          <defs>
            <linearGradient id="gg" x1="0" x2="1">
              <stop offset="0" stopColor={lerp(0, 1, d) > 0.5 ? "#FF3B2F" : "#8E2A20"} />
              <stop offset="0.45" stopColor={d > 0.5 ? "#C2361F" : "#B0471F"} />
              <stop offset="1" stopColor={d > 0.5 ? "#7A5A1A" : K.gold} />
            </linearGradient>
          </defs>
          <path d={arc(-90, 90)} stroke="url(#gg)" strokeWidth={44} fill="none" />
          {[0, 1, 2, 3, 4, 5].map((t) => {
            const a = ((-90 + t * 36 - 90) * Math.PI) / 180;
            return (
              <text key={t} x={CX + (R - 44) * Math.cos(a)} y={CY + (R - 44) * Math.sin(a) + 4} textAnchor="middle" style={{ fontFamily: sans, fontSize: 11, fill: "#8E8A84" }}>
                {t}%
              </text>
            );
          })}
          <g transform={`rotate(${ang} ${CX} ${CY})`}>
            <line x1={CX} y1={CY} x2={CX} y2={CY - R + 30} stroke="#F4F0E8" strokeWidth={5} strokeLinecap="round" />
          </g>
          <circle cx={CX} cy={CY} r={12} fill="#161513" stroke={d > 0.5 ? K.red : K.gold} strokeWidth={5} />
          <text x={CX} y={CY + 46} textAnchor="middle" style={{ fontFamily: sans, fontWeight: 800, fontSize: 28, fill: d > 0.5 ? "#FF4B3E" : K.gold }}>
            {val.toFixed(1)}%
          </text>
          <text x={CX} y={CY + 66} textAnchor="middle" style={{ fontFamily: sans, fontWeight: 600, fontSize: 10, fill: "#8E8A84", letterSpacing: 1 }}>
            TRIAL → PAID
          </text>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontFamily: sans, fontWeight: 700, fontSize: 15 }}>
          <span style={{ background: K.gold, color: "#2A1E08", borderRadius: 99, padding: "3px 12px", opacity: d1 > 0.5 ? 0.45 : 1, textDecoration: d1 > 0.5 ? "line-through" : undefined }}>4.1%</span>
          <span style={{ color: "#8E8A84" }}>→</span>
          <span style={{ background: d1 > 0.5 && d < 0.5 ? K.red : "#3A1512", color: d1 > 0.5 && d < 0.5 ? "#fff" : "#FF6B5E", borderRadius: 99, padding: "3px 12px" }}>2.3%</span>
          <span style={{ color: "#8E8A84" }}>→</span>
          <span style={{ background: d > 0.5 ? K.red : "#3A1512", color: d > 0.5 ? "#fff" : "#FF6B5E", borderRadius: 99, padding: "3px 12px" }}>1.2%</span>
        </div>
        {pill > 0 && <div style={{ position: "absolute", left: 277, top: 108, transform: `translate(-50%,-50%) scale(${pill})`, background: "rgba(226,178,60,.2)", border: `1px solid ${K.gold}`, color: K.gold, fontFamily: sans, fontWeight: 700, fontSize: 25, borderRadius: 99, padding: "5px 22px", whiteSpace: "nowrap" }}>conversion rates</div>}
      </Card>
      {lower > 0 && (
        <div style={{ position: "absolute", left: 360, top: 825, transform: `translate(-50%,-50%) scale(${lower})`, background: K.red, color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 28, borderRadius: 99, padding: "6px 26px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 10px 30px rgba(229,53,43,.4)" }}>
          <span style={{ width: 26, height: 26, borderRadius: 13, background: "#fff", color: K.red, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>!</span> lower
        </div>
      )}
    </AbsoluteFill>
  );
};

// 11 · audience research + Maya's week, "Post reels" climbs to the top
const S11: React.FC<{ s: number }> = ({ s }) => {
  const zoom = ramp(s, wt(91) - 0.2, 0.6, Easing.inOut(Easing.cubic));
  const up = ramp(s, wt(94) - 0.05, 0.45, back);
  const clock = (s - T.s11) * 260;
  const rows = [
    { n: "Build", d: "Mon", h: "18h", w: 0.9 },
    { n: "Support", d: "Tue", h: "9h", w: 0.5 },
    { n: "Investor call", d: "Wed", h: "3h", w: 0.2 },
    { n: "Bug fixes", d: "Thu", h: "7h", w: 0.4 },
    { n: "Post reels", d: "Fri", h: "1h", w: 0.06 },
  ];
  const chip = (t: string, c: string, bg: string) => <span style={{ display: "inline-block", fontFamily: sans, fontWeight: 600, fontSize: 10, color: c, background: bg, borderRadius: 6, padding: "3px 7px", margin: "0 4px 4px 0" }}>{t}</span>;
  const col = (title: string, tone: string) => (
    <div style={{ flex: 1, borderRadius: 10, border: `2px solid ${tone}`, padding: 10, background: "#fff" }}>
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 13, color: K.ink }}>{title}</div>
      <div style={{ fontFamily: sans, fontSize: 9, color: K.gray, margin: "2px 0 8px" }}>Launch</div>
      <div style={{ fontFamily: mono, fontSize: 8, color: K.gray, letterSpacing: 1 }}>PAINS</div>
      {chip("No time to post", "#C0561E", "#FCE7D9")}
      {chip("Ads too expensive", "#C0561E", "#FCE7D9")}
      <div style={{ fontFamily: mono, fontSize: 8, color: K.gray, letterSpacing: 1 }}>WANTS</div>
      {chip("Steady inbound", K.green, "#E2F4E8")}
      {chip("Lower CAC", K.green, "#E2F4E8")}
    </div>
  );
  return (
    <AbsoluteFill>
      <Card x={83} y={290} w={555} h={300}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1, 2.1, zoom)})`, transformOrigin: "34% 52%" }}>
          <div style={{ display: "flex", height: "100%" }}>
            <div style={{ width: 110, borderRight: "1px solid #EEE9E1", padding: "34px 10px", fontFamily: sans, fontSize: 10, color: K.gray, lineHeight: 2 }}>
              {["Overview", "Research", "Scripting", "Production", "Library", "Inbox", "Analytics", "Calendar"].map((x) => (
                <div key={x}>{x}</div>
              ))}
            </div>
            <div style={{ flex: 1, display: "flex", gap: 10, padding: "30px 12px" }}>
              {col("SaaS founders", "#3E6BFF")}
              {col("Agency owners", "#E7E2DA")}
            </div>
          </div>
          <svg width={18} height={22} style={{ position: "absolute", left: 210, top: 150 }} viewBox="0 0 18 22">
            <path d="M1 1l15 9-7 2-3 8z" fill={K.ink} stroke="#fff" strokeWidth={1.5} />
          </svg>
        </div>
      </Card>
      <Card x={83} y={608} w={555} h={270}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 18px" }}>
          <div>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 17, color: K.ink }}>Maya's week</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: K.gray }}>MON – FRI · TALLYBIRD</div>
          </div>
          <svg width={40} height={40} style={{ marginLeft: "auto" }}>
            <circle cx={20} cy={20} r={17} fill="#fff" stroke={up > 0.5 ? K.amber : K.ink} strokeWidth={2} />
            <line x1={20} y1={20} x2={20 + 11 * Math.sin((clock * Math.PI) / 180)} y2={20 - 11 * Math.cos((clock * Math.PI) / 180)} stroke={K.ink} strokeWidth={2} strokeLinecap="round" />
            <line x1={20} y1={20} x2={20 + 7 * Math.sin((clock * Math.PI) / 2160)} y2={20 - 7 * Math.cos((clock * Math.PI) / 2160)} stroke={K.ink} strokeWidth={2.5} strokeLinecap="round" />
          </svg>
        </div>
        {rows.map((r, i) => {
          const isPost = i === 4;
          const slot = isPost ? lerp(4, 0, up) : i + up;
          const width = isPost ? lerp(r.w, 1, up) : r.w;
          return (
            <div key={r.n} style={{ position: "absolute", left: 14, right: 14, top: 78 + slot * 36, height: 32, borderRadius: 7, display: "flex", alignItems: "center", gap: 10, padding: "0 10px", background: isPost && up > 0.2 ? AMBER_GRAD : "transparent", borderLeft: isPost && s >= wt(88) ? `4px solid ${K.amber}` : "4px solid transparent", zIndex: isPost ? 2 : 1 }}>
              <span style={{ width: 120, fontFamily: sans, fontWeight: isPost ? 800 : 600, fontSize: 14, color: isPost && up > 0.2 ? "#fff" : K.ink }}>{r.n}</span>
              <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 9, color: "#B5541A", background: "#FCE7D9", borderRadius: 4, padding: "1px 5px" }}>{r.d}</span>
              <div style={{ flex: 1, height: 5, borderRadius: 3, background: isPost && up > 0.2 ? "rgba(255,255,255,.3)" : "#F0ECE5" }}>
                <div style={{ width: `${width * 100}%`, height: "100%", borderRadius: 3, background: isPost && up > 0.2 ? "#fff" : "#E5603A" }} />
              </div>
              <span style={{ width: 30, fontFamily: sans, fontSize: 11, color: isPost && up > 0.2 ? "#fff" : K.gray }}>{isPost && up > 0.5 ? "1st" : r.h}</span>
            </div>
          );
        })}
      </Card>
    </AbsoluteFill>
  );
};

// 12 · content calendar fills to 100x, views-per-video bars and the average line
const S12: React.FC<{ s: number }> = ({ s }) => {
  const n = interpolate(s, [T.s12 + 0.3, wt(107) + 0.05], [62, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out });
  const box = ramp(s, wt(107), 0.25);
  const bars = ramp(s, wt(114) - 0.2, 0.8, out);
  const avg = ramp(s, wt(114) + 0.2, 0.4);
  const head = ramp(s, wt(109), 0.3);
  const preview = pop(s, wt(107) + 0.2, 0.4);
  const filled = Math.floor(n);
  return (
    <AbsoluteFill>
      <Card x={83} y={290} w={555} h={400}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, fontFamily: sans, fontWeight: 600, fontSize: 12, color: K.gray, background: head > 0.5 ? "#F3E2C8" : undefined }}>
          <AppIcon kind="cal" size={20} /> Tallybird · Content calendar
        </div>
        <div style={{ display: "flex", alignItems: "center", padding: "0 16px" }}>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 30, color: head > 0.5 ? K.amber : K.ink, letterSpacing: -1 }}>this month</div>
          <div style={{ marginLeft: "auto", fontFamily: sans, fontWeight: 800, fontSize: 40, color: box > 0.5 ? "#fff" : K.ink, background: box > 0.5 ? AMBER_GRAD : "transparent", borderRadius: 8, padding: "0 10px", letterSpacing: -1.5 }}>{filled}x</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, padding: "10px 16px" }}>
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
            <div key={d} style={{ fontFamily: mono, fontSize: 9, color: K.gray }}>{d}</div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 2;
            const count = day >= 0 && day < 30 ? Math.max(0, Math.min(4, Math.round((filled - day * 3.2) / 3.3))) : 0;
            return (
              <div key={i} style={{ height: 50, position: "relative" }}>
                {day >= 0 && day < 30 && <span style={{ fontFamily: sans, fontSize: 8, color: K.gray }}>{day + 1}</span>}
                {Array.from({ length: Math.min(count, 4) }, (_, j) => (
                  <div key={j} style={{ position: "absolute", left: 8 + j * 5, top: 10 + j * 3, width: 26, height: 34, borderRadius: 4, background: "#F2DFC0", border: "1px solid #C9A46A" }} />
                ))}
              </div>
            );
          })}
        </div>
        {preview > 0 && (
          <div style={{ position: "absolute", right: 22, top: 140, transform: `scale(${preview}) rotate(3deg)`, transformOrigin: "100% 0" }}>
            <div style={{ width: 120, padding: 8, borderRadius: 10, background: "#fff", border: `1.5px solid ${K.amber2}`, boxShadow: shadow }}>
              <div style={{ fontFamily: sans, fontSize: 9, color: K.gray }}>• Trial</div>
              <div style={{ height: 70, borderRadius: 6, background: "#EAD7B8", margin: "6px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Glyph kind="play" size={16} color="#fff" />
              </div>
              <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 10 }}>Stop chasing clients</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: K.amber }}>5.2K views</div>
            </div>
          </div>
        )}
      </Card>
      <Card x={83} y={708} w={555} h={170}>
        <div style={{ padding: "12px 16px", fontFamily: mono, fontSize: 10, color: K.gray, letterSpacing: 1 }}>VIEWS PER VIDEO</div>
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 18, height: 100, display: "flex", alignItems: "flex-end", gap: 3 }}>
          {Array.from({ length: 40 }, (_, i) => {
            const h = 30 + ((i * 37) % 55) + (i % 7 === 0 ? 30 : 0);
            return <div key={i} style={{ flex: 1, height: Math.max(4, h * bars), borderRadius: 2, background: bars > 0.05 ? `linear-gradient(180deg,${K.amber2},${K.amber})` : "#EFEBE4" }} />;
          })}
          {avg > 0 && <div style={{ position: "absolute", left: 0, width: `${avg * 100}%`, bottom: 56, borderTop: `2px dashed ${K.ink}` }} />}
          {avg > 0.9 && <div style={{ position: "absolute", right: 0, bottom: 62, fontFamily: sans, fontWeight: 700, fontSize: 11, background: K.ink, color: "#fff", borderRadius: 99, padding: "2px 8px" }}>avg</div>}
        </div>
      </Card>
    </AbsoluteFill>
  );
};

// 13 · 5,000 views per reel → half a million in the ledger
const S13: React.FC<{ s: number }> = ({ s }) => {
  const fan = ramp(s, T.s13, 0.5, back);
  const half = ramp(s, wt(122) - 0.1, 0.3, out);
  const mil = ramp(s, wt(124) - 0.05, 0.25);
  const rows = ["Get paid before Friday", "Late payers hate this", "Invoice in ten seconds", "My freelance tax system", "Stop chasing clients"];
  return (
    <AbsoluteFill>
      {[-2, -1, 1, 2, 0].map((p) => {
        const big = p === 0;
        const w = big ? 170 : 108;
        const h = big ? 260 : 165;
        const x = 360 + p * 116 * fan;
        return (
          <div key={p} style={{ position: "absolute", left: x - w / 2, top: big ? 290 : 362 + Math.abs(p) * 6, transform: `rotate(${p * 4 * fan}deg)`, zIndex: big ? 2 : 1 }}>
            <div style={{ width: w, height: h, borderRadius: 12, background: "#fff", border: `2px solid ${K.amber2}`, padding: 10, boxSizing: "border-box", boxShadow: shadow, position: "relative", overflow: "hidden" }}>
              <div style={{ fontFamily: sans, fontSize: big ? 12 : 10, color: K.gray, background: "#F3F0EA", borderRadius: 99, padding: "1px 8px", display: "inline-block" }}>• Trial</div>
              <div style={{ height: big ? 120 : 76, borderRadius: 8, background: "linear-gradient(160deg,#EFE1CB,#E2CBA8)", margin: "8px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: big ? 40 : 26, height: big ? 40 : 26, borderRadius: 20, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Glyph kind="play" size={big ? 16 : 11} color={K.amber} />
                </div>
              </div>
              {big && <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 13 }}>Get paid before Friday</div>}
              {!big && <div style={{ position: "absolute", left: -10, right: -10, top: 98, transform: "rotate(-14deg)", background: "#fff", borderTop: `2px solid ${K.amber2}`, borderBottom: `2px solid ${K.amber2}`, fontFamily: sans, fontWeight: 800, fontSize: 13, color: K.amber, textAlign: "center", letterSpacing: 1 }}>5,000 VIEWS</div>}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 360, top: 590, transform: `translate(-50%,-50%) scale(${pop(s, wt(116) - 0.05, 0.35)})`, background: AMBER_GRAD, borderRadius: 12, padding: "4px 26px", display: "flex", alignItems: "baseline", gap: 12, color: "#fff", fontFamily: sans, fontWeight: 800, boxShadow: "0 10px 26px rgba(178,100,12,.35)", zIndex: 3 }}>
        <span style={{ fontSize: 58, letterSpacing: -2 }}>5,000</span>
        <span style={{ fontSize: 28 }}>views</span>
      </div>
      <Card x={83} y={653} w={555} h={304}>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, fontFamily: sans, fontWeight: 700, fontSize: 16, color: K.ink }}>
          <AppIcon kind="check" size={26} /> Tallybird · Views ledger <span style={{ marginLeft: "auto" }}><Live /></span>
        </div>
        <div style={{ margin: "0 16px", height: 30, borderRadius: 8, border: "1px solid #E4E0D8", background: "#FAF9F6", overflow: "hidden" }}>
          <div style={{ width: `${lerp(4, 100, half)}%`, height: "100%", background: AMBER_GRAD }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 16px", fontFamily: mono, fontSize: 11, color: K.gray }}>
          <span>reel 001</span>
          <span>reel 100</span>
        </div>
        <div style={{ opacity: 1 - half }}>
          {rows.map((r, i) => {
            const k = ramp(s, T.s13 + 0.15 + i * 0.12, 0.25);
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", margin: "2px 16px", padding: "5px 8px", borderRadius: 6, background: i % 2 ? "transparent" : "#F7F5F1", opacity: k, transform: `translateY(${(1 - k) * 10}px)`, fontFamily: sans, fontSize: 14.5, color: K.ink }}>
                <span>reel {String(i + 1).padStart(3, "0")} · {r}</span>
                <span style={{ fontFamily: mono, fontWeight: 700, color: K.amber }}>5,000 views</span>
              </div>
            );
          })}
        </div>
        {half > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", opacity: half, transform: `scale(${lerp(0.8, 1, half)})` }}>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 46, color: K.ink, letterSpacing: -1.5 }}>
              half a{" "}
              <Sel k={mil}>
                <span style={{ color: mil > 0.5 ? K.amber : K.ink }}>million</span>
              </Sel>
            </div>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 22, color: K.gray, marginTop: 4 }}>views</div>
          </div>
        )}
        <div style={{ position: "absolute", left: 16, bottom: 14, display: "flex", gap: 8, fontFamily: sans, fontSize: 12, fontWeight: 600 }}>
          <span style={{ color: K.amber, background: "#FBEBD2", borderRadius: 99, padding: "2px 10px" }}>● 100 trial reels</span>
          <span style={{ color: "#C9B795", background: "#F7F1E6", borderRadius: 99, padding: "2px 10px" }}>● this month</span>
        </div>
      </Card>
    </AbsoluteFill>
  );
};

// 14 · dark: 5 stadiums (drawn placeholders instead of photos)
const Stadium: React.FC<{ w: number; h: number; label: string }> = ({ w, h, label }) => (
  <div style={{ width: w, height: h, background: "#fff", padding: 5, borderRadius: 4, boxShadow: "0 10px 24px rgba(0,0,0,.5)", boxSizing: "border-box", position: "relative" }}>
    <svg width={w - 10} height={h - 10} viewBox="0 0 100 70" preserveAspectRatio="none">
      <rect width={100} height={70} fill="#5E7A4A" />
      <rect y={0} width={100} height={18} fill="#7C8F63" />
      <ellipse cx={50} cy={38} rx={44} ry={26} fill="#8E7A63" />
      <ellipse cx={50} cy={38} rx={36} ry={19} fill="#C9A04A" />
      <ellipse cx={50} cy={38} rx={27} ry={12} fill="#3F7C3A" />
      <text x={50} y={42} textAnchor="middle" style={{ fontSize: 9, fontWeight: 800, fill: "#F2D43A" }}>M</text>
    </svg>
    <div style={{ position: "absolute", left: 8, bottom: 8, fontFamily: mono, fontSize: 8, color: "#fff", background: "rgba(0,0,0,.5)", padding: "0 4px" }}>{label}</div>
  </div>
);
const S14: React.FC<{ s: number }> = ({ s }) => {
  const five = pop(s, T.s14, 0.35);
  const card = pop(s, wt(127) - 0.05, 0.35);
  const cap = ramp(s, wt(128), 0.3);
  const spots = [
    [70, 470, -4],
    [205, 455, 2],
    [345, 470, -2],
    [140, 560, 3],
    [285, 575, -3],
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 330, transform: `scale(${five})`, fontFamily: sans, fontWeight: 800, fontSize: 150, color: K.gold, lineHeight: 1, textShadow: "0 0 40px rgba(226,178,60,.6)" }}>5</div>
      {card > 0 && (
        <div style={{ position: "absolute", left: 280, top: 340, transform: `scale(${card})`, background: "#fff", borderRadius: 4, padding: "14px 22px", boxShadow: "0 10px 30px rgba(0,0,0,.5)", textAlign: "center" }}>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, color: K.ink }}>Michigan Stadium</div>
          <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 18, color: "#333", marginTop: 4 }}>The Big House</div>
        </div>
      )}
      {spots.map(([x, y, r], i) => {
        const k = pop(s, T.s14 + 0.2 + i * 0.12, 0.35);
        return k > 0 ? (
          <div key={i} style={{ position: "absolute", left: x + 40, top: y + 60, transform: `scale(${k}) rotate(${r}deg)` }}>
            <Stadium w={185} h={125} label={`stadium ${i + 1}`} />
          </div>
        ) : null;
      })}
      {cap > 0 && (
        <div style={{ position: "absolute", left: 360, top: 830, transform: "translateX(-50%)", opacity: cap, textAlign: "center" }}>
          <div style={{ background: "#fff", padding: "6px 12px", fontFamily: sans, fontSize: 18, color: K.ink, whiteSpace: "nowrap" }}>
            capacity is <span style={{ background: "#F5DFA8", padding: "0 3px" }}>107,601</span>, but it has hosted crowds in
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#6E6A64", marginTop: 4 }}>en.wikipedia.org · Michigan Stadium</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// 15 · dark: funnel, can't, two paid customers
const S15: React.FC<{ s: number }> = ({ s }) => {
  const cant = pop(s, wt(133) - 0.05, 0.35);
  const cust = ramp(s, wt(136) - 0.05, 0.4, back);
  const halfK = pop(s, wt(139) - 0.05, 0.35);
  const layers = [
    { n: "VIEWS", w: 420, y: 345 },
    { n: "VISITS", w: 330, y: 425 },
    { n: "SIGN-UPS", w: 240, y: 500 },
    { n: "PAID", w: 140, y: 570 },
  ];
  return (
    <AbsoluteFill>
      {cant > 0 && <div style={{ position: "absolute", left: 95, top: 300, transform: `scale(${cant})`, background: K.red, color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 19, borderRadius: 8, padding: "3px 12px" }}>⚠ can't</div>}
      <div style={{ position: "absolute", left: 520, top: 300, display: "flex", alignItems: "center", gap: 6, fontFamily: sans, fontSize: 13, color: "#ddd" }}>
        <AppIcon kind="check" size={22} /> Tallybird <span style={{ fontSize: 10, color: K.gold, background: "rgba(226,178,60,.15)", borderRadius: 99, padding: "1px 6px" }}>● live</span>
      </div>
      {layers.map((l, i) => {
        const k = ramp(s, T.s15 + i * 0.1, 0.35, out);
        const next = layers[i + 1]?.w ?? 80;
        const gold = i === 3;
        return (
          <div key={l.n} style={{ position: "absolute", left: 360 - l.w / 2, top: l.y, width: l.w, height: 64, opacity: k, transform: `translateY(${(1 - k) * 20}px)`, clipPath: `polygon(0 0, 100% 0, ${50 + (next / l.w) * 50}% 100%, ${50 - (next / l.w) * 50}% 100%)`, background: gold ? `linear-gradient(180deg,${K.gold},${K.amber})` : `linear-gradient(180deg,rgba(80,72,62,.85),rgba(40,36,32,.9))`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontWeight: 800, fontSize: 15, letterSpacing: 2, color: gold ? "#2A1E08" : "#E8E3DA" }}>
            {i === 0 && halfK > 0 ? <span style={{ fontSize: 22, letterSpacing: 0, transform: `scale(${halfK})`, color: "#fff" }}>half a million views</span> : l.n}
          </div>
        );
      })}
      {Array.from({ length: 16 }, (_, i) => {
        const p = ((s * 0.6 + i / 16) % 1) as number;
        const x = 360 + Math.sin(i * 2.3) * 180 * (1 - p);
        const y = 350 + p * 270;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 6, height: 6, borderRadius: 3, background: K.gold, opacity: (1 - p) * 0.9, boxShadow: `0 0 8px ${K.gold}` }} />;
      })}
      {[
        ["bounced", 430],
        ["left page", 470],
        ["no card", 545],
      ].map(([t, y], i) => (
        <div key={i} style={{ position: "absolute", left: 555, top: y as number, fontFamily: sans, fontSize: 11, color: "#FF6B5E", opacity: ramp(s, T.s15 + 0.4 + i * 0.15, 0.2) }}>
          ← {t}
        </div>
      ))}
      <Card x={83} y={655} w={555} h={170} dark>
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, fontFamily: sans, fontSize: 12, color: "#8E8A84" }}>
          <AppIcon kind="check" size={18} /> Tallybird · paid customers <span style={{ marginLeft: "auto", fontSize: 10, color: K.gold }}>● live</span>
        </div>
        <div style={{ display: "flex", gap: 12, padding: "4px 14px" }}>
          {[
            ["Theo", "#8C5A33"],
            ["Priya", "#D79E6E"],
          ].map(([n, c], i) => {
            const k = ramp(s, wt(136) - 0.05 + i * 0.12, 0.35, back);
            return (
              <div key={n} style={{ flex: 1, height: 100, borderRadius: 10, border: "1px solid #2E2B27", background: "#1C1A18", display: "flex", alignItems: "center", gap: 12, padding: "0 14px", opacity: k > 0 ? 1 : 0.25 }}>
                {k > 0 && (
                  <>
                    <div style={{ width: 52, height: 52, borderRadius: 26, background: c, border: `3px solid ${K.gold}`, transform: `scale(${k})`, boxShadow: `0 0 0 ${8 * (1 - Math.min(1, k))}px rgba(226,178,60,.3)` }} />
                    <div style={{ transform: `scale(${k})`, transformOrigin: "0 50%" }}>
                      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 18, color: "#fff" }}>{n}</div>
                      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 11, color: "#2A1E08", background: K.gold, borderRadius: 99, padding: "1px 8px", marginTop: 4 }}>● Paid · Pro</div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      {cust > 0 && <div style={{ position: "absolute", left: 360, top: 860, transform: `translate(-50%,-50%) scale(${cust})`, fontFamily: sans, fontWeight: 800, fontSize: 30, color: K.gold, textShadow: "0 0 20px rgba(226,178,60,.5)", whiteSpace: "nowrap" }}>couple conversions</div>}
    </AbsoluteFill>
  );
};

// 16 · landing page, red marker circles the headline, then an idea bulb
const S16: React.FC<{ s: number }> = ({ s }) => {
  const page = ramp(s, wt(145) - 0.1, 0.35, out);
  const mark = ramp(s, wt(150) - 0.05, 0.5, Easing.inOut(Easing.cubic));
  const tag = pop(s, wt(150), 0.3);
  const bulb = pop(s, wt(155) - 0.1, 0.4);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 125, top: 360, width: 470, height: 340, borderRadius: 16, background: "#fff", opacity: 0.9 * (1 - page), filter: "blur(4px)" }} />
      {page > 0 && (
        <div style={{ opacity: page, transform: `scale(${lerp(0.94, 1, page)})` }}>
          <Browser x={100} y={330} w={520} h={450} url="tallybird.app">
            <div style={{ position: "absolute", inset: 0, background: "#fff", padding: "14px 18px", fontFamily: sans }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
                <AppIcon kind="check" size={20} /> Tallybird
                <span style={{ marginLeft: "auto", fontWeight: 500, color: K.gray, fontSize: 12 }}>Features · Pricing · Log in</span>
              </div>
              <div style={{ position: "relative", display: "inline-block", marginTop: 26 }}>
                <div style={{ fontWeight: 800, fontSize: 28, color: K.ink, letterSpacing: -0.8 }}>Get paid before Friday</div>
                <svg width={360} height={80} style={{ position: "absolute", left: -24, top: -20, overflow: "visible" }}>
                  <ellipse cx={180} cy={38} rx={178} ry={32} fill="none" stroke={K.red} strokeWidth={4} strokeDasharray={760} strokeDashoffset={760 * (1 - mark)} transform="rotate(-2 180 38)" />
                </svg>
              </div>
              <div style={{ fontSize: 14, color: K.gray, marginTop: 6 }}>Invoices that chase themselves</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
                <span style={{ background: K.gold, color: "#fff", fontWeight: 700, fontSize: 13, borderRadius: 8, padding: "8px 14px" }}>Start free trial</span>
                <span style={{ fontSize: 11, color: K.gray }}>No card needed</span>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 26 }}>
                <div style={{ flex: 1, fontSize: 12, lineHeight: 1.7 }}>
                  {["Auto reminders", "Pay links", "Tax export"].map((f) => (
                    <div key={f}>
                      <b>{f}</b>
                      <div style={{ height: 6, width: "80%", background: "#EFEBE4", borderRadius: 3 }} />
                    </div>
                  ))}
                </div>
                <div style={{ width: 170, borderRadius: 10, border: "1px solid #EAE5DD", padding: 12 }}>
                  <div style={{ fontSize: 10, color: K.gray }}>Invoice no. 0142</div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>$480.00</div>
                  <div style={{ marginTop: 14, fontWeight: 800, fontSize: 18 }}>$12 a month</div>
                  <div style={{ marginTop: 8, background: K.gold, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "5px 0", textAlign: "center" }}>Start free trial</div>
                </div>
              </div>
            </div>
          </Browser>
          {tag > 0 && <div style={{ position: "absolute", left: 470, top: 345, transform: `scale(${tag}) rotate(-3deg)`, background: K.red, color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 18, borderRadius: 8, padding: "3px 12px" }}>• landing page</div>}
          {mark > 0 && mark < 1 && (
            <svg width={40} height={110} style={{ position: "absolute", left: 360 + 160 * Math.cos(mark * Math.PI * 2), top: 380 + 30 * Math.sin(mark * Math.PI * 2), transform: "rotate(30deg)" }}>
              <rect x={10} y={0} width={18} height={80} rx={4} fill="#F04A3E" />
              <path d="M10 80 L19 104 L28 80 Z" fill="#3A1A16" />
            </svg>
          )}
          {bulb > 0 && (
            <div style={{ position: "absolute", left: 520, top: 760, transform: `scale(${bulb})`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 13, color: "#fff", background: "#2A2724", borderRadius: 99, padding: "2px 10px" }}>idea ●</span>
              <svg width={50} height={70} viewBox="0 0 24 34">
                <path d="M12 2a9 9 0 0 0-5 16c1 1 1.5 2 1.5 4h7c0-2 .5-3 1.5-4A9 9 0 0 0 12 2z" fill="rgba(255,240,200,.25)" stroke="#E8E2D6" strokeWidth={1.4} />
                <rect x={8.5} y={23} width={7} height={5} rx={1} fill="#9B958B" />
              </svg>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

// 17 · light: research → production board, clock running all day
const S17: React.FC<{ s: number }> = ({ s }) => {
  const toBoard = ramp(s, wt(164) - 0.1, 0.35, out);
  // the reference holds 6:00 AM, then spins through the day: 9:14, noon, next morning 9:00
  const minutes = interpolate(s, [T.s17, 40.6, 41.0, 41.5, 42.2], [360, 360, 554, 720, 1980], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }) % 1440;
  const hh = Math.floor(minutes / 60);
  const mm = Math.floor(minutes % 60);
  const label = `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
  const allDay = pop(s, wt(171) - 0.05, 0.35);
  const thumbs = [
    ["I replaced five apps with one prompt", "#24324F", "2.4M"],
    ["Why your SaaS isn't growing", "#1F3B8A", "1.1M"],
    ["The $0 marketing plan", "#1D1F26", "870K"],
    ["Stop building features nobody uses", "#2F6BE0", "640K"],
  ];
  const posted = [
    ["Price your work right", "6.1K views"],
    ["Get paid before Friday", "4.8K views"],
    ["Invoice in ten seconds", "5.3K views"],
  ];
  const pi = Math.min(2, Math.floor((s - T.s17) / 1.1));
  const handA = ((minutes % 720) / 720) * 360;
  return (
    <AbsoluteFill>
      <Card x={83} y={290} w={555} h={300}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - toBoard }}>
          <div style={{ padding: "12px 16px", fontFamily: sans, fontSize: 12, color: K.gray }}>● ● ●  Research · What's working</div>
          <div style={{ padding: "0 16px", fontFamily: sans, fontWeight: 800, fontSize: 20, color: K.ink }}>Research</div>
          <div style={{ display: "flex", gap: 10, padding: "12px 16px" }}>
            {thumbs.map(([t, c, v], i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: 160, borderRadius: 8, background: `linear-gradient(170deg, ${c}, #0D1220)`, padding: 8, boxSizing: "border-box", fontFamily: sans, fontWeight: 700, fontSize: 12, color: "#fff", display: "flex", alignItems: "flex-end" }}>{t}</div>
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 12, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {toBoard > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: toBoard, padding: "12px 14px" }}>
            <div style={{ fontFamily: sans, fontSize: 12, color: K.gray }}>● ● ●  Production · Script to posted</div>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 20, color: K.ink, margin: "4px 0 10px" }}>Production</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Up next", "In Production", "Ready to Post", "Posted"].map((c, ci) => (
                <div key={c} style={{ flex: 1, background: "#F7F5F1", borderRadius: 8, padding: 6, height: 200, boxSizing: "border-box" }}>
                  <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 11, marginBottom: 6 }}>{c}</div>
                  {[0, 1, 2].map((j) => {
                    const moving = ci === 3 && j === 0;
                    const k = moving ? ramp(s, wt(168), 0.4, back) : 1;
                    return (
                      <div key={j} style={{ height: 44, borderRadius: 6, background: moving ? "#FFF6E6" : "#fff", border: moving ? `1.5px solid ${K.amber2}` : "1px solid #ECE8E1", marginBottom: 6, padding: 5, boxSizing: "border-box", fontFamily: sans, fontSize: 8.5, fontWeight: 600, color: K.ink, opacity: k, transform: `translateX(${(1 - k) * -60}px)` }}>
                        {["Why most AI apps never make a dollar", "The four things they all do", "Pricing your app in 60 seconds", "1.9 million apps launched this year", "Only 7.6% made any money", "Stop paying for five apps"][(ci * 3 + j) % 6]}
                        {moving && k > 0.9 && <div style={{ color: K.amber, fontWeight: 700 }}>● Posted 9:14</div>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      <div style={{ position: "absolute", left: 90, top: 630 }}>
        <svg width={250} height={250}>
          <circle cx={125} cy={125} r={112} fill="#fff" stroke="#E8E3DB" strokeWidth={3} />
          <circle cx={125} cy={125} r={112} fill="none" stroke={K.amber2} strokeWidth={8} strokeDasharray={704} strokeDashoffset={704 * (1 - ((minutes - 360) / 900) * 0.62)} transform="rotate(90 125 125)" strokeLinecap="round" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <line key={i} x1={125 + Math.cos(a) * 92} y1={125 + Math.sin(a) * 92} x2={125 + Math.cos(a) * (i % 6 ? 98 : 102)} y2={125 + Math.sin(a) * (i % 6 ? 98 : 102)} stroke="#B9B3A9" strokeWidth={2} />;
          })}
          {[
            ["12 PM", 125, 50],
            ["6 AM", 40, 129],
            ["6 PM", 210, 129],
            ["12 AM", 125, 210],
          ].map(([t, x, y]) => (
            <text key={t as string} x={x as number} y={y as number} textAnchor="middle" style={{ fontFamily: sans, fontSize: 11, fill: K.gray }}>
              {t}
            </text>
          ))}
          <line x1={125} y1={125} x2={125 + 70 * Math.cos(((handA - 90) * Math.PI) / 180)} y2={125 + 70 * Math.sin(((handA - 90) * Math.PI) / 180)} stroke={K.ink} strokeWidth={3} strokeLinecap="round" />
          <text x={125} y={130} textAnchor="middle" style={{ fontFamily: sans, fontWeight: 800, fontSize: 17, fill: K.ink }}>{label}</text>
          <text x={125} y={146} textAnchor="middle" style={{ fontFamily: mono, fontSize: 9, fill: K.gray }}>TODAY</text>
        </svg>
        {allDay > 0 && <div style={{ position: "absolute", left: 125, top: 250, transform: `translate(-50%,-50%) scale(${allDay})`, background: AMBER_GRAD, color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 21, borderRadius: 99, padding: "4px 18px", whiteSpace: "nowrap" }}>all day long</div>}
      </div>
      <div style={{ position: "absolute", left: 390, top: 650, fontFamily: sans, fontWeight: 700, fontSize: 20, color: K.ink, display: "flex", alignItems: "center", gap: 8 }}>
        Posted <span style={{ fontSize: 11, color: K.amber, background: "#FBEBD2", borderRadius: 99, padding: "2px 8px" }}>● Trial reels · live</span>
      </div>
      <div style={{ position: "absolute", left: 450, top: 690 }}>
        {posted.map(([t, v], i) => (
          <div key={i} style={{ position: "absolute", left: (i - pi) * 6, top: (i - pi) * 6, opacity: i < pi ? 0 : i === pi ? 1 : 0.6, zIndex: 10 - i, transform: `rotate(${(i - pi) * 4}deg)` }}>
            <ReelCard w={120} h={200} dark title={t} views={v} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 18 · comment RIP → big RIP + notification with access
const S18: React.FC<{ s: number }> = ({ s }) => {
  const bar = ramp(s, T.s18, 0.35, back);
  const typed = s < wt(176) ? 0 : Math.min(3, 1 + Math.floor((s - wt(176)) / 0.08));
  const big = pop(s, wt(176) + 0.15, 0.4);
  const ring = ramp(s, wt(176) + 0.1, 0.7, out);
  const notif = ramp(s, wt(178), 0.45, back);
  const acc = pop(s, wt(181) - 0.05, 0.35);
  const dots = s > wt(176) && s < wt(178);
  return (
    <AbsoluteFill style={{ transform: "scale(1.25)", transformOrigin: "360px 600px" }}>
      <div style={{ position: "absolute", left: 125, top: 365, width: 560, transform: `scale(${bar})`, transformOrigin: "50% 50%", height: 52, borderRadius: 26, background: "#fff", border: typed ? `2px solid ${K.amber2}` : "1px solid #E5E0D8", boxShadow: shadow, display: "flex", alignItems: "center", gap: 12, padding: "0 10px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: "#C2744A", border: "2px solid #fff" }} />
        <div style={{ flex: 1, fontFamily: sans, fontWeight: typed ? 700 : 500, fontSize: typed ? 22 : 15, color: typed ? K.ink : "#A9A39A" }}>
          {typed ? "RIP".slice(0, typed) : "Add a comment…"}
          {typed > 0 && Math.floor(s * 3) % 2 === 0 && <span style={{ color: K.amber, fontWeight: 400 }}> |</span>}
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: typed ? K.amber2 : "#EEEAE3", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontWeight: 800 }}>↑</div>
      </div>
      {dots && <div style={{ position: "absolute", left: 140, top: 690, background: "#fff", borderRadius: 14, padding: "6px 12px", boxShadow: shadow, fontFamily: sans, fontWeight: 800, fontSize: 18, color: "#B9B3A9", letterSpacing: 2 }}>•••</div>}
      <div style={{ position: "absolute", left: 128, top: 540, transform: `scale(${pop(s, T.s18 + 0.2, 0.4)})` }}>
        <RLogo size={86} />
      </div>
      {ring > 0 && ring < 1 && <div style={{ position: "absolute", left: 400 - 160 * ring, top: 585 - 160 * ring, width: 320 * ring, height: 320 * ring, borderRadius: "50%", border: `2px solid ${K.amber2}`, opacity: 1 - ring }} />}
      {big > 0 ? (
        <div style={{ position: "absolute", left: 240, top: 520, transform: `scale(${big})`, transformOrigin: "0 50%" }}>
          <Sel k={1}>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 120, color: K.ink, lineHeight: 1, letterSpacing: -4, padding: "0 10px" }}>RIP</div>
          </Sel>
        </div>
      ) : (
        <div style={{ position: "absolute", left: 240, top: 530, width: 300, height: 110, borderRadius: 6, border: "2px solid #E9D9BF", background: "rgba(233,217,191,.25)", opacity: bar }} />
      )}
      {notif > 0 && (
        <div style={{ position: "absolute", left: 140, top: lerp(700, 772, notif), opacity: Math.min(1, notif * 2), width: 450, background: "#fff", borderRadius: 14, boxShadow: shadow, padding: "14px 16px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <RLogo size={30} />
            <div style={{ fontFamily: sans, fontSize: 14 }}>
              <b>Ben</b>
              <div style={{ color: K.gray, fontSize: 12 }}>Here's your key</div>
            </div>
            <span style={{ marginLeft: "auto", fontFamily: sans, fontSize: 11, color: K.gray }}>now</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: "#FBEBD2", border: `2px solid ${K.amber2}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(s * 8) * 10 * acc}deg)` }}>
              <Glyph kind="key" size={22} color={K.amber} />
            </div>
            <div style={{ transform: `scale(${acc > 0 ? acc : 1})`, transformOrigin: "0 50%", background: acc > 0 ? AMBER_GRAD : "#EFEBE4", color: acc > 0 ? "#fff" : "transparent", fontFamily: sans, fontWeight: 700, fontSize: 22, borderRadius: 99, padding: "4px 22px" }}>access</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const RemakeRip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const dark = Math.min(1, DARK.reduce((a, [x, y]) => a + Math.min(ramp(s, x - 0.12, 0.2), 1 - ramp(s, y - 0.12, 0.2)), 0));
  const scenes: [number, number, React.FC<{ s: number }>][] = [
    [T.s1, T.s2, S1],
    [T.s2, T.s3, S2],
    [T.s3, T.s5, S3],
    [T.s5, T.s6, S5],
    [T.s6, T.s7, S6],
    [T.s7, T.s8, S7],
    [T.s8, T.s9, S8],
    [T.s9, T.s10, S9],
    [T.s10, T.s11, S10],
    [T.s11, T.s12, S11],
    [T.s12, T.s13, S12],
    [T.s13, T.s14, S13],
    [T.s14, T.s15, S14],
    [T.s15, T.s16, S15],
    [T.s16, T.s17, S16],
    [T.s17, T.s18, S17],
    [T.s18, T.end, S18],
  ];
  return (
    <AbsoluteFill style={{ background: K.paper }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 720, height: 1280, transform: "scale(1.5)", transformOrigin: "0 0", overflow: "hidden" }}>
        <Backdrop s={s} dark={dark} />
        {scenes.map(([a, b, C], i) => (
          <Sc key={i} s={s} a={a} b={b} last={i === scenes.length - 1}>
            <C s={s} />
          </Sc>
        ))}
        <Captions s={s} dark={dark} />
      </div>
      <Audio src={staticFile("reference/rip-audio.m4a")} />
    </AbsoluteFill>
  );
};

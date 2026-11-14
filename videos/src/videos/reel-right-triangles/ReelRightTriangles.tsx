import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, heading, hold, lerp, pop, ramp } from "../../brand";
import { cue, Timeline, VideoProps, Voice } from "../../timeline";
import { Logo } from "../../ui";
import { BG, Background, Captions, card, Chip, kick, Odometer, outC, Scene, Sfx, Sfxs, swing, W } from "../../reel";

// Fast 9:16 explainer: right triangles in ~40 s. Same motion language as promo-sat-scroll, cut harder:
// a new scene every 2-4 s, something popping about every half second, camera punches on key words,
// dark/light flips between scenes. Every pop is cued to its spoken word.
// What must be read stays in x 60..960, y 170..1470.

const CAPS: Record<string, string[]> = {
  hook: ["Right *triangles*", "in *30 seconds.*", "Go."],
  ninety: ["One angle is", "exactly *90 degrees.*"],
  hyp: ["Across from it:", "the *hypotenuse,*", "always the *longest side.*"],
  pyth: ["*a²* ~ +", "*b²* ~ =", "*c²* ~"],
  ex: ["3, 4, 5:", "9 + 16", "= *25* ~"],
  triples: ["Learn the *triples:*", "*5, 12, 13.*", "*8, 15, 17.*", "And *6, 8, 10.*"],
  s45: ["*45° ~ 45° ~ 90°:*", "x, x, *x√2* ~ ~"],
  s30: ["*30°, 60°, 90°:*", "x, *x√3* ~ ~ *2x* ~"],
  soh: ["*SOH CAH TOA.*", "*Sine:* opposite over hypotenuse.", "*Cosine:* adjacent over hypotenuse.", "*Tangent:* opposite over adjacent."],
  quiz: ["Quick test:", "legs *6* and *8.*", "*Hypotenuse?*"],
  answer: ["*10.*", "It's *3-4-5* ~ ~", "*doubled.*"],
  cta: ["Save *this,*", "and practice right triangles", "in *SAT Math Learner.*"],
};

const MINT = C.mint;
const BUTTER = C.butter;
const LAV = C.lav;

// ---------- the triangle ----------
// Right angle at C = (0,0), A = (0,h) straight up, B = (w,0) to the right, in units.
// Sides: a = CA (left leg), b = CB (bottom leg), c = AB (hypotenuse). Unit coordinates map to the screen
// with scale u, putting the focus point (fx, fy) at (cx, cy).
type Label = { text: string; k: number; bg?: string; big?: boolean; along?: boolean };
type TriProps = {
  w: number;
  h: number;
  u: number;
  cx?: number;
  cy?: number;
  fx?: number;
  fy?: number;
  dark: boolean;
  draw?: number;
  fill?: string;
  glow?: { a?: number; b?: number; c?: number };
  labels?: { a?: Label; b?: Label; c?: Label };
  right?: number;
  angles?: { A?: Label; B?: Label };
  squares?: { a?: number; b?: number; c?: number };
  areas?: { a?: Label; b?: Label; c?: Label };
};

const Tri: React.FC<TriProps> = ({ w, h, u, cx = 540, cy = 900, fx, fy, dark, draw = 1, fill, glow = {}, labels = {}, right = 0, angles = {}, squares = {}, areas = {} }) => {
  const FX = fx ?? w / 2;
  const FY = fy ?? h / 2;
  const P = (x: number, y: number): [number, number] => [cx + (x - FX) * u, cy - (y - FY) * u];
  const c = Math.hypot(w, h);
  const line = dark ? C.white : C.ink;
  const pts = (arr: [number, number][]) => arr.map((p) => P(...p).join(",")).join(" ");
  const [Cx, Cy] = P(0, 0);
  const [Ax, Ay] = P(0, h);
  const [Bx, By] = P(w, 0);
  const per = (w + h + c) * u;
  const thB = (Math.atan2(h, w) * 180) / Math.PI;

  const sq = (k: number | undefined, base: [number, number][], off: [number, number], col: string, key: string) =>
    !k ? null : (
      <polygon
        key={key}
        points={pts([base[0], base[1], [base[1][0] + off[0] * k, base[1][1] + off[1] * k], [base[0][0] + off[0] * k, base[0][1] + off[1] * k]])}
        fill={col}
        stroke={C.ink}
        strokeWidth={5}
        strokeLinejoin="round"
        opacity={Math.min(1, k * 3)}
      />
    );

  const sides: Record<"a" | "b" | "c", { p1: [number, number]; p2: [number, number]; n: [number, number] }> = {
    a: { p1: [Cx, Cy], p2: [Ax, Ay], n: [-1, 0] },
    b: { p1: [Cx, Cy], p2: [Bx, By], n: [0, 1] },
    c: { p1: [Ax, Ay], p2: [Bx, By], n: [h / c, -w / c] },
  };
  const sqOff = { a: (squares.a ?? 0) * h * u, b: (squares.b ?? 0) * w * u, c: (squares.c ?? 0) * c * u };

  const arc = (vx: number, vy: number, a1: number, a2: number, r: number) => {
    const p = (a: number) => [vx + r * Math.cos((a * Math.PI) / 180), vy + r * Math.sin((a * Math.PI) / 180)];
    const [x1, y1] = p(a1);
    const [x2, y2] = p(a2);
    return `M ${vx} ${vy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };

  const labelEl = (key: string, l: Label | undefined, x: number, y: number, rot = 0) =>
    !l || l.k <= 0 ? null : (
      <div
        key={key}
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${l.k})`,
          opacity: Math.min(1, l.k * 2),
          background: l.bg ?? (dark ? C.ink : C.white),
          color: l.bg ? C.ink : line,
          border: `4px solid ${l.bg ? C.ink : line}`,
          borderRadius: 20,
          padding: l.big ? "6px 26px" : "2px 18px",
          fontFamily: heading,
          fontWeight: 900,
          fontSize: l.big ? 64 : 50,
          whiteSpace: "nowrap",
          boxShadow: l.bg ? `0 6px 0 ${C.ink}` : undefined,
        }}
      >
        {l.text}
      </div>
    );

  return (
    <>
      <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
        {sq(squares.a, [[0, 0], [0, h]], [-h, 0], MINT, "sa")}
        {sq(squares.b, [[0, 0], [w, 0]], [0, -w], BUTTER, "sb")}
        {sq(squares.c, [[0, h], [w, 0]], [h, w], LAV, "sc")}
        {fill && <polygon points={pts([[0, 0], [w, 0], [0, h]])} fill={fill} opacity={draw} />}
        {(["a", "b", "c"] as const).map((k) => {
          const g = glow[k] ?? 0;
          if (g <= 0) return null;
          const { p1, p2 } = sides[k];
          return (
            <g key={k} opacity={g}>
              <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={C.violet} strokeWidth={40} strokeLinecap="round" opacity={0.3} />
              <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={dark ? C.lavDeep : C.violet} strokeWidth={16} strokeLinecap="round" />
            </g>
          );
        })}
        <path
          d={`M ${Cx} ${Cy} L ${Bx} ${By} L ${Ax} ${Ay} Z`}
          fill="none"
          stroke={line}
          strokeWidth={9}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={per}
          strokeDashoffset={per * (1 - draw)}
        />
        {right > 0 && (
          <rect x={Cx} y={Cy - 46 * right} width={46 * right} height={46 * right} fill={dark ? "rgba(254,231,166,.25)" : BUTTER} stroke={line} strokeWidth={5} />
        )}
        {angles.B && angles.B.k > 0 && <path d={arc(Bx, By, 180, 180 + thB * angles.B.k, 90)} fill={dark ? "rgba(201,170,251,.35)" : "rgba(124,77,219,.18)"} stroke={dark ? C.lav : C.violet} strokeWidth={5} />}
        {angles.A && angles.A.k > 0 && <path d={arc(Ax, Ay, thB, thB + (90 - thB) * angles.A.k, 80)} fill={dark ? "rgba(205,239,217,.3)" : "rgba(31,157,85,.15)"} stroke={dark ? C.mint : C.green} strokeWidth={5} />}
      </svg>
      {(["a", "b", "c"] as const).map((k) => {
        const { p1, p2, n } = sides[k];
        const mx = (p1[0] + p2[0]) / 2;
        const my = (p1[1] + p2[1]) / 2;
        const l = labels[k];
        const off = (l?.big ? 78 : 62) + sqOff[k];
        const rot = l?.along ? thB : 0;
        return labelEl("l" + k, l, mx + n[0] * off, my + n[1] * off, rot);
      })}
      {(["a", "b", "c"] as const).map((k) => {
        const { p1, p2, n } = sides[k];
        const half = sqOff[k] / 2;
        return labelEl("ar" + k, areas[k], (p1[0] + p2[0]) / 2 + n[0] * half, (p1[1] + p2[1]) / 2 + n[1] * half);
      })}
      {labelEl("aB", angles.B && { ...angles.B, k: angles.B.k > 0.99 ? 1 : 0 }, Bx + 150 * Math.cos(((180 + thB / 2) * Math.PI) / 180), By + 150 * Math.sin(((180 + thB / 2) * Math.PI) / 180))}
      {labelEl("aA", angles.A && { ...angles.A, k: angles.A.k > 0.99 ? 1 : 0 }, Ax + 140 * Math.cos((((thB + 90) / 2) * Math.PI) / 180), Ay + 140 * Math.sin((((thB + 90) / 2) * Math.PI) / 180))}
    </>
  );
};

// ---------- scenes ----------
const lab = (text: string, k: number, extra: Partial<Label> = {}): Label => ({ text, k, ...extra });
const at = (tl: Timeline, id: string, word: string, nth = 0) => cue(tl, id, word, nth) - 0.06;

// Hook: right triangles slam in one per word, then a 30 s timer
const Hook: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const words = ["Right", "triangles", "in", "thirty", "seconds"];
  const tris = [
    { x: 250, y: 620, r: -18, w: 300, h: 220, col: MINT },
    { x: 830, y: 700, r: 22, w: 260, h: 320, col: BUTTER },
    { x: 300, y: 1260, r: 160, w: 300, h: 260, col: C.rose },
    { x: 820, y: 1240, r: -150, w: 320, h: 220, col: LAV },
    { x: 540, y: 950, r: -6, w: 520, h: 390, col: C.white },
  ];
  const tTimer = at(tl, "hook", "thirty");
  const timer = pop(s, tTimer, 0.35);
  const slam = timer > 0 ? lerp(2.3, 1, ramp(s, tTimer, 0.18, Easing.in(Easing.quad))) : 0;
  const secs = 30 - Math.floor(Math.max(0, s - tTimer) * 6);
  return (
    <AbsoluteFill>
      {tris.map((t, i) => {
        const k = pop(s, i === 4 ? 0.15 : at(tl, "hook", words[i]) - 0.05, 0.35);
        if (k <= 0) return null;
        const spin = (1 - k) * 120;
        return (
          <svg key={i} width={t.w + 20} height={t.h + 20} style={{ position: "absolute", left: t.x - t.w / 2, top: t.y - t.h / 2, transform: `rotate(${t.r + spin}deg) scale(${k})`, opacity: i === 4 ? 0.9 * (1 - timer * 0.7) : 1 }}>
            <polygon points={`10,10 10,${t.h + 10} ${t.w + 10},${t.h + 10}`} fill={t.col} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
            <rect x={10} y={t.h + 10 - 44} width={44} height={44} fill="none" stroke={C.ink} strokeWidth={5} />
          </svg>
        );
      })}
      {timer > 0 && (
        <div style={{ position: "absolute", left: 540, top: 950, transform: `translate(-50%, -50%) scale(${slam}) rotate(-5deg)`, background: BUTTER, border: `6px solid ${C.ink}`, borderRadius: 40, padding: "6px 50px", boxShadow: `0 14px 0 ${C.ink}`, display: "flex", alignItems: "center", gap: 20 }}>
          <svg width={110} height={110} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round">
            <circle cx={12} cy={13} r={8} />
            <path d="M12 13V9M9 2h6" />
          </svg>
          <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 190, color: C.ink, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{Math.max(secs, 26)}s</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const Ninety: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const t0 = tl.at.ninety;
  const t90 = at(tl, "ninety", "ninety");
  return (
    <AbsoluteFill>
      <Tri w={4} h={3} u={150} cy={930} dark={false} draw={ramp(s, t0 - 0.05, 0.55, Easing.inOut(Easing.cubic))} fill="rgba(228,205,255,.55)" right={pop(s, t90, 0.35)} />
      <Chip k={pop(s, t90 + 0.05, 0.35)} x={300} y={1280} bg={BUTTER} rot={-6} size={84}>
        90°
      </Chip>
    </AbsoluteFill>
  );
};

const Hyp: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const tH = at(tl, "hyp", "hypotenuse");
  const tL = at(tl, "hyp", "longest");
  const glow = ramp(s, tH, 0.2);
  return (
    <AbsoluteFill>
      <Tri
        w={4}
        h={3}
        u={150}
        cy={930}
        dark={false}
        fill="rgba(228,205,255,.55)"
        right={1}
        glow={{ c: glow }}
        labels={{ c: lab("hypotenuse", pop(s, tH, 0.35), { bg: LAV, big: true, along: true }), a: lab("a", pop(s, tL + 0.25, 0.3)), b: lab("b", pop(s, tL + 0.35, 0.3)) }}
      />
      <Chip k={pop(s, tL, 0.35)} x={760} y={1340} bg={C.rose} rot={5} size={60}>
        ★ LONGEST
      </Chip>
    </AbsoluteFill>
  );
};

// a² + b² = c², then 3-4-5 with its areas: one scene, squares growing off the sides
const Pyth: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const t0 = tl.at.pyth;
  const zoom = ramp(s, t0 - 0.1, 0.45, Easing.inOut(Easing.cubic));
  const tA = at(tl, "pyth", "a");
  const tB = at(tl, "pyth", "b");
  const tC = at(tl, "pyth", "c");
  const g = (t: number) => ramp(s, t, 0.4, swing);
  const ex = (word: string, nth = 0) => at(tl, "ex", word, nth);
  const n3 = pop(s, ex("three"), 0.3);
  const n4 = pop(s, ex("four"), 0.3);
  const n5 = pop(s, ex("five"), 0.3);
  const has = s >= tl.at.ex - 0.1;
  const a9 = pop(s, ex("nine"), 0.35);
  const a16 = pop(s, ex("sixteen"), 0.35);
  const a25 = pop(s, ex("twenty"), 0.35);
  // the equation card under the squares: letters first, then the numbers swap in
  const eq = pop(s, tA - 0.05, 0.4);
  const termK = [tA, tB, tC].map((t) => pop(s, t, 0.3));
  const numK = [ex("nine"), ex("sixteen"), ex("twenty")].map((t) => ramp(s, t, 0.2));
  const sum = 25 * ramp(s, ex("twenty") - 0.1, 0.5, outC);
  const term = (i: number, letter: string, num: string, bg: string) => (
    <span style={{ display: "inline-block", transform: `scale(${termK[i]})`, background: bg, color: C.ink, borderRadius: 18, padding: "0 16px", border: `4px solid ${C.ink}`, minWidth: 90, textAlign: "center" }}>
      {numK[i] > 0.5 ? (i === 2 ? <Odometer n={sum} digits={2} h={92} style={{ display: "inline-flex" }} /> : num) : letter}
    </span>
  );
  return (
    <AbsoluteFill>
      <Tri
        w={4}
        h={3}
        u={lerp(150, 78, zoom)}
        cy={lerp(930, 860, zoom)}
        fy={lerp(1.5, 1.5, zoom)}
        dark
        right={1}
        squares={{ a: g(tA), b: g(tB), c: g(tC) }}
        labels={has ? { a: lab("3", n3, { bg: MINT }), b: lab("4", n4, { bg: BUTTER }), c: lab("5", n5, { bg: LAV }) } : {}}
        areas={{ a: lab("9", a9, { big: true }), b: lab("16", a16, { big: true }), c: lab("25", a25, { big: true }) }}
      />
      {eq > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1410, transform: `translate(-50%, -50%) scale(${eq})`, display: "flex", alignItems: "center", gap: 18, fontFamily: heading, fontWeight: 900, fontSize: 84, color: C.white, whiteSpace: "nowrap" }}>
          {term(0, "a²", "9", MINT)}
          <span style={{ opacity: termK[1] }}>+</span>
          {term(1, "b²", "16", BUTTER)}
          <span style={{ opacity: termK[2] }}>=</span>
          {term(2, "c²", "25", LAV)}
        </div>
      )}
    </AbsoluteFill>
  );
};

const TripleCard: React.FC<{ nums: [number, number, number]; k: number; x: number; y: number; rot: number; hot?: boolean }> = ({ nums, k, x, y, rot, hot }) => {
  if (k <= 0) return null;
  const slam = lerp(1.7, 1, Math.min(1, k));
  const [a, b] = nums;
  const s = 150 / Math.max(a, b);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 430, height: 330, transform: `translate(-50%, -50%) scale(${slam * Math.min(1, 0.6 + k * 0.4)}) rotate(${rot}deg)`, opacity: Math.min(1, k * 3), ...card, background: hot ? BUTTER : C.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, boxSizing: "border-box" }}>
      <svg width={b * s + 12} height={a * s + 12}>
        <polygon points={`6,6 6,${a * s + 6} ${b * s + 6},${a * s + 6}`} fill={LAV} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      </svg>
      <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 76, color: C.ink, letterSpacing: -1 }}>{nums.join(" · ")}</div>
    </div>
  );
};

const Triples: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const t0 = tl.at.triples;
  const k345 = ramp(s, t0, 0.22, outC);
  const k5 = ramp(s, at(tl, "triples", "five"), 0.22, outC);
  const k8 = ramp(s, at(tl, "triples", "Eight"), 0.22, outC);
  const tSix = at(tl, "triples", "six");
  const k6 = ramp(s, tSix, 0.22, outC);
  const x2 = pop(s, at(tl, "triples", "ten"), 0.35);
  const sub = pop(s, at(tl, "triples", "triples"), 0.35);
  return (
    <AbsoluteFill>
      <TripleCard nums={[3, 4, 5]} k={k345} x={300} y={650} rot={-4} />
      <TripleCard nums={[5, 12, 13]} k={k5} x={790} y={690} rot={4} />
      <TripleCard nums={[8, 15, 17]} k={k8} x={290} y={1080} rot={3} />
      <TripleCard nums={[6, 8, 10]} k={k6} x={790} y={1120} rot={-3} hot />
      <Chip k={x2} x={560} y={880} bg={C.rose} rot={-8} size={56}>
        3·4·5 × 2
      </Chip>
      <Chip k={sub * (1 - ramp(s, tSix - 0.15, 0.15))} x={540} y={1390} bg={C.white} size={40}>
        whole numbers that fit a² + b² = c²
      </Chip>
    </AbsoluteFill>
  );
};

// 45-45-90 and 30-60-90: the triangle morphs into each shape
const Special: React.FC<{ s: number; tl: Timeline; id: "s45" | "s30" }> = ({ s, tl, id }) => {
  const t0 = tl.at[id];
  const m = ramp(s, t0 - 0.1, 0.45, Easing.inOut(Easing.cubic));
  const from = id === "s45" ? [4, 3] : [3.4, 3.4];
  const to = id === "s45" ? [3.4, 3.4] : [4.16, 2.4];
  const w = lerp(from[0], to[0], m);
  const h = lerp(from[1], to[1], m);
  const u = id === "s45" ? 165 : 160;
  const w0 = id === "s45" ? ["Forty", "forty", "ninety"] : ["Thirty", "sixty", "ninety"];
  const tB = at(tl, id, w0[0]);
  const tA = id === "s45" ? at(tl, id, "forty", 1) : at(tl, id, "sixty");
  const t90 = at(tl, id, "ninety");
  const words = tl.timing[id]?.words ?? [];
  const wt = (i: number) => tl.at[id] + (words[i]?.t ?? 0) - 0.06;
  // side labels on the "x" words: s45 → tokens 5, 6, 7 (x, x, x√2); s30 → 3 (x), 4 (x√3), 7 (2x)
  const [ia, ib, ic] = id === "s45" ? [5, 6, 7] : [3, 4, 7];
  const L = id === "s45" ? ["x", "x", "x√2"] : ["x", "x√3", "2x"];
  const angB = id === "s45" ? "45°" : "30°";
  const angA = id === "s45" ? "45°" : "60°";
  return (
    <AbsoluteFill>
      <Tri
        w={w}
        h={h}
        u={u}
        cy={900}
        dark
        fill="rgba(201,170,251,.16)"
        right={pop(s, t90, 0.3)}
        angles={{ B: lab(angB, ramp(s, tB, 0.25)), A: lab(angA, ramp(s, tA, 0.25)) }}
        labels={{ a: lab(L[0], pop(s, wt(ia), 0.3), { bg: MINT }), b: lab(L[1], pop(s, wt(ib), 0.3), { bg: BUTTER }), c: lab(L[2], pop(s, wt(ic), 0.3), { bg: LAV, big: true }) }}
      />
      <Chip k={pop(s, t0 + 0.1, 0.35)} x={540} y={1400} bg={id === "s45" ? MINT : BUTTER} rot={id === "s45" ? -4 : 4} size={52}>
        {id === "s45" ? "45-45-90" : "30-60-90"}
      </Chip>
    </AbsoluteFill>
  );
};

// SOH CAH TOA: three cards; each ratio lights its two sides as they are said (θ at B)
const Soh: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const parts = [
    { key: "SOH", fn: "sin", word: "Sine", num: ["opposite", 0, "a"], den: ["hypotenuse", 0, "c"], bg: MINT },
    { key: "CAH", fn: "cos", word: "Cosine", num: ["adjacent", 0, "b"], den: ["hypotenuse", 1, "c"], bg: BUTTER },
    { key: "TOA", fn: "tan", word: "Tangent", num: ["opposite", 1, "a"], den: ["adjacent", 1, "b"], bg: LAV },
  ] as const;
  let active = -1;
  parts.forEach((p, i) => {
    if (s >= at(tl, "soh", p.word)) active = i;
  });
  const glow: { a?: number; b?: number; c?: number } = {};
  if (active >= 0) {
    const p = parts[active];
    glow[p.num[2]] = ramp(s, at(tl, "soh", p.num[0], p.num[1]), 0.15);
    const d = ramp(s, at(tl, "soh", p.den[0], p.den[1]), 0.15);
    glow[p.den[2]] = Math.max(glow[p.den[2]] ?? 0, d);
  }
  const lit = (side: "a" | "b" | "c") => (glow[side] ?? 0) > 0.5;
  return (
    <AbsoluteFill>
      <Tri
        w={4}
        h={3}
        u={125}
        cy={760}
        dark={false}
        fill="rgba(228,205,255,.4)"
        right={1}
        glow={glow}
        angles={{ B: lab("θ", 1) }}
        labels={{
          a: lab("opp", pop(s, tl.at.soh, 0.3), { bg: lit("a") ? BUTTER : undefined }),
          b: lab("adj", pop(s, tl.at.soh + 0.1, 0.3), { bg: lit("b") ? BUTTER : undefined }),
          c: lab("hyp", pop(s, tl.at.soh + 0.2, 0.3), { bg: lit("c") ? BUTTER : undefined }),
        }}
      />
      {parts.map((p, i) => {
        const k = pop(s, at(tl, "soh", p.key), 0.3);
        if (k <= 0) return null;
        const on = active === i;
        const big = ramp(s, at(tl, "soh", p.word), 0.25, swing) * (active === i ? 1 : 0);
        const numOn = on && s >= at(tl, "soh", p.num[0], p.num[1]);
        const denOn = on && s >= at(tl, "soh", p.den[0], p.den[1]);
        const short = (wd: string) => wd.slice(0, 3);
        return (
          <div
            key={p.key}
            style={{
              position: "absolute",
              left: 200 + i * 340,
              top: 1250,
              width: 300,
              height: 260,
              transform: `translate(-50%, -50%) scale(${k * (1 + 0.12 * big)}) rotate(${(i - 1) * 4 * (1 - big)}deg)`,
              ...card,
              background: on ? p.bg : C.white,
              opacity: active >= 0 && !on ? 0.55 : 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
              zIndex: on ? 2 : 1,
            }}
          >
            <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 84, color: C.ink, letterSpacing: 2, lineHeight: 1 }}>{p.key}</div>
            <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 34, color: C.ink, marginTop: 10, display: "flex", alignItems: "center", gap: 10, opacity: on ? 1 : 0.5 }}>
              {p.fn} θ =
              <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1 }}>
                <span style={{ opacity: numOn || !on ? 1 : 0.2 }}>{short(p.num[0])}</span>
                <span style={{ width: 70, height: 4, background: C.ink, margin: "2px 0" }} />
                <span style={{ opacity: denOn || !on ? 1 : 0.2 }}>{short(p.den[0])}</span>
              </span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Quick test → answer, same triangle; "?" with a countdown ring, then "10" slams in
const Quiz: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const tQ = at(tl, "quiz", "Hypotenuse");
  const tAns = tl.at.answer - 0.04;
  const answered = s >= tAns;
  const ring = interpolate(s, [tl.at.think, tAns], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const qPulse = 1 + 0.1 * Math.sin(s * 14) * (answered ? 0 : ramp(s, tQ, 0.2));
  const ans = pop(s, tAns, 0.35);
  const slam = ans > 0 ? lerp(2.4, 1, ramp(s, tAns, 0.16, Easing.in(Easing.quad))) : 0;
  const u = 120;
  // just outside the hypotenuse's midpoint (the triangle is centred on 540,880; outward normal is (0.6, -0.8))
  const hx = 540 + 0.6 * 120;
  const hy = 880 - 0.8 * 120;
  const burst = ramp(s, tAns, 0.45, outC);
  const dbl = pop(s, at(tl, "answer", "doubled"), 0.35);
  return (
    <AbsoluteFill>
      <Tri
        w={4}
        h={3}
        u={u}
        cy={880}
        dark={!answered}
        fill={answered ? "rgba(205,239,217,.7)" : "rgba(201,170,251,.16)"}
        right={1}
        glow={{ c: answered ? 1 : ramp(s, tQ, 0.2) }}
        labels={{ a: lab("6", pop(s, at(tl, "quiz", "six"), 0.3), { bg: MINT, big: true }), b: lab("8", pop(s, at(tl, "quiz", "eight"), 0.3), { bg: BUTTER, big: true }) }}
      />
      {!answered && s >= tQ && (
        <div style={{ position: "absolute", left: hx, top: hy, transform: `translate(-50%, -50%) scale(${pop(s, tQ, 0.3) * qPulse})` }}>
          <svg width={170} height={170} style={{ position: "absolute", left: -85, top: -85 }}>
            <circle cx={85} cy={85} r={74} fill={C.ink} stroke="rgba(228,205,255,.25)" strokeWidth={10} />
            <circle cx={85} cy={85} r={74} fill="none" stroke={C.butter} strokeWidth={10} strokeDasharray={465} strokeDashoffset={465 * ring} transform="rotate(-90 85 85)" strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", left: 0, top: 0, transform: "translate(-50%, -50%)", fontFamily: heading, fontWeight: 900, fontSize: 110, color: C.butter }}>?</div>
        </div>
      )}
      {answered && (
        <>
          <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 14 }, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const r1 = 110 + burst * 120;
              const r2 = r1 + 60 * (1 - burst);
              return <line key={i} x1={hx + Math.cos(a) * r1} y1={hy + Math.sin(a) * r1} x2={hx + Math.cos(a) * r2} y2={hy + Math.sin(a) * r2} stroke={i % 2 ? C.violet : "#D49B00"} strokeWidth={10} strokeLinecap="round" opacity={1 - burst} />;
            })}
          </svg>
          <div style={{ position: "absolute", left: hx, top: hy, transform: `translate(-50%, -50%) scale(${slam}) rotate(-6deg)`, background: BUTTER, border: `6px solid ${C.ink}`, borderRadius: 34, padding: "0 34px", boxShadow: `0 12px 0 ${C.ink}`, fontFamily: heading, fontWeight: 900, fontSize: 150, color: C.ink, lineHeight: 1.1 }}>10</div>
          <Chip k={dbl} x={540} y={1330} bg={C.rose} rot={4} size={60}>
            3·4·5 × 2 = 6·8·10
          </Chip>
        </>
      )}
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const t0 = tl.at.cta;
  const save = pop(s, at(tl, "cta", "Save"), 0.35);
  const app = pop(s, at(tl, "cta", "SAT"), 0.4);
  const prac = pop(s, at(tl, "cta", "practice"), 0.4);
  const bounce = 1 + 0.08 * Math.sin(Math.max(0, s - t0) * 9) * Math.max(0, 1 - (s - t0) / 1.5);
  return (
    <AbsoluteFill>
      {save > 0 && (
        <div style={{ position: "absolute", left: 540, top: 640, transform: `translate(-50%, -50%) scale(${save * bounce}) rotate(-4deg)`, ...card, background: BUTTER, padding: "26px 50px", display: "flex", alignItems: "center", gap: 26 }}>
          <svg width={100} height={100} viewBox="0 0 24 24" fill={C.ink} stroke={C.ink} strokeWidth={2} strokeLinejoin="round">
            <path d="M6 3h12v18l-6-4-6 4z" />
          </svg>
          <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 110, color: C.ink }}>Save</div>
        </div>
      )}
      {prac > 0 && (
        <div style={{ position: "absolute", left: 540, top: 960, transform: `translate(-50%, -50%) scale(${prac}) rotate(3deg)`, ...card, padding: "26px 36px", width: 820, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 28 }}>
          <svg width={150} height={115}>
            <polygon points="6,6 6,109 144,109" fill={LAV} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            <rect x={6} y={75} width={34} height={34} fill="none" stroke={C.ink} strokeWidth={5} />
          </svg>
          <div>
            <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: C.ink2 }}>PRACTICE</div>
            <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 60, color: C.ink, lineHeight: 1.05 }}>Right triangles</div>
          </div>
        </div>
      )}
      {app > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1260, transform: `translate(-50%, -50%) scale(${app})`, display: "flex", alignItems: "center", gap: 22, background: C.ink, borderRadius: 999, padding: "16px 40px 16px 18px", boxShadow: "0 20px 50px rgba(11,10,15,.3)" }}>
          <Logo size={100} />
          <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 52, color: C.white, whiteSpace: "nowrap" }}>SAT Math Learner</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const ReelRightTriangles: React.FC<VideoProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  if (!tl) return null;
  const s = frame / fps;
  const A = tl.at;
  const cut = (id: string) => A[id] - 0.08;
  const end = tl.total;

  // scene list: [from, to, dark, element]
  const scenes: [number, number, boolean, React.ReactNode][] = [
    [0, cut("ninety"), true, <Hook s={s} tl={tl} />],
    [cut("ninety"), cut("hyp"), false, <Ninety s={s} tl={tl} />],
    [cut("hyp"), cut("pyth"), false, <Hyp s={s} tl={tl} />],
    [cut("pyth"), cut("triples"), true, <Pyth s={s} tl={tl} />],
    [cut("triples"), cut("s45"), false, <Triples s={s} tl={tl} />],
    [cut("s45"), cut("s30"), true, <Special s={s} tl={tl} id="s45" />],
    [cut("s30"), cut("soh"), true, <Special s={s} tl={tl} id="s30" />],
    [cut("soh"), cut("quiz"), false, <Soh s={s} tl={tl} />],
    [cut("quiz"), cut("cta"), true, <Quiz s={s} tl={tl} />],
    [cut("cta"), end, false, <Cta s={s} tl={tl} />],
  ];
  // dark background follows the scenes; the quiz turns light the moment it is answered
  let dark = 0;
  for (const [from, to, d] of scenes) if (d) dark += hold(s, from + 0.12, to === cut("cta") ? A.answer : to + 0.12, 0.12);
  dark = Math.min(1, dark);

  // camera punches on the beats
  const beats = [
    ...scenes.map(([from]) => from + 0.02),
    ...["Right", "triangles", "thirty"].map((w) => at(tl, "hook", w)),
    at(tl, "ninety", "ninety"),
    at(tl, "hyp", "hypotenuse"),
    at(tl, "hyp", "longest"),
    ...["a", "b", "c"].map((w) => at(tl, "pyth", w)),
    at(tl, "ex", "twenty"),
    ...[["five", 0], ["Eight", 0], ["six", 0]].map(([w, n]) => at(tl, "triples", w as string, n as number)),
    ...["SOH", "CAH", "TOA", "Sine", "Cosine", "Tangent"].map((w) => at(tl, "soh", w)),
    A.answer - 0.04,
    at(tl, "cta", "Save"),
  ];
  const k = kick(s, beats, 0.045, 0.28);
  const flash = Math.max(0, 1 - Math.abs(s - (at(tl, "hook", "Go") + 0.05)) / 0.12) * 0.8 + Math.max(0, 1 - Math.abs(s - A.answer) / 0.1) * 0.6;

  const sfx: Sfx[] = [
    ...scenes.slice(1).map(([from]) => ({ t: from - 0.06, src: "whoosh", v: 0.5 })),
    { t: 0.15, src: "pop", v: 0.4 },
    ...["Right", "triangles", "in"].map((w) => ({ t: at(tl, "hook", w) - 0.05, src: "pop" })),
    { t: at(tl, "hook", "thirty"), src: "stamp", v: 0.8 },
    { t: at(tl, "hook", "seconds") - 0.05, src: "pop" },
    { t: at(tl, "ninety", "ninety"), src: "stamp", v: 0.6 },
    { t: at(tl, "hyp", "hypotenuse"), src: "pop" },
    { t: at(tl, "hyp", "longest"), src: "pop" },
    ...["a", "b", "c"].map((w) => ({ t: at(tl, "pyth", w), src: "pop" })),
    ...["three", "four", "five", "nine", "sixteen"].map((w) => ({ t: at(tl, "ex", w), src: "tick", v: 0.5 })),
    { t: at(tl, "ex", "twenty"), src: "ding", v: 0.45 },
    ...[["five", 0], ["Eight", 0], ["six", 0]].map(([w, n]) => ({ t: at(tl, "triples", w as string, n as number), src: "stamp", v: 0.45 })),
    { t: at(tl, "triples", "ten"), src: "pop" },
    ...(["s45", "s30"] as const).flatMap((id) => (tl.timing[id]?.words ?? []).filter((_, i) => [0, 2, 4, 5, 6, 7].includes(i)).map((w) => ({ t: A[id] + w.t - 0.06, src: "pop", v: 0.35 }))),
    ...["SOH", "CAH", "TOA"].map((w) => ({ t: at(tl, "soh", w), src: "stamp", v: 0.5 })),
    ...["Sine", "Cosine", "Tangent"].map((w) => ({ t: at(tl, "soh", w), src: "pop", v: 0.4 })),
    { t: at(tl, "quiz", "six"), src: "pop" },
    { t: at(tl, "quiz", "eight"), src: "pop" },
    ...[0, 0.33, 0.66].map((d) => ({ t: A.think + d, src: "tick", v: 0.6 })),
    { t: A.answer - 0.04, src: "stamp", v: 0.7 },
    { t: A.answer, src: "ding", v: 0.55 },
    { t: at(tl, "answer", "doubled"), src: "pop" },
    { t: at(tl, "cta", "Save"), src: "pop" },
    { t: at(tl, "cta", "practice"), src: "pop" },
    { t: at(tl, "cta", "SAT"), src: "pop" },
  ];

  const musicVol = (f: number) => 0.15 * Math.min(1, f / 10) * interpolate(f, [durationInFrames - 40, durationInFrames - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG }}>
      <Background s={s * 2} dark={dark} />
      <AbsoluteFill style={{ transform: `scale(${1 + k})` }}>
        {scenes.map(([from, to, , el], i) => (
          <Scene key={i} s={s} from={from} to={to} fast dir={i % 2 ? -1 : 1} last={i === scenes.length - 1}>
            {el}
          </Scene>
        ))}
      </AbsoluteFill>
      <Captions s={s} tl={tl} dark={dark} caps={CAPS} size={88} />
      {flash > 0 && <AbsoluteFill style={{ background: C.white, opacity: flash }} />}

      <Voice tl={tl} />
      <Audio src={staticFile("music/beat.wav")} volume={musicVol} playbackRate={1.12} />
      <Sfxs list={sfx} />
    </AbsoluteFill>
  );
};

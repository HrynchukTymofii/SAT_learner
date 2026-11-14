import React from "react";
import { C, heading, lerp, pop, ramp } from "../brand";
import { loudness, Timeline } from "../timeline";

// Unit-1600: the app's mascot, a tired, sarcastic robot that has graded ten million SAT tests (1600 = a perfect
// score). Face screen with LED eyes and a mouth driven by the voice's loudness, an antenna that lights up as it
// talks, a graduation cap, and arms that point at the math. Drawn in a 400 × 600 box.
//
// A video directs it with keyframes: from time t on, use this expression / pose / gaze (anything left out carries
// over from the keyframe before). Arms and gaze glide to their new values; expressions switch.

export type Expr = "neutral" | "bored" | "smug" | "wide" | "happy" | "wink";
export type Arms = "down" | "point" | "cheer" | "wave";
export type Key = { t: number; expr?: Expr; arms?: Arms; gaze?: [number, number] };

// Arm angles in degrees (0 = right, 90 = down), [image-left arm, image-right arm]
const ARMS: Record<Arms, [number, number]> = { down: [112, 68], point: [214, 66], cheer: [232, 308], wave: [112, 292] };

type State = { expr: Expr; arms: Arms; gaze: [number, number] };

const resolve = (keys: Key[], upTo: number): State => {
  const st: State = { expr: "neutral", arms: "down", gaze: [0, 0] };
  for (const k of keys.slice(0, upTo + 1)) {
    if (k.expr) st.expr = k.expr;
    if (k.arms) st.arms = k.arms;
    if (k.gaze) st.gaze = k.gaze;
  }
  return st;
};

const Eye: React.FC<{ x: number; y: number; kind: Expr; blink: number }> = ({ x, y, kind, blink }) => {
  const led = { fill: C.butter, filter: "url(#glow)" };
  if (kind === "happy") return <path d={`M${x - 24} ${y + 10} Q${x} ${y - 26} ${x + 24} ${y + 10}`} fill="none" stroke={C.butter} strokeWidth={11} strokeLinecap="round" filter="url(#glow)" />;
  if (kind === "wide") return <circle cx={x} cy={y} r={31 * Math.max(0.15, blink)} {...led} />;
  if (kind === "bored" || kind === "smug") {
    const h = 22 * Math.max(0.2, blink);
    return <rect x={x - 23} y={y + 6 - h / 2} width={46} height={h} rx={10} {...led} />;
  }
  const h = 58 * Math.max(0.1, blink);
  return <rect x={x - 19} y={y - h / 2} width={38} height={h} rx={19} {...led} />;
};

export const Unit1600: React.FC<{ s: number; tl: Timeline; keys: Key[]; enter?: number; width?: number; style?: React.CSSProperties }> = ({
  s,
  tl,
  keys,
  enter = 0.2,
  width = 360,
  style,
}) => {
  // current and previous keyframe, for gliding arms and gaze
  let i = 0;
  while (i + 1 < keys.length && keys[i + 1].t <= s) i++;
  const now = resolve(keys, i);
  const before = resolve(keys, Math.max(0, i - 1));
  const glide = i === 0 ? 1 : ramp(s, keys[i].t - 0.05, 0.3);
  const arm = (side: 0 | 1) => {
    const a = lerp(ARMS[before.arms][side], ARMS[now.arms][side], glide);
    return now.arms === "wave" && side === 1 ? a + 20 * Math.sin(s * 9) * glide : a;
  };
  const gx = lerp(before.gaze[0], now.gaze[0], glide);
  const gy = lerp(before.gaze[1], now.gaze[1], glide);

  const talk = (loudness(tl, s) + loudness(tl, s - 1 / 30)) / 2;
  const blinkPhase = (s + 0.7) % 3.4;
  const blink = blinkPhase < 0.16 ? Math.abs(blinkPhase - 0.08) / 0.08 : 1;
  const inK = pop(s, enter, 0.7);
  const bob = Math.sin(s * Math.PI * 1.6) * 6 - talk * 6;
  const tilt = (now.expr === "smug" ? -5 : 0) + Math.sin(s * 5.3) * talk * 2.5;
  const smile = now.expr === "happy" || now.expr === "wink";
  const mouthH = 8 + 46 * talk;
  const mouthW = 78 - 22 * talk;

  const drawArm = (side: 0 | 1) => {
    const [sx, sy] = side === 0 ? [92, 392] : [308, 392];
    const a = (arm(side) * Math.PI) / 180;
    const ex = sx + Math.cos(a) * 128;
    const ey = sy + Math.sin(a) * 128;
    return (
      <g>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={C.ink} strokeWidth={30} strokeLinecap="round" />
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={C.lavDeep} strokeWidth={14} strokeLinecap="round" />
        <circle cx={ex} cy={ey} r={24} fill={C.lav} stroke={C.ink} strokeWidth={8} />
      </g>
    );
  };

  return (
    <svg
      width={width}
      height={(width * 600) / 400}
      viewBox="0 0 400 600"
      style={{ position: "absolute", overflow: "visible", ...style, transform: `translateY(${(1 - inK) * 700 + bob}px)` }}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* body */}
      <rect x={168} y={334} width={64} height={30} fill={C.ink} />
      <rect x={78} y={358} width={244} height={230} rx={54} fill={C.butter} stroke={C.ink} strokeWidth={9} />
      <rect x={128} y={404} width={144} height={66} rx={18} fill={C.ink} />
      <text x={200} y={452} textAnchor="middle" style={{ fontFamily: heading, fontWeight: 900, fontSize: 42, fill: C.butter }}>
        1600
      </text>
      {drawArm(0)}
      {drawArm(1)}

      {/* head */}
      <g transform={`rotate(${tilt} 200 220)`}>
        <line x1={278} y1={92} x2={278} y2={46} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
        <circle cx={278} cy={38} r={16 + 3 * talk} fill={talk > 0.15 ? "#FFF6D6" : C.butter} stroke={C.ink} strokeWidth={7} filter={talk > 0.15 ? "url(#glow)" : undefined} />
        <rect x={18} y={180} width={30} height={76} rx={12} fill={C.butter} stroke={C.ink} strokeWidth={7} />
        <rect x={352} y={180} width={30} height={76} rx={12} fill={C.butter} stroke={C.ink} strokeWidth={7} />
        <rect x={40} y={88} width={320} height={252} rx={66} fill={C.lavDeep} stroke={C.ink} strokeWidth={9} />
        <rect x={74} y={122} width={252} height={188} rx={46} fill={C.ink} />
        <path d="M100 140 Q160 128 220 136" stroke="#fff" strokeOpacity={0.12} strokeWidth={10} strokeLinecap="round" fill="none" />

        <Eye x={152 + gx} y={198 + gy} kind={now.expr === "wink" ? "neutral" : now.expr} blink={smile ? 1 : blink} />
        <Eye x={248 + gx} y={198 + gy + (now.expr === "smug" ? -6 : 0)} kind={now.expr === "wink" ? "happy" : now.expr} blink={smile ? 1 : blink} />

        {smile && talk < 0.12 ? (
          <path d="M168 262 Q200 292 232 262" fill="none" stroke={C.butter} strokeWidth={10} strokeLinecap="round" filter="url(#glow)" />
        ) : (
          <rect
            x={200 + gx * 0.5 - mouthW / 2}
            y={272 + gy * 0.3 - mouthH / 2}
            width={mouthW}
            height={mouthH}
            rx={Math.min(mouthH / 2, 14)}
            fill={C.butter}
            filter="url(#glow)"
            transform={now.expr === "smug" ? `rotate(-9 200 272) translate(10 0)` : undefined}
          />
        )}

        {/* graduation cap, tilted */}
        <g transform="translate(132 96) rotate(-14)">
          <rect x={-52} y={-4} width={104} height={30} rx={6} fill={C.ink} />
          <polygon points="-96,0 0,-36 96,0 0,36" fill={C.ink} />
          <path d="M0 0 L-74 8 L-78 58" fill="none" stroke={C.butter} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={-78} cy={62} r={8} fill={C.butter} />
        </g>
      </g>
    </svg>
  );
};

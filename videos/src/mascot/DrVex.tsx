import React from "react";
import { C, heading, lerp, pop, ramp } from "../brand";
import { loudness, Timeline } from "../timeline";

// Dr. Vex: eccentric, spiky-haired mad-scientist SAT math coach (100% original IP).
// Wild lavender-blue hair, expressive cartoon brows, lab coat over a dark turtleneck with a glowing
// "1600" portal badge, and a laser pointer / chalk hand that points at the math.
// Driven by keyframes: { t, expr, arms, gaze } and voice loudness from timing.json.

export type VexExpr = "neutral" | "bored" | "smug" | "wide" | "happy" | "wink" | "eureka";
export type VexArms = "down" | "point" | "cheer" | "wave" | "chalk";
export type VexKey = { t: number; expr?: VexExpr; arms?: VexArms; gaze?: [number, number] };

// Arm angles in degrees (0 = right, 90 = down), [image-left arm (points at board), image-right arm]
const ARMS: Record<VexArms, [number, number]> = {
  down: [110, 70],
  point: [208, 68],
  chalk: [195, 58],
  cheer: [235, 305],
  wave: [110, 295],
};

type State = { expr: VexExpr; arms: VexArms; gaze: [number, number] };

const resolve = (keys: VexKey[], upTo: number): State => {
  const st: State = { expr: "neutral", arms: "down", gaze: [0, 0] };
  for (const k of keys.slice(0, upTo + 1)) {
    if (k.expr) st.expr = k.expr;
    if (k.arms) st.arms = k.arms;
    if (k.gaze) st.gaze = k.gaze;
  }
  return st;
};

export const DrVex: React.FC<{
  s: number;
  tl: Timeline;
  keys: VexKey[];
  enter?: number;
  width?: number;
  style?: React.CSSProperties;
}> = ({ s, tl, keys, enter = 0.2, width = 320, style }) => {
  let i = 0;
  while (i + 1 < keys.length && keys[i + 1].t <= s) i++;
  const now = resolve(keys, i);
  const before = resolve(keys, Math.max(0, i - 1));
  const glide = i === 0 ? 1 : ramp(s, keys[i].t - 0.05, 0.28);

  const arm = (side: 0 | 1) => {
    const a = lerp(ARMS[before.arms][side], ARMS[now.arms][side], glide);
    return now.arms === "wave" && side === 1 ? a + 18 * Math.sin(s * 9) * glide : a;
  };
  const gx = lerp(before.gaze[0], now.gaze[0], glide);
  const gy = lerp(before.gaze[1], now.gaze[1], glide);

  const talk = (loudness(tl, s) + loudness(tl, s - 1 / 30)) / 2;
  const blinkPhase = (s + 1.1) % 3.6;
  const blink = blinkPhase < 0.14 ? Math.abs(blinkPhase - 0.07) / 0.07 : 1;
  const inK = pop(s, enter, 0.65);
  const bob = Math.sin(s * Math.PI * 1.7) * 5 - talk * 5;
  const tilt = (now.expr === "smug" ? -4 : now.expr === "eureka" ? 3 : 0) + Math.sin(s * 5.1) * talk * 2.2;

  const drawArm = (side: 0 | 1) => {
    const [sx, sy] = side === 0 ? [108, 396] : [292, 396];
    const a = (arm(side) * Math.PI) / 180;
    const ex = sx + Math.cos(a) * 118;
    const ey = sy + Math.sin(a) * 118;
    const hasPointer = side === 0 && (now.arms === "point" || now.arms === "chalk");
    const px2 = ex + Math.cos(a) * 44;
    const py2 = ey + Math.sin(a) * 44;
    return (
      <g>
        {/* Lab coat sleeve */}
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={C.ink} strokeWidth={34} strokeLinecap="round" />
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={C.white} strokeWidth={20} strokeLinecap="round" />
        {hasPointer && (
          <>
            <line x1={ex} y1={ey} x2={px2} y2={py2} stroke={C.ink} strokeWidth={11} strokeLinecap="round" />
            <circle cx={px2} cy={py2} r={9} fill={C.butter} stroke={C.ink} strokeWidth={4} />
          </>
        )}
        {/* Hand */}
        <circle cx={ex} cy={ey} r={20} fill="#FFE3C8" stroke={C.ink} strokeWidth={7} />
      </g>
    );
  };

  // Eyebrow tilts based on expression
  const browL = now.expr === "smug" ? -14 : now.expr === "bored" ? 4 : now.expr === "wide" || now.expr === "eureka" ? -10 : -4;
  const browR = now.expr === "smug" ? 12 : now.expr === "bored" ? -4 : now.expr === "wide" || now.expr === "eureka" ? 10 : 4;
  const browLift = now.expr === "wide" || now.expr === "eureka" ? -10 : now.expr === "bored" ? 6 : 0;

  const mouthOpen = talk > 0.08;
  const mH = 10 + 40 * talk;
  const mW = 54 - 10 * talk;

  return (
    <svg
      width={width}
      height={(width * 600) / 400}
      viewBox="0 0 400 600"
      style={{ position: "absolute", overflow: "visible", pointerEvents: "none", ...style, transform: `translateY(${(1 - inK) * 600 + bob}px)` }}
    >
      {/* Arms behind torso */}
      {drawArm(0)}
      {drawArm(1)}

      {/* Lab coat & torso */}
      <g>
        {/* Dark turtleneck */}
        <path d="M112 355 Q200 340 288 355 L306 580 L94 580 Z" fill={C.ink} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        {/* Left & right white lab coat panels */}
        <path d="M92 360 L158 355 L170 580 L82 580 Q76 470 92 360 Z" fill={C.white} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        <path d="M308 360 L242 355 L230 580 L318 580 Q324 470 308 360 Z" fill={C.white} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        {/* Coat lapels */}
        <polygon points="158,355 118,415 164,445" fill={C.lav} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <polygon points="242,355 282,415 236,445" fill={C.lav} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        {/* Glowing gold "1600" badge on turtleneck */}
        <rect x={162} y={422} width={76} height={42} rx={12} fill={C.butter} stroke={C.ink} strokeWidth={6} />
        <text x={200} y={451} textAnchor="middle" style={{ fontFamily: heading, fontWeight: 900, fontSize: 24, fill: C.ink }}>
          1600
        </text>
        {/* Pocket protector with pens */}
        <rect x={252} y={462} width={40} height={46} rx={8} fill={C.mint} stroke={C.ink} strokeWidth={5} />
        <line x1={263} y1={460} x2={263} y2={446} stroke={C.red} strokeWidth={6} strokeLinecap="round" />
        <line x1={276} y1={460} x2={278} y2={443} stroke={C.violet} strokeWidth={6} strokeLinecap="round" />
      </g>

      {/* Neck */}
      <rect x={174} y={316} width={52} height={48} rx={18} fill="#FFE3C8" stroke={C.ink} strokeWidth={8} />

      {/* Head & Spiky Mad-Scientist Hair */}
      <g transform={`rotate(${tilt} 200 215)`}>
        {/* Wild spiky lavender-blue hair behind head */}
        <path
          d="M72 210 L26 172 L82 142 L44 86 L118 102 L124 32 L178 82 L212 18 L244 82 L306 38 L294 106 L362 96 L322 152 L374 188 L324 220 Z"
          fill={C.lavDeep}
          stroke={C.ink}
          strokeWidth={9}
          strokeLinejoin="round"
        />
        {/* Inner hair highlight */}
        <path
          d="M105 150 L85 110 L138 118 L146 66 L186 102 L212 52 L238 102 L282 72 L274 122 L322 118 L298 158 Z"
          fill={C.lav}
        />

        {/* Ears */}
        <circle cx={88} cy={226} r={22} fill="#FFE3C8" stroke={C.ink} strokeWidth={8} />
        <circle cx={312} cy={226} r={22} fill="#FFE3C8" stroke={C.ink} strokeWidth={8} />

        {/* Face shape */}
        <rect x={92} y={108} width={216} height={224} rx={86} fill="#FFE3C8" stroke={C.ink} strokeWidth={9} />

        {/* Forehead hair bang */}
        <path d="M126 112 Q168 154 206 118 Q232 148 272 114" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />

        {/* Glasses / Goggles frames */}
        <circle cx={156} cy={204} r={38} fill={C.white} stroke={C.ink} strokeWidth={8} />
        <circle cx={244} cy={204} r={38} fill={C.white} stroke={C.ink} strokeWidth={8} />
        <line x1={194} y1={204} x2={206} y2={204} stroke={C.ink} strokeWidth={8} />

        {/* Pupils / Eyes */}
        {now.expr === "wink" ? (
          <>
            <ellipse cx={156 + gx * 0.8} cy={204 + gy * 0.8} rx={12} ry={14 * Math.max(0.1, blink)} fill={C.ink} />
            <circle cx={152 + gx * 0.8} cy={199 + gy * 0.8} r={4} fill={C.white} />
            <path d="M224 206 Q244 186 264 206" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse
              cx={156 + gx * 0.8}
              cy={204 + gy * 0.8}
              rx={now.expr === "wide" || now.expr === "eureka" ? 16 : 12}
              ry={(now.expr === "wide" || now.expr === "eureka" ? 18 : 14) * Math.max(0.1, blink)}
              fill={C.ink}
            />
            <circle cx={152 + gx * 0.8} cy={198 + gy * 0.8} r={4.5} fill={C.white} />
            <ellipse
              cx={244 + gx * 0.8}
              cy={204 + gy * 0.8}
              rx={now.expr === "wide" || now.expr === "eureka" ? 16 : 12}
              ry={(now.expr === "wide" || now.expr === "eureka" ? 18 : 14) * Math.max(0.1, blink)}
              fill={C.ink}
            />
            <circle cx={240 + gx * 0.8} cy={198 + gy * 0.8} r={4.5} fill={C.white} />
          </>
        )}

        {/* Half-lids for bored / smug */}
        {(now.expr === "bored" || now.expr === "smug") && (
          <>
            <path d="M120 192 Q156 196 192 192" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d="M208 192 Q244 196 280 192" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
          </>
        )}

        {/* Expressive Unibrow / Brows (classic mad-scientist energy) */}
        <g transform={`translate(0 ${browLift})`}>
          <line
            x1={118}
            y1={154}
            x2={192}
            y2={156}
            stroke={C.lavDeep}
            strokeWidth={14}
            strokeLinecap="round"
            transform={`rotate(${browL} 156 155)`}
          />
          <line
            x1={118}
            y1={154}
            x2={192}
            y2={156}
            stroke={C.ink}
            strokeWidth={6}
            strokeLinecap="round"
            transform={`rotate(${browL} 156 155)`}
          />
          <line
            x1={208}
            y1={156}
            x2={282}
            y2={154}
            stroke={C.lavDeep}
            strokeWidth={14}
            strokeLinecap="round"
            transform={`rotate(${browR} 244 155)`}
          />
          <line
            x1={208}
            y1={156}
            x2={282}
            y2={154}
            stroke={C.ink}
            strokeWidth={6}
            strokeLinecap="round"
            transform={`rotate(${browR} 244 155)`}
          />
        </g>

        {/* Nose */}
        <path d="M198 214 L188 242 L206 244" fill="none" stroke={C.ink} strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Mouth */}
        {mouthOpen ? (
          <g>
            <rect
              x={200 - mW / 2}
              y={278 - mH / 2}
              width={mW}
              height={mH}
              rx={Math.min(mH / 2, 18)}
              fill={C.ink}
              stroke={C.ink}
              strokeWidth={5}
            />
            {/* Tongue */}
            {mH > 20 && <ellipse cx={200} cy={278 + mH * 0.22} rx={mW * 0.34} ry={mH * 0.22} fill={C.red} />}
          </g>
        ) : now.expr === "happy" || now.expr === "eureka" || now.expr === "wink" ? (
          <path d="M168 270 Q200 300 232 270" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        ) : now.expr === "smug" ? (
          <path d="M168 278 Q204 282 234 264" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        ) : (
          <line x1={174} y1={278} x2={226} y2={278} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        )}

        {/* Eureka lightbulb spark above head */}
        {now.expr === "eureka" && (
          <g transform={`translate(200 4) scale(${0.85 + 0.15 * Math.sin(s * 12)})`}>
            <circle cx={0} cy={-16} r={18} fill={C.butter} stroke={C.ink} strokeWidth={6} />
            <line x1={-32} y1={-16} x2={-46} y2={-16} stroke={C.butter} strokeWidth={6} strokeLinecap="round" />
            <line x1={32} y1={-16} x2={46} y2={-16} stroke={C.butter} strokeWidth={6} strokeLinecap="round" />
            <line x1={0} y1={-46} x2={0} y2={-60} stroke={C.butter} strokeWidth={6} strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  );
};

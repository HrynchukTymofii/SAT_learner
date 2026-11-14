import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { body, C, graphPaper, heading, hold, lerp, pop, ramp } from "../../brand";
import { cue, Timeline, VideoProps, Voice } from "../../timeline";
import { Brand, Logo, Tex } from "../../ui";

// 16:9 one-minute lesson matching the exact voice (en-US-AvaNeural) and visual style of `lesson-scatterplots`:
// Clean 2-column layout (CARD_W = 1060, PANEL_W = 650), numbered checklist with Check icons, smooth animations,
// plus both the numeric example (52° + 71° = 123°) and the algebraic SAT example (2x+12 + x+19 = 121 => x = 30).

const CARD_L = 80;
const CARD_T = 150;
const CARD_W = 1060;
const CARD_H = 850;
const PANEL_L = 1190;
const PANEL_W = 650;

const card: React.CSSProperties = {
  background: C.white,
  border: `4px solid ${C.ink}`,
  borderRadius: 36,
  boxShadow: `0 10px 0 ${C.ink}`,
};

// Triangle vertices inside CARD_W x CARD_H
const VA = { x: 160, y: 600 };
const VB = { x: 440, y: 180 };
const VC = { x: 710, y: 600 };
const VD = { x: 970, y: 600 };

const wedgePath = (cx: number, cy: number, r: number, a1Deg: number, a2Deg: number) => {
  const a1 = (a1Deg * Math.PI) / 180;
  const a2 = (a2Deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const x2 = cx + r * Math.cos(a2);
  const y2 = cy + r * Math.sin(a2);
  const large = Math.abs(a2Deg - a1Deg) > 180 ? 1 : 0;
  const sweep = a2Deg > a1Deg ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2} Z`;
};

const Pill: React.FC<{ x: number; y: number; k: number; bg: string; children: React.ReactNode; size?: number }> = ({
  x,
  y,
  k,
  bg,
  children,
  size = 30,
}) =>
  k <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${k})`,
        opacity: Math.min(1, k * 2),
        background: bg,
        border: `3px solid ${C.ink}`,
        borderRadius: 16,
        padding: "6px 16px",
        fontFamily: heading,
        fontWeight: 800,
        fontSize: size,
        color: C.ink,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );

const Check: React.FC<{ on: boolean }> = ({ on }) => (
  <div
    style={{
      width: 46,
      height: 46,
      borderRadius: 23,
      flex: "none",
      background: on ? C.mint : "rgba(228,205,255,.16)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {on && (
      <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    )}
  </div>
);

const Diagram: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const { at } = tl;
  const triIn = ramp(s, at.interior - 0.2, 0.6);
  const wedgesIn = pop(s, cue(tl, "interior", "three") - 0.15, 0.45);
  const parallelProof = hold(s, cue(tl, "line", "parallel") - 0.15, at.exterior - 0.1, 0.35);
  const extLine = ramp(s, cue(tl, "exterior", "extend") - 0.15, 0.55);
  const extWedge = pop(s, cue(tl, "exterior", "exterior") - 0.15, 0.45);
  const remoteGlow = ramp(s, cue(tl, "shortcut", "equals") - 0.15, 0.45);

  const numMode = hold(s, at.numeric - 0.15, at.example - 0.15, 0.3);
  const algMode = ramp(s, at.example - 0.2, 0.4);

  const eqStep1 = pop(s, cue(tl, "solve", "set") - 0.1);
  const eqStep2 = pop(s, cue(tl, "solve", "thirty-one") - 0.15);
  const eqAns = pop(s, cue(tl, "solve", "thirty", 0) - 0.1);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={CARD_W} height={CARD_H} style={{ position: "absolute", inset: 0 }}>
        {/* Top parallel proof line during `line` */}
        {parallelProof > 0 && (
          <g opacity={parallelProof}>
            <line x1={160} y1={VB.y} x2={720} y2={VB.y} stroke={C.violet} strokeWidth={5} strokeDasharray="14 12" />
            <path d={wedgePath(VB.x, VB.y, 74, 123.69, 180)} fill={C.butter} stroke={C.ink} strokeWidth={4} />
            <path d={wedgePath(VB.x, VB.y, 74, 0, 57.26)} fill={C.lavDeep} stroke={C.ink} strokeWidth={4} />
          </g>
        )}

        {/* Interior Angle Wedges */}
        {wedgesIn > 0 && (
          <g opacity={Math.min(1, wedgesIn)}>
            <path d={wedgePath(VA.x, VA.y, 80 * wedgesIn, -56.31, 0)} fill={C.butter} stroke={C.ink} strokeWidth={4} />
            <path d={wedgePath(VB.x, VB.y, 76 * wedgesIn, 57.26, 123.69)} fill={C.mint} stroke={C.ink} strokeWidth={4} />
            <path
              d={wedgePath(VC.x, VC.y, 76 * wedgesIn, -180, -122.74)}
              fill={C.lavDeep}
              stroke={C.ink}
              strokeWidth={4}
              opacity={1 - 0.65 * remoteGlow}
            />
          </g>
        )}

        {/* Exterior Angle d wedge at C */}
        {extWedge > 0 && (
          <path d={wedgePath(VC.x, VC.y, 88 * extWedge, -122.74, 0)} fill={C.rose} stroke={C.red} strokeWidth={5} />
        )}

        {/* Extended base CD */}
        {extLine > 0 && (
          <line
            x1={VC.x}
            y1={VC.y}
            x2={lerp(VC.x, VD.x, extLine)}
            y2={VD.y}
            stroke={C.red}
            strokeWidth={7}
            strokeLinecap="round"
          />
        )}

        {/* Triangle ABC */}
        <g opacity={triIn}>
          <polygon
            points={`${VA.x},${VA.y} ${VB.x},${VB.y} ${VC.x},${VC.y}`}
            fill="none"
            stroke={C.ink}
            strokeWidth={7}
            strokeLinejoin="round"
          />
          {[
            { p: VA, name: "A", dx: -36, dy: 12 },
            { p: VB, name: "B", dx: 0, dy: -28 },
            { p: VC, name: "C", dx: -10, dy: 46 },
          ].map(({ p, name, dx, dy }) => (
            <g key={name}>
              <circle cx={p.x} cy={p.y} r={9} fill={C.ink} />
              <text x={p.x + dx} y={p.y + dy} textAnchor="middle" style={{ fontFamily: heading, fontWeight: 900, fontSize: 34, fill: C.ink }}>
                {name}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Angle Pills */}
      <Pill x={VA.x + 118} y={VA.y - 36} k={wedgesIn} bg={C.butter} size={algMode > 0.5 ? 28 : 32}>
        {algMode > 0.5 ? <Tex tex="2x + 12^\circ" /> : numMode > 0.5 ? <Tex tex="52^\circ" /> : <Tex tex="A" />}
      </Pill>
      <Pill x={VB.x} y={VB.y + 114} k={wedgesIn} bg={C.mint} size={algMode > 0.5 ? 28 : 32}>
        {algMode > 0.5 ? <Tex tex="x + 19^\circ" /> : numMode > 0.5 ? <Tex tex="71^\circ" /> : <Tex tex="B" />}
      </Pill>
      <Pill x={VC.x - 95} y={VC.y - 34} k={wedgesIn * (1 - remoteGlow)} bg={C.lavDeep} size={32}>
        <Tex tex="C" />
      </Pill>
      <Pill x={VC.x + 120} y={VC.y - 56} k={extWedge} bg={C.rose} size={32}>
        {algMode > 0.5 ? <Tex tex="121^\circ" /> : numMode > 0.5 ? <Tex tex="52^\circ + 71^\circ = 123^\circ" /> : <Tex tex="d = A + B" />}
      </Pill>

      {/* Bottom Summary / Worked Example Card */}
      {algMode < 0.5 ? (
        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 42,
            background: remoteGlow > 0.5 ? C.butter : C.lav,
            border: `4px solid ${C.ink}`,
            borderRadius: 26,
            padding: "20px 34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 32, color: C.ink }}>
            {numMode > 0.5 ? "Example 1 · Numeric:" : remoteGlow > 0.5 ? "Exterior Angle Rule:" : "Interior Angle Sum:"}
          </div>
          <div>
            <Tex
              tex={
                numMode > 0.5
                  ? "d = 52^\\circ + 71^\\circ = \\mathbf{123^\\circ}"
                  : remoteGlow > 0.5
                  ? "d = A + B"
                  : "A + B + C = 180^\\circ"
              }
              style={{ fontSize: 42, color: C.ink }}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            ...card,
            position: "absolute",
            left: 48,
            right: 48,
            bottom: 34,
            padding: "22px 34px",
            background: C.white,
            opacity: algMode,
            transform: `translateY(${(1 - algMode) * 30}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ background: C.ink, color: C.butter, fontFamily: heading, fontWeight: 800, fontSize: 22, padding: "6px 16px", borderRadius: 999 }}>
              EXAMPLE 2 · ALGEBRAIC SAT PROBLEM
            </div>
            <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 24, color: C.ink2 }}>Remote Interior Sum = Exterior</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {eqStep1 > 0 && (
                <div style={{ opacity: eqStep1 }}>
                  <Tex tex="(2x + 12) + (x + 19) = 121" style={{ fontSize: 38, color: C.ink }} />
                </div>
              )}
              {eqStep2 > 0 && (
                <div style={{ opacity: eqStep2 }}>
                  <Tex tex="3x + 31 = 121 \;\Rightarrow\; 3x = 90" style={{ fontSize: 38, color: C.violet }} />
                </div>
              )}
            </div>

            {eqAns > 0 && (
              <div
                style={{
                  background: C.mint,
                  border: `4px solid ${C.ink}`,
                  borderRadius: 22,
                  padding: "10px 28px",
                  transform: `scale(${eqAns})`,
                }}
              >
                <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 18, color: C.ink2 }}>SOLUTION</div>
                <Tex tex="x = 30" style={{ fontSize: 50, color: C.ink }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const STEPS = [
  { id: "interior", name: "Interior angles", value: "3 inside corners (A, B, C)" },
  { id: "line", name: "Sum of angles", value: "A + B + C = 180°" },
  { id: "exterior", name: "Exterior angle", value: "extend 1 side past vertex" },
  { id: "shortcut", name: "Remote sum rule", value: "d = A + B (skip C!)" },
];

const Panel: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const { at } = tl;
  const page1 = hold(s, at.interior, at.numeric - 0.15);
  const page2 = ramp(s, at.numeric - 0.25, 0.4);
  const h = (k: number): React.CSSProperties => ({
    position: "absolute",
    inset: "44px 46px",
    opacity: k,
    transform: `translateY(${(1 - k) * 30}px)`,
  });
  const title: React.CSSProperties = {
    fontFamily: heading,
    fontWeight: 800,
    fontSize: 30,
    color: C.lav,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  };
  const big: React.CSSProperties = {
    fontFamily: heading,
    fontWeight: 800,
    fontSize: 50,
    lineHeight: 1.12,
    color: C.white,
  };
  const line = (t: number): React.CSSProperties => {
    const k = pop(s, t - 0.15, 0.45);
    return { opacity: Math.min(1, k * 2), transform: `translateX(${(1 - k) * 30}px)` };
  };

  return (
    <div style={{ position: "absolute", inset: 0, color: C.white }}>
      {page1 > 0 && (
        <div style={h(page1)}>
          <div style={title}>Triangle angle rules</div>
          <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 22 }}>
            {STEPS.map((it, i) => {
              const start = at[it.id];
              const active = s >= start - 0.2 && s < (STEPS[i + 1] ? at[STEPS[i + 1].id] - 0.2 : at.numeric);
              const done = s >= start + 0.8;
              const k = ramp(s, start - 0.3, 0.4);
              return (
                <div
                  key={it.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 22,
                    padding: "22px 26px",
                    borderRadius: 26,
                    background: active ? C.butter : "rgba(228,205,255,.08)",
                    color: active ? C.ink : C.white,
                    opacity: 0.35 + 0.65 * k,
                    transform: `scale(${active ? 1.03 : 1})`,
                  }}
                >
                  <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 40, width: 34, opacity: 0.6 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 40 }}>{it.name}</div>
                    <div style={{ fontFamily: body, fontWeight: 700, fontSize: 28, marginTop: 2, opacity: done ? 0.85 : 0, color: active ? C.ink2 : C.lav }}>
                      {it.value}
                    </div>
                  </div>
                  <Check on={done} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {page2 > 0 && (
        <div style={h(page2)}>
          <div style={title}>Exterior angle shortcut</div>
          <div style={{ ...big, fontSize: 44, marginTop: 22, ...line(at.numeric) }}>
            Outside angle = sum of the two far inside angles
          </div>
          <div style={{ marginTop: 28, ...line(cue(tl, "numeric", "add")) }}>
            <Tex tex="d = A + B" style={{ fontSize: 80, color: C.butter }} />
          </div>

          <div
            style={{
              marginTop: 26,
              background: "rgba(228,205,255,.1)",
              borderRadius: 24,
              padding: "20px 26px",
              ...line(cue(tl, "numeric", "one")),
            }}
          >
            <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 26, color: C.lav }}>EXAMPLE 1 · NUMERIC</div>
            <div style={{ marginTop: 6 }}>
              <Tex tex="52^\circ + 71^\circ = 123^\circ" style={{ fontSize: 44, color: C.white }} />
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              background: C.mint,
              color: C.ink,
              borderRadius: 26,
              padding: "20px 28px",
              ...line(cue(tl, "solve", "thirty", 0)),
            }}
          >
            <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 24, color: C.ink2 }}>EXAMPLE 2 · ALGEBRA</div>
            <div style={{ marginTop: 6 }}>
              <Tex tex="3x + 31 = 121 \;\Rightarrow\; x = 30" style={{ fontSize: 40 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Intro: React.FC<{ s: number; k: number }> = ({ s, k }) => (
  <AbsoluteFill style={{ background: C.ink, ...graphPaper("rgba(228,205,255,.07)", 60), opacity: 1 - k, alignItems: "center", justifyContent: "center" }}>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 18 }, (_, i) => {
        const x = 140 + i * 96 + random(`tx${i}`) * 40;
        const y = 880 - i * 38 - random(`ty${i}`) * 160;
        const p = pop(s, 0.08 + i * 0.05, 0.4);
        const r = 22 * p;
        return (
          <polygon
            key={i}
            points={`${x},${y - r} ${x - r},${y + r} ${x + r},${y + r}`}
            fill={i % 3 ? C.lavDeep : C.butter}
            opacity={0.28}
          />
        );
      })}
    </svg>
    <div style={{ textAlign: "center", transform: `scale(${0.9 + 0.1 * pop(s, 0.1, 0.6)})` }}>
      <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 40, color: C.lav, letterSpacing: "0.1em" }}>SAT MATH · 1-MINUTE LESSON</div>
      <div style={{ marginTop: 18, fontFamily: heading, fontWeight: 900, fontSize: 136, color: C.white, lineHeight: 1 }}>
        Triangle <span style={{ color: C.butter }}>angle rules</span>
      </div>
    </div>
  </AbsoluteFill>
);

const Outro: React.FC<{ c: number; s: number }> = ({ c, s }) => (
  <AbsoluteFill style={{ background: C.ink, ...graphPaper("rgba(228,205,255,.07)", 60), opacity: c, alignItems: "center", justifyContent: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 60, transform: `translateY(${(1 - c) * 40}px)` }}>
      <div style={{ transform: `scale(${0.7 + 0.3 * pop(s, 0.1, 0.6)})` }}>
        <Logo size={260} />
      </div>
      <div>
        <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 44, color: C.lav }}>Practice on real SAT problems</div>
        <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 120, color: C.white, lineHeight: 1.05 }}>SAT Math Learner</div>
        <div
          style={{
            marginTop: 30,
            display: "inline-block",
            background: C.butter,
            color: C.ink,
            fontFamily: heading,
            fontWeight: 900,
            fontSize: 46,
            padding: "20px 54px",
            borderRadius: 999,
            transform: `scale(${1 + 0.03 * Math.sin(s * Math.PI * 2)})`,
          }}
        >
          Free on iOS & Android
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

export const LessonTrianglesAva: React.FC<VideoProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!tl) return null;
  const s = frame / fps;
  const { at } = tl;
  const intro = ramp(s, at.interior - 0.45, 0.5);
  const cardIn = pop(s, at.interior - 0.35, 0.6);
  const outro = ramp(s, at.outro - 0.4, 0.5);

  return (
    <AbsoluteFill style={{ background: C.lav, ...graphPaper("rgba(11,10,15,.06)", 60), fontFamily: body, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: CARD_L, top: 44, opacity: cardIn }}>
        <Brand size={68} sub="Lesson · Triangles & Angles" />
      </div>
      <div
        style={{
          ...card,
          position: "absolute",
          left: CARD_L,
          top: CARD_T,
          width: CARD_W,
          height: CARD_H,
          boxSizing: "border-box",
          overflow: "hidden",
          opacity: Math.min(1, cardIn * 1.5),
          transform: cardIn < 1 ? `translateY(${(1 - cardIn) * 80}px)` : undefined,
        }}
      >
        <div style={{ position: "absolute", left: -4, top: -4, right: 0, bottom: 0 }}>
          <Diagram s={s} tl={tl} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: PANEL_L,
          top: CARD_T,
          width: PANEL_W,
          height: CARD_H,
          background: C.ink,
          borderRadius: 36,
          overflow: "hidden",
          opacity: Math.min(1, cardIn * 1.5),
          transform: cardIn < 1 ? `translateY(${(1 - cardIn) * 80}px)` : undefined,
        }}
      >
        <Panel s={s} tl={tl} />
      </div>
      {intro < 1 && <Intro s={s} k={intro} />}
      {outro > 0 && <Outro c={outro} s={s - at.outro} />}
      <Voice tl={tl} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { body, C, graphPaper, heading, hold, lerp, pop, ramp } from "../../brand";
import { DrVex, VexKey } from "../../mascot/DrVex";
import { cue, Timeline, VideoProps, Voice } from "../../timeline";
import { Brand, Logo, Tex } from "../../ui";

// 16:9 Sub-lesson 2 (Geometry): Triangles — Interior Sum (180°), Exterior Angle Theorem (d = A + B),
// plus both the numeric SAT check (52° + 71° = 123°) and an algebraic SAT worked example (2x+12 + x+19 = 121 => x = 30).

const CARD_L = 70;
const CARD_T = 140;
const CARD_W = 1040;
const CARD_H = 860;
const PANEL_L = 1150;
const PANEL_W = 700;

const card: React.CSSProperties = {
  background: C.white,
  border: `4px solid ${C.ink}`,
  borderRadius: 36,
  boxShadow: `0 10px 0 ${C.ink}`,
};

// Triangle vertices inside CARD_W x CARD_H
// A (bottom-left), B (top), C (bottom-right), D (extended right)
const VA = { x: 150, y: 610 };
const VB = { x: 430, y: 190 };
const VC = { x: 700, y: 610 };
const VD = { x: 960, y: 610 };

// Helper for SVG wedge path (angles in degrees, 0 = right, clockwise in SVG y-down)
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

// Exact SVG angles at vertices:
// At A (150,610): to B (430,190) is atan2(-420, 280) = -56.31 deg; to C (700,610) is 0 deg.
// At C (700,610): to A (150,610) is -180 deg; to B (430,190) is atan2(-420, -270) = -122.74 deg; to D is 0 deg.
// At B (430,190): to C (700,610) is 57.26 deg; to A (150,610) is 123.69 deg.

const TriangleStage: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const { at } = tl;
  const triIn = ramp(s, at.interior - 0.2, 0.5);
  const wedgesIn = pop(s, cue(tl, "interior", "three") - 0.15);
  const parallelProof = hold(s, at.line - 0.1, at.exterior - 0.1, 0.35);
  const extLine = ramp(s, cue(tl, "exterior", "extend") - 0.15, 0.5);
  const extWedge = pop(s, cue(tl, "exterior", "exterior") - 0.15);
  const remoteGlow = ramp(s, cue(tl, "shortcut", "equals") - 0.15, 0.4);

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
            <line x1={160} y1={VB.y} x2={700} y2={VB.y} stroke={C.violet} strokeWidth={5} strokeDasharray="14 10" />
            {/* Alternate interior angle wedges at B snapping into a 180 straight line */}
            <path d={wedgePath(VB.x, VB.y, 72, 123.69, 180)} fill={C.butter} stroke={C.ink} strokeWidth={4} />
            <path d={wedgePath(VB.x, VB.y, 72, 0, 57.26)} fill={C.lav} stroke={C.ink} strokeWidth={4} />
          </g>
        )}

        {/* Angle wedges inside triangle */}
        {wedgesIn > 0 && (
          <g opacity={Math.min(1, wedgesIn)}>
            {/* Angle A (butter) */}
            <path d={wedgePath(VA.x, VA.y, 78 * wedgesIn, -56.31, 0)} fill={C.butter} stroke={C.ink} strokeWidth={4} />
            {/* Angle B (mint) */}
            <path d={wedgePath(VB.x, VB.y, 74 * wedgesIn, 57.26, 123.69)} fill={C.mint} stroke={C.ink} strokeWidth={4} />
            {/* Angle C (lav, dims once shortcut shows we don't need C!) */}
            <path
              d={wedgePath(VC.x, VC.y, 74 * wedgesIn, -180, -122.74)}
              fill={C.lav}
              stroke={C.ink}
              strokeWidth={4}
              opacity={1 - 0.65 * remoteGlow}
            />
          </g>
        )}

        {/* Exterior Angle d wedge at C */}
        {extWedge > 0 && (
          <path d={wedgePath(VC.x, VC.y, 86 * extWedge, -122.74, 0)} fill={C.rose} stroke={C.red} strokeWidth={5} />
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

        {/* Main Triangle ABC */}
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

      {/* Dynamic Labels on Angles A, B, C, and Exterior d */}
      <Pill x={VA.x + 115} y={VA.y - 36} k={wedgesIn} bg={C.butter} size={algMode > 0.5 ? 26 : 30}>
        {algMode > 0.5 ? <Tex tex="2x + 12^\circ" /> : numMode > 0.5 ? <Tex tex="52^\circ" /> : <Tex tex="A" />}
      </Pill>
      <Pill x={VB.x} y={VB.y + 112} k={wedgesIn} bg={C.mint} size={algMode > 0.5 ? 26 : 30}>
        {algMode > 0.5 ? <Tex tex="x + 19^\circ" /> : numMode > 0.5 ? <Tex tex="71^\circ" /> : <Tex tex="B" />}
      </Pill>
      <Pill x={VC.x - 95} y={VC.y - 34} k={wedgesIn * (1 - remoteGlow)} bg={C.lav}>
        <Tex tex="C" />
      </Pill>
      <Pill x={VC.x + 115} y={VC.y - 54} k={extWedge} bg={C.rose} size={32}>
        {algMode > 0.5 ? <Tex tex="121^\circ" /> : numMode > 0.5 ? <Tex tex="52^\circ + 71^\circ = 123^\circ" /> : <Tex tex="d = A + B" />}
      </Pill>

      {/* Bottom Formula / Worked Example Banner inside Card */}
      {algMode < 0.5 ? (
        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 38,
            background: remoteGlow > 0.5 ? C.butter : C.lav,
            border: `4px solid ${C.ink}`,
            borderRadius: 26,
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 32, color: C.ink }}>
            {numMode > 0.5 ? "Instant Numeric Check:" : remoteGlow > 0.5 ? "Exterior Angle Shortcut:" : "Interior Angle Sum:"}
          </div>
          <div>
            <Tex
              tex={
                numMode > 0.5
                  ? "d = 52^\\circ + 71^\\circ = \\mathbf{123^\\circ}"
                  : remoteGlow > 0.5
                  ? "d = A + B \\quad (\\text{skip } C!)"
                  : "A + B + C = 180^\\circ"
              }
              style={{ fontSize: 40, color: C.ink }}
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
            bottom: 30,
            padding: "20px 32px",
            background: C.white,
            opacity: algMode,
            transform: `translateY(${(1 - algMode) * 30}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ background: C.ink, color: C.butter, fontFamily: heading, fontWeight: 800, fontSize: 22, padding: "6px 16px", borderRadius: 999 }}>
              WORKED SAT EXAMPLE · SOLVE FOR X
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
                  background: C.ink,
                  border: `4px solid ${C.butter}`,
                  borderRadius: 22,
                  padding: "10px 28px",
                  transform: `rotate(-3deg) scale(${eqAns})`,
                }}
              >
                <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 18, color: C.lav }}>ANSWER</div>
                <Tex tex="x = 30" style={{ fontSize: 52, color: C.butter }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const RightPanel: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const { at } = tl;
  const page1 = hold(s, 0, at.numeric - 0.15);
  const page2 = ramp(s, at.numeric - 0.2, 0.4);
  const h = (k: number): React.CSSProperties => ({
    position: "absolute",
    inset: "40px 42px",
    opacity: k,
    transform: `translateY(${(1 - k) * 28}px)`,
  });
  const title: React.CSSProperties = {
    fontFamily: heading,
    fontWeight: 800,
    fontSize: 28,
    color: C.lav,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  };

  return (
    <div style={{ position: "absolute", inset: 0, color: C.white }}>
      {page1 > 0 && (
        <div style={h(page1)}>
          <div style={title}>2 Core Triangle Rules</div>
          <div style={{ marginTop: 24, background: "rgba(228,205,255,.1)", borderRadius: 24, padding: "22px 26px" }}>
            <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 28, color: C.butter }}>1. Interior Angle Sum</div>
            <div style={{ marginTop: 10 }}>
              <Tex tex="A + B + C = 180^\circ" style={{ fontSize: 48, color: C.white }} />
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              background: s >= at.shortcut - 0.2 ? C.butter : "rgba(228,205,255,.1)",
              color: s >= at.shortcut - 0.2 ? C.ink : C.white,
              borderRadius: 24,
              padding: "22px 26px",
              transform: `scale(${s >= at.shortcut - 0.2 ? 1.02 : 1})`,
            }}
          >
            <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 28 }}>2. Exterior Angle Theorem</div>
            <div style={{ marginTop: 10 }}>
              <Tex tex="d = A + B" style={{ fontSize: 54 }} />
            </div>
            <div style={{ fontFamily: body, fontWeight: 700, fontSize: 26, marginTop: 8, opacity: 0.9 }}>
              Outside angle = sum of the 2 far inside angles!
            </div>
          </div>
        </div>
      )}

      {page2 > 0 && (
        <div style={h(page2)}>
          <div style={title}>Why Students Lose Time</div>
          <div style={{ marginTop: 20, background: "rgba(224,68,106,.18)", border: `2px solid ${C.red}`, borderRadius: 22, padding: "18px 24px" }}>
            <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 26, color: C.rose }}>SLOW WAY (2 STEPS)</div>
            <div style={{ fontFamily: body, fontWeight: 600, fontSize: 26, marginTop: 6 }}>
              <Tex tex="C = 180^\circ - 52^\circ - 71^\circ = 57^\circ" />
              <br />
              <Tex tex="d = 180^\circ - 57^\circ = 123^\circ" />
            </div>
          </div>

          <div style={{ marginTop: 20, background: C.mint, color: C.ink, borderRadius: 22, padding: "20px 24px", width: 420 }}>
            <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 26, color: C.green }}>DR. VEX SHORTCUT (1 STEP)</div>
            <div style={{ marginTop: 8 }}>
              <Tex tex="d = 52^\circ + 71^\circ = 123^\circ" style={{ fontSize: 38 }} />
            </div>
            <div style={{ fontFamily: body, fontWeight: 700, fontSize: 24, marginTop: 6, color: C.ink2 }}>
              Works even when angles have <Tex tex="x" />!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IntroCard: React.FC<{ s: number; k: number }> = ({ s, k }) => (
  <AbsoluteFill style={{ background: C.ink, ...graphPaper("rgba(228,205,255,.07)", 60), opacity: 1 - k, alignItems: "center", justifyContent: "center" }}>
    <div style={{ textAlign: "center", transform: `scale(${0.9 + 0.1 * pop(s, 0.08, 0.5)})` }}>
      <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 38, color: C.lav, letterSpacing: "0.1em" }}>SAT MATH · GEOMETRY SUB-LESSON</div>
      <div style={{ marginTop: 18, fontFamily: heading, fontWeight: 900, fontSize: 118, color: C.white, lineHeight: 1.05 }}>
        Triangles & <span style={{ color: C.butter }}>Exterior Angles</span>
      </div>
      <div style={{ marginTop: 18, fontFamily: body, fontWeight: 700, fontSize: 40, color: C.mint }}>
        The 180° Line Proof · Remote Interior Shortcut · SAT Examples
      </div>
    </div>
  </AbsoluteFill>
);

const OutroCard: React.FC<{ c: number; s: number }> = ({ c, s }) => (
  <AbsoluteFill style={{ background: C.ink, ...graphPaper("rgba(228,205,255,.07)", 60), opacity: c, alignItems: "center", justifyContent: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 60, transform: `translateY(${(1 - c) * 40}px)` }}>
      <div style={{ transform: `scale(${0.7 + 0.3 * pop(s, 0.1, 0.6)})` }}>
        <Logo size={240} />
      </div>
      <div>
        <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 42, color: C.lav }}>Up next: Instant Check & Geometry Practice</div>
        <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 110, color: C.white, lineHeight: 1.05 }}>SAT Math Learner</div>
        <div
          style={{
            marginTop: 28,
            display: "inline-block",
            background: C.butter,
            color: C.ink,
            fontFamily: heading,
            fontWeight: 900,
            fontSize: 44,
            padding: "18px 48px",
            borderRadius: 999,
          }}
        >
          Continue Sub-Lesson →
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

export const LessonTriangles: React.FC<VideoProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!tl) return null;
  const s = frame / fps;
  const { at } = tl;

  const intro = ramp(s, at.interior - 0.45, 0.5);
  const cardIn = pop(s, at.interior - 0.35, 0.6);
  const outro = ramp(s, at.outro - 0.35, 0.5);

  const vexKeys: VexKey[] = [
    { t: 0, expr: "smug", arms: "wave", gaze: [0, 0] },
    { t: at.interior, expr: "neutral", arms: "point", gaze: [-10, -2] },
    { t: at.line, expr: "happy", arms: "chalk", gaze: [-10, -6] },
    { t: at.exterior, expr: "wide", arms: "point", gaze: [-8, 2] },
    { t: cue(tl, "shortcut", "boom"), expr: "eureka", arms: "cheer", gaze: [0, 0] },
    { t: at.numeric, expr: "smug", arms: "point", gaze: [-10, 0] },
    { t: at.example, expr: "neutral", arms: "chalk", gaze: [-10, 4] },
    { t: cue(tl, "solve", "thirty", 0), expr: "eureka", arms: "cheer", gaze: [0, 0] },
    { t: at.outro - 0.3, expr: "wink", arms: "wave", gaze: [0, 0] },
  ];

  return (
    <AbsoluteFill style={{ background: C.lav, ...graphPaper("rgba(11,10,15,.06)", 60), fontFamily: body, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: CARD_L, top: 40, opacity: cardIn }}>
        <Brand size={66} sub="Geometry · Triangles & Exterior Angles" />
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
        <TriangleStage s={s} tl={tl} />
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
        <RightPanel s={s} tl={tl} />
      </div>

      <DrVex s={s} tl={tl} keys={vexKeys} width={275} style={{ left: 1590, top: 660 }} />

      {intro < 1 && <IntroCard s={s} k={intro} />}
      {outro > 0 && <OutroCard c={outro} s={s - at.outro} />}
      <Voice tl={tl} />
    </AbsoluteFill>
  );
};

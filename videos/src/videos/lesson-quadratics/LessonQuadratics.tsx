import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { body, C, graphPaper, heading, hold, lerp, pop, ramp } from "../../brand";
import { DrVex, VexKey } from "../../mascot/DrVex";
import { cue, Timeline, VideoProps, Voice } from "../../timeline";
import { Brand, Logo, Tex } from "../../ui";

// 16:9 Sub-lesson 3 (Functions & Graphs): Quadratic Functions — Vertex Form Shifts, Discriminant (2, 1, 0 roots),
// and a Worked SAT Example solving for c when y = x^2 - 6x + c touches the x-axis at 1 point (c = 9).

const CARD_L = 70;
const CARD_T = 140;
const CARD_W = 1040;
const CARD_H = 860;
const PANEL_L = 1150;
const PANEL_W = 700;

// Coordinate plane: x in [-2, 8], y in [-5, 7]
const PL = 100;
const PR = 50;
const PT = 50;
const PB = 105;
const px = (x: number) => PL + ((x + 2) / 10) * (CARD_W - PL - PR);
const py = (y: number) => PT + (1 - (y + 5) / 12) * (CARD_H - PT - PB);

const card: React.CSSProperties = {
  background: C.white,
  border: `4px solid ${C.ink}`,
  borderRadius: 36,
  boxShadow: `0 10px 0 ${C.ink}`,
};

const Pill: React.FC<{ x: number; y: number; k: number; bg: string; children: React.ReactNode; size?: number }> = ({
  x,
  y,
  k,
  bg,
  children,
  size = 28,
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

const QuadraticsStage: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const { at } = tl;

  // Vertex (h, k) trajectory:
  // - starts at (0, 0) during `vertex`
  // - shifts to (3, -4) during `shifts` and `discriminant` (2 real roots at x=1 and x=5)
  // - lifts to (3, 0) during `one_root` (1 real root at x=3)
  // - lifts to (3, 2.5) during `no_roots` (0 real roots)
  // - snaps back to (3, 0) during `example` & `solve` (since x^2 - 6x + 9 = (x - 3)^2 touches at (3, 0)!)
  const shiftRight = ramp(s, cue(tl, "shifts", "three", 0) - 0.2, 0.55);
  const shiftDown = ramp(s, cue(tl, "shifts", "four") - 0.2, 0.55);
  const toOneRoot = ramp(s, at.one_root - 0.1, 0.55);
  const toNoRoots = ramp(s, at.no_roots - 0.1, 0.55);
  const backToOne = ramp(s, at.example - 0.2, 0.55);

  const h = 3 * shiftRight;
  const kBase = -4 * shiftDown;
  const k = lerp(lerp(lerp(kBase, 0, toOneRoot), 2.5, toNoRoots), 0, backToOne);

  // Build SVG path for y = (x - h)^2 + k clipped to y <= 6.8
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x = h - 3.3 + (i / 80) * 6.6;
    const y = (x - h) * (x - h) + k;
    if (y <= 6.8 && x >= -1.8 && x <= 7.8) {
      pts.push(`${pts.length === 0 ? "M" : "L"} ${px(x).toFixed(1)} ${py(y).toFixed(1)}`);
    }
  }
  const parabolaPath = pts.join(" ");

  const twoRootsK = hold(s, cue(tl, "discriminant", "twice") - 0.2, at.one_root - 0.15, 0.25);
  const oneRootK = hold(s, cue(tl, "one_root", "one") - 0.2, at.no_roots - 0.15, 0.25) + ramp(s, cue(tl, "solve", "nine") - 0.2, 0.4);
  const noRootsK = hold(s, at.no_roots, at.example - 0.2, 0.25);
  const exCard = ramp(s, at.example - 0.2, 0.45);
  const step1K = pop(s, cue(tl, "solve", "zero", 0) - 0.15);
  const step2K = pop(s, cue(tl, "solve", "thirty-six", 0) - 0.15);
  const ansK = pop(s, cue(tl, "solve", "nine") - 0.1);

  const label: React.CSSProperties = { fontFamily: body, fontWeight: 700, fontSize: 22, fill: C.ink2 };
  const gridC = "rgba(124,77,219,.15)";

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={CARD_W} height={CARD_H} style={{ position: "absolute", inset: 0 }}>
        {/* Grid lines */}
        {[-2, 0, 2, 4, 6, 8].map((x) => (
          <g key={`x${x}`}>
            <line x1={px(x)} x2={px(x)} y1={py(-5)} y2={py(7)} stroke={gridC} strokeWidth={2} />
            {x !== 0 && (
              <text x={px(x)} y={py(0) + 32} textAnchor="middle" style={label}>
                {x}
              </text>
            )}
          </g>
        ))}
        {[-4, -2, 0, 2, 4, 6].map((y) => (
          <g key={`y${y}`}>
            <line x1={px(-2)} x2={px(8)} y1={py(y)} y2={py(y)} stroke={gridC} strokeWidth={2} />
            {y !== 0 && (
              <text x={px(0) - 14} y={py(y) + 8} textAnchor="end" style={label}>
                {y}
              </text>
            )}
          </g>
        ))}

        {/* Axes */}
        <line x1={px(-2)} x2={px(8)} y1={py(0)} y2={py(0)} stroke={C.ink} strokeWidth={4} />
        <line x1={px(0)} x2={px(0)} y1={py(-5)} y2={py(7)} stroke={C.ink} strokeWidth={4} />

        {/* Axis of symmetry x = h */}
        {shiftRight > 0.1 && (
          <line
            x1={px(h)}
            x2={px(h)}
            y1={py(-4.8)}
            y2={py(6.5)}
            stroke={C.violet}
            strokeWidth={4}
            strokeDasharray="12 10"
            opacity={0.65}
          />
        )}

        {/* Shift arrows from (0,0) to (3, -4) */}
        {shiftRight > 0 && toOneRoot < 0.1 && (
          <g opacity={1 - toOneRoot}>
            <line x1={px(0)} y1={py(0)} x2={px(h)} y2={py(0)} stroke={C.green} strokeWidth={6} strokeDasharray="8 6" />
            {shiftDown > 0 && <line x1={px(3)} y1={py(0)} x2={px(3)} y2={py(k)} stroke={C.red} strokeWidth={6} strokeDasharray="8 6" />}
          </g>
        )}

        {/* Parabola curve */}
        <path d={parabolaPath} fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />

        {/* 2 Real Roots highlights at (1, 0) and (5, 0) */}
        {twoRootsK > 0 && (
          <g opacity={twoRootsK}>
            {[1, 5].map((rx) => (
              <g key={rx}>
                <circle cx={px(rx)} cy={py(0)} r={24} fill="none" stroke={C.green} strokeWidth={5} />
                <circle cx={px(rx)} cy={py(0)} r={13} fill={C.mint} stroke={C.ink} strokeWidth={4} />
              </g>
            ))}
          </g>
        )}

        {/* 1 Real Root highlight at (3, 0) */}
        {oneRootK > 0 && (
          <g opacity={Math.min(1, oneRootK)}>
            <circle cx={px(3)} cy={py(0)} r={30} fill="none" stroke={C.butter} strokeWidth={6} />
          </g>
        )}

        {/* Vertex dot */}
        <circle cx={px(h)} cy={py(k)} r={14} fill={C.butter} stroke={C.ink} strokeWidth={5} />
      </svg>

      {/* Dynamic Pills on the Graph */}
      <Pill x={px(h)} y={py(k) + 48} k={pop(s, at.vertex) * (1 - exCard)} bg={C.butter} size={28}>
        Vertex ({h.toFixed(0)}, {k.toFixed(0)})
      </Pill>

      <Pill x={px(1.5)} y={py(0) - 36} k={shiftRight * (1 - ramp(s, at.discriminant, 0.3))} bg={C.mint} size={26}>
        x − 3 → Right +3
      </Pill>
      <Pill x={px(3) + 110} y={py(-2)} k={shiftDown * (1 - ramp(s, at.discriminant, 0.3))} bg={C.rose} size={26}>
        − 4 → Down 4
      </Pill>

      <Pill x={px(5) + 120} y={py(0) - 44} k={twoRootsK} bg={C.mint} size={30}>
        D &gt; 0 · 2 Real Roots
      </Pill>
      <Pill x={px(3) + 165} y={py(0) - 48} k={Math.min(1, oneRootK) * (1 - exCard)} bg={C.butter} size={30}>
        D = 0 · 1 Real Root (Tangent!)
      </Pill>
      <Pill x={px(3) + 160} y={py(1.2)} k={noRootsK} bg={C.rose} size={30}>
        D &lt; 0 · 0 Real Roots
      </Pill>

      {/* Top Equation Badge */}
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 32,
          background: C.white,
          border: `3px solid ${C.ink}`,
          borderRadius: 20,
          padding: "10px 24px",
          boxShadow: `0 6px 0 ${C.ink}`,
        }}
      >
        <Tex
          tex={
            exCard > 0.5
              ? ansK > 0
                ? "y = x^2 - 6x + 9 = (x - 3)^2"
                : "y = x^2 - 6x + c"
              : toNoRoots > 0.5
              ? "y = (x - 3)^2 + 2.5"
              : toOneRoot > 0.5
              ? "y = (x - 3)^2"
              : shiftRight > 0.5
              ? "y = (x - 3)^2 - 4"
              : "y = x^2"
          }
          style={{ fontSize: 38, color: C.ink }}
        />
      </div>

      {/* Worked SAT Problem Overlay at Bottom of Card */}
      {exCard > 0 && (
        <div
          style={{
            ...card,
            position: "absolute",
            left: 44,
            right: 44,
            bottom: 28,
            padding: "20px 30px",
            background: C.white,
            opacity: exCard,
            transform: `translateY(${(1 - exCard) * 35}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ background: C.ink, color: C.butter, fontFamily: heading, fontWeight: 800, fontSize: 22, padding: "6px 16px", borderRadius: 999 }}>
              WORKED SAT EXAMPLE · 1 X-INTERCEPT
            </div>
            <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 24, color: C.ink2 }}>
              Touches x-axis once <Tex tex="\Rightarrow D = 0" />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {step1K > 0 && (
                <div style={{ opacity: step1K }}>
                  <Tex tex="D = b^2 - 4ac = (-6)^2 - 4(1)(c) = 0" style={{ fontSize: 34, color: C.ink }} />
                </div>
              )}
              {step2K > 0 && (
                <div style={{ opacity: step2K }}>
                  <Tex tex="36 - 4c = 0 \;\Rightarrow\; 4c = 36" style={{ fontSize: 36, color: C.violet }} />
                </div>
              )}
            </div>

            {ansK > 0 && (
              <div
                style={{
                  background: C.ink,
                  border: `4px solid ${C.butter}`,
                  borderRadius: 22,
                  padding: "10px 28px",
                  transform: `rotate(-3deg) scale(${ansK})`,
                }}
              >
                <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 18, color: C.lav }}>ANSWER</div>
                <Tex tex="c = 9" style={{ fontSize: 52, color: C.butter }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DISC_CASES = [
  { id: "discriminant", tex: "D > 0", desc: "2 Real Roots (crosses twice)", bg: C.mint },
  { id: "one_root", tex: "D = 0", desc: "1 Real Root (vertex on x-axis)", bg: C.butter },
  { id: "no_roots", tex: "D < 0", desc: "0 Real Roots (misses x-axis)", bg: C.rose },
];

const RightPanel: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const { at } = tl;
  const page1 = hold(s, 0, at.discriminant - 0.15);
  const page2 = ramp(s, at.discriminant - 0.2, 0.4);
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
          <div style={title}>Vertex Form Cheat Sheet</div>
          <div style={{ marginTop: 20 }}>
            <Tex tex="y = a(x - h)^2 + k" style={{ fontSize: 58, color: C.butter }} />
          </div>
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ background: "rgba(228,205,255,.1)", borderRadius: 22, padding: "18px 24px" }}>
              <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 28, color: C.mint }}>Horizontal Shift (h) · Opposite Sign!</div>
              <div style={{ fontFamily: body, fontWeight: 600, fontSize: 26, marginTop: 6 }}>
                <Tex tex="(x - 3)^2" /> shifts <strong>Right 3</strong> · <Tex tex="(x + 3)^2" /> shifts <strong>Left 3</strong>
              </div>
            </div>
            <div style={{ background: "rgba(228,205,255,.1)", borderRadius: 22, padding: "18px 24px" }}>
              <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 28, color: C.butter }}>Vertical Shift (k) · Same Sign!</div>
              <div style={{ fontFamily: body, fontWeight: 600, fontSize: 26, marginTop: 6 }}>
                <Tex tex="- 4" /> moves <strong>Down 4</strong> · Vertex is at <Tex tex="(h, k)" />
              </div>
            </div>
          </div>
        </div>
      )}

      {page2 > 0 && (
        <div style={h(page2)}>
          <div style={title}>The Discriminant</div>
          <div style={{ marginTop: 12 }}>
            <Tex tex="D = b^2 - 4ac" style={{ fontSize: 52, color: C.butter }} />
          </div>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14, width: 440 }}>
            {DISC_CASES.map((d, idx) => {
              const t0 = at[d.id];
              const active =
                (s >= t0 - 0.2 && s < (DISC_CASES[idx + 1] ? at[DISC_CASES[idx + 1].id] - 0.2 : at.example)) ||
                (d.id === "one_root" && s >= at.example);
              return (
                <div
                  key={d.id}
                  style={{
                    padding: "16px 22px",
                    borderRadius: 22,
                    background: active ? d.bg : "rgba(228,205,255,.09)",
                    color: active ? C.ink : C.white,
                    transform: `scale(${active ? 1.03 : 1})`,
                  }}
                >
                  <Tex tex={d.tex} style={{ fontSize: 34 }} />
                  <div style={{ fontFamily: body, fontWeight: 700, fontSize: 24, marginTop: 4 }}>{d.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const IntroCard: React.FC<{ s: number; k: number }> = ({ s, k }) => (
  <AbsoluteFill style={{ background: C.ink, ...graphPaper("rgba(228,205,255,.07)", 60), opacity: 1 - k, alignItems: "center", justifyContent: "center" }}>
    <div style={{ textAlign: "center", transform: `scale(${0.9 + 0.1 * pop(s, 0.08, 0.5)})` }}>
      <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 38, color: C.lav, letterSpacing: "0.1em" }}>SAT MATH · FUNCTIONS SUB-LESSON</div>
      <div style={{ marginTop: 18, fontFamily: heading, fontWeight: 900, fontSize: 118, color: C.white, lineHeight: 1.05 }}>
        Quadratics & <span style={{ color: C.butter }}>Parabolas</span>
      </div>
      <div style={{ marginTop: 18, fontFamily: body, fontWeight: 700, fontSize: 40, color: C.mint }}>
        Vertex Shifts · The Discriminant · 1-Point Tangent Trap
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
        <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 42, color: C.lav }}>Up next: Instant Check & Functions Quiz</div>
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

export const LessonQuadratics: React.FC<VideoProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!tl) return null;
  const s = frame / fps;
  const { at } = tl;

  const intro = ramp(s, at.vertex - 0.45, 0.5);
  const cardIn = pop(s, at.vertex - 0.35, 0.6);
  const outro = ramp(s, at.outro - 0.35, 0.5);

  const vexKeys: VexKey[] = [
    { t: 0, expr: "smug", arms: "wave", gaze: [0, 0] },
    { t: at.vertex, expr: "neutral", arms: "point", gaze: [-10, -2] },
    { t: at.shifts, expr: "wide", arms: "chalk", gaze: [-10, 2] },
    { t: at.discriminant, expr: "happy", arms: "point", gaze: [-8, 0] },
    { t: at.one_root, expr: "eureka", arms: "point", gaze: [-10, 0] },
    { t: at.no_roots, expr: "smug", arms: "down", gaze: [-8, -4] },
    { t: at.example, expr: "neutral", arms: "point", gaze: [-10, 4] },
    { t: cue(tl, "solve", "nine"), expr: "eureka", arms: "cheer", gaze: [0, 0] },
    { t: at.outro - 0.3, expr: "wink", arms: "wave", gaze: [0, 0] },
  ];

  return (
    <AbsoluteFill style={{ background: C.lav, ...graphPaper("rgba(11,10,15,.06)", 60), fontFamily: body, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: CARD_L, top: 40, opacity: cardIn }}>
        <Brand size={66} sub="Functions · Quadratics & Discriminant" />
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
        <QuadraticsStage s={s} tl={tl} />
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

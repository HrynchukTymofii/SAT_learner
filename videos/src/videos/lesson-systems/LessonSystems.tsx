import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { body, C, graphPaper, heading, hold, lerp, pop, ramp } from "../../brand";
import { DrVex, VexKey } from "../../mascot/DrVex";
import { cue, Timeline, VideoProps, Voice } from "../../timeline";
import { Brand, Logo, Tex } from "../../ui";

// 16:9 Sub-lesson 1 (Algebra): Systems of Linear Equations — Number of Solutions, Elimination & SAT Constant Trap.
// Includes Dr. Vex mascot + a worked SAT example scene.

const CARD_L = 70;
const CARD_T = 140;
const CARD_W = 1040;
const CARD_H = 860;
const PANEL_L = 1150;
const PANEL_W = 700;

// Coordinate plane inside left card: x in [0, 8], y in [0, 8]
const PL = 110;
const PR = 50;
const PT = 55;
const PB = 110;
const px = (x: number) => PL + (x / 8) * (CARD_W - PL - PR);
const py = (y: number) => PT + (1 - y / 8) * (CARD_H - PT - PB);

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

const SystemsStage: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const { at } = tl;
  const exMode = ramp(s, at.example - 0.25, 0.45);

  // Line 1 is fixed: x + y = 8 -> y = 8 - x (from (0,8) to (8,0))
  // Line 2 morphs:
  // - In "one" & "elim": 2x - y = 4 -> y = 2x - 4 (from (2,0) to (6,8)), intersects at (4,4)
  // - In "none": parallel to Line 1 -> x + y = 5 -> y = 5 - x (from (0,5) to (5,0))
  // - In "infinite": identical to Line 1 -> 2x + 2y = 16 -> y = 8 - x (from (0,8) to (8,0))
  const toParallel = ramp(s, at.none - 0.1, 0.55) * (1 - ramp(s, at.infinite - 0.1, 0.55));
  const toSame = ramp(s, at.infinite - 0.1, 0.55) * (1 - ramp(s, at.elim - 0.2, 0.55));

  // Endpoints of Line 2 in math coords:
  // Base (intersecting): (2, 0) -> (6, 8)
  // Parallel: (0, 5) -> (5, 0)
  // Same: (0, 8) -> (8, 0)
  const x2A = lerp(lerp(2, 0, toParallel), 0, toSame);
  const y2A = lerp(lerp(0, 5, toParallel), 8, toSame);
  const x2B = lerp(lerp(6, 5, toParallel), 8, toSame);
  const y2B = lerp(lerp(8, 0, toParallel), 0, toSame);

  const line1Draw = ramp(s, cue(tl, "one", "graph") - 0.2, 0.7);
  const line2Draw = ramp(s, cue(tl, "one", "cross") - 0.2, 0.7);
  const hitPop = pop(s, cue(tl, "one", "collide") - 0.15) * (1 - ramp(s, at.none - 0.2, 0.3)) + pop(s, cue(tl, "solve", "four", 1) - 0.1);

  // Elimination card overlay inside the graph during `elim` and `solve`
  const elimCard = hold(s, at.elim - 0.1, at.example - 0.2, 0.35);
  const cancelK = pop(s, cue(tl, "elim", "vaporize") - 0.15);
  const sumK = pop(s, cue(tl, "solve", "twelve") - 0.2);
  const xValK = pop(s, cue(tl, "solve", "four", 0) - 0.15);
  const yValK = pop(s, cue(tl, "solve", "four", 1) - 0.15);

  const label: React.CSSProperties = { fontFamily: body, fontWeight: 700, fontSize: 24, fill: C.ink2 };
  const gridC = "rgba(124,77,219,.16)";

  // Example scene animations
  const multK = pop(s, cue(tl, "match", "three") - 0.15);
  const scaledK = pop(s, cue(tl, "match", "twelve") - 0.2);
  const boxK = ramp(s, cue(tl, "answer", "nine") - 0.3, 0.4);
  const ansStamp = pop(s, cue(tl, "answer", "nine") - 0.05);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* ACT 1 & 2: Dynamic Graph + Elimination Overlay */}
      {exMode < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - exMode }}>
          <svg width={CARD_W} height={CARD_H} style={{ position: "absolute", inset: 0 }}>
            {[0, 2, 4, 6, 8].map((v) => (
              <g key={v}>
                <line x1={px(v)} x2={px(v)} y1={py(0)} y2={py(8)} stroke={gridC} strokeWidth={2} />
                <text x={px(v)} y={py(0) + 38} textAnchor="middle" style={label}>
                  {v}
                </text>
                <line x1={px(0)} x2={px(8)} y1={py(v)} y2={py(v)} stroke={gridC} strokeWidth={2} />
                <text x={px(0) - 16} y={py(v) + 8} textAnchor="end" style={label}>
                  {v}
                </text>
              </g>
            ))}
            <line x1={px(0)} x2={px(8)} y1={py(0)} y2={py(0)} stroke={C.ink} strokeWidth={4} />
            <line x1={px(0)} x2={px(0)} y1={py(0)} y2={py(8)} stroke={C.ink} strokeWidth={4} />

            {/* Line 1: x + y = 8 */}
            <line
              x1={px(0)}
              y1={py(8)}
              x2={px(8 * line1Draw)}
              y2={py(8 - 8 * line1Draw)}
              stroke={C.ink}
              strokeWidth={8}
              strokeLinecap="round"
            />

            {/* Line 2: morphs between intersecting, parallel, and overlapping */}
            <line
              x1={px(x2A)}
              y1={py(y2A)}
              x2={px(lerp(x2A, x2B, line2Draw))}
              y2={py(lerp(y2A, y2B, line2Draw))}
              stroke={toSame > 0.5 ? C.green : toParallel > 0.5 ? C.red : C.violet}
              strokeWidth={toSame > 0.5 ? 10 : 8}
              strokeDasharray={toSame > 0.5 ? "18 14" : undefined}
              strokeLinecap="round"
            />

            {/* Parallel distance arrows */}
            {toParallel > 0.6 && (
              <g opacity={toParallel}>
                {[1.5, 3.2].map((t, idx) => (
                  <line
                    key={idx}
                    x1={px(t)}
                    y1={py(5 - t)}
                    x2={px(t + 1.5)}
                    y2={py(8 - (t + 1.5))}
                    stroke={C.red}
                    strokeWidth={4}
                    strokeDasharray="8 6"
                  />
                ))}
              </g>
            )}

            {/* Intersection point (4, 4) */}
            {hitPop > 0 && (
              <>
                <circle cx={px(4)} cy={py(4)} r={28 * hitPop} fill="none" stroke={C.butter} strokeWidth={6} opacity={0.7} />
                <circle cx={px(4)} cy={py(4)} r={15 * Math.min(1, hitPop)} fill={C.butter} stroke={C.ink} strokeWidth={5} />
              </>
            )}
          </svg>

          <Pill x={px(1.6)} y={py(6.8)} k={line1Draw} bg={C.white}>
            <Tex tex="x + y = 8" />
          </Pill>
          <Pill x={px(5.3)} y={py(6.2)} k={line2Draw * (1 - toParallel) * (1 - toSame)} bg={C.lav}>
            <Tex tex="2x - y = 4" />
          </Pill>
          <Pill x={px(4) + 115} y={py(4)} k={hitPop} bg={C.butter} size={32}>
            (4, 4) · 1 solution
          </Pill>
          <Pill x={px(2.4)} y={py(2.2)} k={toParallel} bg={C.rose} size={32}>
            <Tex tex="x + y = 5" /> · Parallel (0 solutions)
          </Pill>
          <Pill x={px(4.5)} y={py(4.6)} k={toSame} bg={C.mint} size={32}>
            <Tex tex="2x + 2y = 16" /> · Same line (∞ solutions)
          </Pill>

          {/* Elimination Method Floating Card */}
          {elimCard > 0 && (
            <div
              style={{
                ...card,
                position: "absolute",
                left: 64,
                bottom: 54,
                width: CARD_W - 128,
                padding: "24px 36px",
                background: C.white,
                opacity: elimCard,
                transform: `translateY(${(1 - elimCard) * 40}px)`,
              }}
            >
              <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 24, color: C.violet, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Elimination: Stack & Add
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <div style={{ fontSize: 44, lineHeight: 1.35, color: C.ink, position: "relative" }}>
                  <div>
                    <Tex tex="\phantom{+}x + y = 8" />
                  </div>
                  <div style={{ borderBottom: `4px solid ${C.ink}`, paddingBottom: 6 }}>
                    <Tex tex="+ (2x - y = 4)" />
                  </div>
                  {/* Cancel slash over +y and -y */}
                  {cancelK > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 118,
                        top: 6,
                        width: 64,
                        height: 108,
                        border: `4px solid ${C.red}`,
                        borderRadius: 14,
                        background: "rgba(224,68,106,0.14)",
                        transform: `scale(${cancelK})`,
                      }}
                    />
                  )}
                  {sumK > 0 && (
                    <div style={{ paddingTop: 8, color: C.green, opacity: sumK }}>
                      <Tex tex="3x \phantom{+ 0y} = 12" />
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {xValK > 0 && (
                    <div style={{ background: C.mint, border: `3px solid ${C.ink}`, borderRadius: 18, padding: "10px 24px", transform: `scale(${xValK})` }}>
                      <Tex tex="x = 4" style={{ fontSize: 44 }} />
                    </div>
                  )}
                  {yValK > 0 && (
                    <div style={{ background: C.butter, border: `3px solid ${C.ink}`, borderRadius: 18, padding: "10px 24px", transform: `scale(${yValK})` }}>
                      <Tex tex="4 + y = 8 \Rightarrow y = 4" style={{ fontSize: 38 }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACT 3: Worked SAT Problem Scene */}
      {exMode > 0 && (
        <div style={{ position: "absolute", inset: 0, padding: "42px 48px", opacity: exMode, transform: `translateY(${(1 - exMode) * 40}px)` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ background: C.ink, color: C.butter, fontFamily: heading, fontWeight: 800, fontSize: 26, padding: "8px 20px", borderRadius: 999 }}>
              WORKED SAT EXAMPLE · NO SOLUTION TRAP
            </div>
            <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 26, color: C.ink2 }}>Real SAT Question</div>
          </div>

          <div style={{ marginTop: 24, background: C.lav, border: `3px solid ${C.ink}`, borderRadius: 26, padding: "22px 30px" }}>
            <div style={{ fontFamily: body, fontWeight: 700, fontSize: 32, color: C.ink, lineHeight: 1.35 }}>
              For what value of constant <Tex tex="a" /> does the system below have <span style={{ textDecoration: "underline" }}>no solution</span>?
            </div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
              <Tex tex="\begin{cases} 12x - ay = 10 \\ 4x - 3y = -5 \end{cases}" style={{ fontSize: 52 }} />
            </div>
          </div>

          {/* Step-by-step coefficient matching */}
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 18 }}>
            {multK > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: C.butter,
                  border: `3px solid ${C.ink}`,
                  borderRadius: 22,
                  padding: "16px 26px",
                  transform: `scale(${0.9 + 0.1 * multK})`,
                  opacity: Math.min(1, multK * 2),
                }}
              >
                <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 30, color: C.ink }}>
                  1. Scale bottom by <span style={{ background: C.white, padding: "2px 12px", borderRadius: 10, border: `2px solid ${C.ink}` }}>× 3</span> to match <Tex tex="12x" />:
                </div>
                <Tex tex="3(4x - 3y = -5)" style={{ fontSize: 40 }} />
              </div>
            )}

            {scaledK > 0 && (
              <div
                style={{
                  position: "relative",
                  background: C.white,
                  border: `3px solid ${C.ink}`,
                  borderRadius: 22,
                  padding: "20px 30px",
                  opacity: Math.min(1, scaledK * 2),
                }}
              >
                <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 28, color: C.ink2, marginBottom: 8 }}>
                  2. Compare the <Tex tex="y" /> coefficients side by side:
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: 48, gap: 8 }}>
                  <div>
                    <Tex tex="12x - " />
                    <span style={{ background: boxK > 0 ? C.mint : "transparent", border: boxK > 0 ? `3px solid ${C.green}` : "none", borderRadius: 12, padding: "2px 10px" }}>
                      <Tex tex="\mathbf{a}y" />
                    </span>
                    <Tex tex=" = 10" />
                  </div>
                  <div>
                    <Tex tex="12x - " />
                    <span style={{ background: boxK > 0 ? C.mint : "transparent", border: boxK > 0 ? `3px solid ${C.green}` : "none", borderRadius: 12, padding: "2px 10px" }}>
                      <Tex tex="\mathbf{9}y" />
                    </span>
                    <Tex tex=" = -15" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Final Stamped Answer */}
          {ansStamp > 0 && (
            <div
              style={{
                position: "absolute",
                right: 44,
                bottom: 38,
                background: C.ink,
                border: `5px solid ${C.butter}`,
                borderRadius: 26,
                padding: "14px 36px",
                boxShadow: "0 14px 30px rgba(11,10,15,.3)",
                transform: `rotate(-3deg) scale(${ansStamp})`,
              }}
            >
              <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 22, color: C.lav, letterSpacing: "0.08em" }}>PARALLEL · NO SOLUTION</div>
              <div style={{ color: C.butter }}>
                <Tex tex="a = 9" style={{ fontSize: 64 }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CASES = [
  { id: "one", count: "1 Solution", rule: "Different slopes (lines cross)", badge: C.butter },
  { id: "none", count: "0 Solutions", rule: "Same slope, different intercept (parallel)", badge: C.rose },
  { id: "infinite", count: "∞ Solutions", rule: "Exact same line (multiples)", badge: C.mint },
];

const RightPanel: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const { at } = tl;
  const page1 = hold(s, 0, at.elim - 0.1);
  const page2 = hold(s, at.elim - 0.1, at.example - 0.1);
  const page3 = ramp(s, at.example - 0.25, 0.4);
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
          <div style={title}>How Many Solutions?</div>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 18 }}>
            {CASES.map((c, idx) => {
              const t0 = at[c.id];
              const active = s >= t0 - 0.2 && s < (CASES[idx + 1] ? at[CASES[idx + 1].id] - 0.2 : at.elim);
              const k = ramp(s, t0 - 0.25, 0.35);
              return (
                <div
                  key={c.id}
                  style={{
                    padding: "20px 24px",
                    borderRadius: 24,
                    background: active ? c.badge : "rgba(228,205,255,.09)",
                    color: active ? C.ink : C.white,
                    opacity: 0.35 + 0.65 * k,
                    transform: `scale(${active ? 1.02 : 1})`,
                  }}
                >
                  <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 38 }}>{c.count}</div>
                  <div style={{ fontFamily: body, fontWeight: 700, fontSize: 26, marginTop: 4, color: active ? C.ink2 : C.lav }}>{c.rule}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {page2 > 0 && (
        <div style={h(page2)}>
          <div style={title}>Fastest Method: Elimination</div>
          <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 46, lineHeight: 1.15, marginTop: 20 }}>
            Look for <span style={{ color: C.butter }}>opposite signs</span> and add the rows!
          </div>
          <div style={{ marginTop: 28, background: "rgba(228,205,255,.1)", borderRadius: 24, padding: "22px 26px" }}>
            <div style={{ fontFamily: body, fontWeight: 700, fontSize: 30, color: C.mint }}>Why SAT loves this:</div>
            <div style={{ fontFamily: body, fontWeight: 600, fontSize: 28, marginTop: 8, color: C.white, lineHeight: 1.35 }}>
              Often the SAT asks for <Tex tex="x + y" /> or <Tex tex="3x" /> directly—adding the equations hands you the answer in one move.
            </div>
          </div>
        </div>
      )}

      {page3 > 0 && (
        <div style={h(page3)}>
          <div style={title}>The Coefficient Ratio Shortcut</div>
          <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 42, lineHeight: 1.15, marginTop: 18 }}>
            For <Tex tex="a_1x + b_1y = c_1" /> and <Tex tex="a_2x + b_2y = c_2" />:
          </div>
          <div style={{ marginTop: 24, background: C.butter, color: C.ink, borderRadius: 24, padding: "20px 26px" }}>
            <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 28 }}>NO SOLUTION (PARALLEL)</div>
            <div style={{ marginTop: 10 }}>
              <Tex tex="\frac{a_1}{a_2} = \frac{b_1}{b_2} \neq \frac{c_1}{c_2}" style={{ fontSize: 48 }} />
            </div>
          </div>
          <div style={{ marginTop: 20, background: "rgba(228,205,255,.12)", borderRadius: 22, padding: "18px 22px", width: 430 }}>
            <Tex tex="\frac{12}{4} = \frac{-a}{-3} \;\Rightarrow\; a = 9" style={{ fontSize: 36, color: C.mint }} />
          </div>
        </div>
      )}
    </div>
  );
};

const IntroCard: React.FC<{ s: number; k: number }> = ({ s, k }) => (
  <AbsoluteFill style={{ background: C.ink, ...graphPaper("rgba(228,205,255,.07)", 60), opacity: 1 - k, alignItems: "center", justifyContent: "center" }}>
    <div style={{ textAlign: "center", transform: `scale(${0.9 + 0.1 * pop(s, 0.08, 0.5)})` }}>
      <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 38, color: C.lav, letterSpacing: "0.1em" }}>SAT MATH · ALGEBRA SUB-LESSON</div>
      <div style={{ marginTop: 18, fontFamily: heading, fontWeight: 900, fontSize: 118, color: C.white, lineHeight: 1.05 }}>
        Systems of <span style={{ color: C.butter }}>Linear Equations</span>
      </div>
      <div style={{ marginTop: 18, fontFamily: body, fontWeight: 700, fontSize: 40, color: C.mint }}>
        1, 0, or ∞ Solutions · Elimination · The Constant Trap
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
        <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 42, color: C.lav }}>Up next: Instant Check & Practice Quiz</div>
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

export const LessonSystems: React.FC<VideoProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!tl) return null;
  const s = frame / fps;
  const { at } = tl;

  const intro = ramp(s, at.one - 0.45, 0.5);
  const cardIn = pop(s, at.one - 0.35, 0.6);
  const outro = ramp(s, at.outro - 0.35, 0.5);

  const vexKeys: VexKey[] = [
    { t: 0, expr: "smug", arms: "wave", gaze: [0, 0] },
    { t: at.one, expr: "neutral", arms: "point", gaze: [-10, -4] },
    { t: cue(tl, "one", "collide"), expr: "happy", arms: "chalk", gaze: [-10, -2] },
    { t: at.none, expr: "wide", arms: "point", gaze: [-10, 0] },
    { t: at.infinite, expr: "smug", arms: "down", gaze: [-6, -2] },
    { t: at.elim, expr: "eureka", arms: "point", gaze: [-10, 4] },
    { t: at.solve, expr: "happy", arms: "cheer", gaze: [0, 0] },
    { t: at.example, expr: "smug", arms: "point", gaze: [-10, -4] },
    { t: at.match, expr: "neutral", arms: "chalk", gaze: [-10, 0] },
    { t: cue(tl, "answer", "nine"), expr: "eureka", arms: "cheer", gaze: [0, 0] },
    { t: at.outro - 0.3, expr: "wink", arms: "wave", gaze: [0, 0] },
  ];

  return (
    <AbsoluteFill style={{ background: C.lav, ...graphPaper("rgba(11,10,15,.06)", 60), fontFamily: body, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: CARD_L, top: 40, opacity: cardIn }}>
        <Brand size={66} sub="Algebra · Systems of Linear Equations" />
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
        <SystemsStage s={s} tl={tl} />
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

      {/* Dr. Vex coaching from the bottom-right corner */}
      <DrVex s={s} tl={tl} keys={vexKeys} width={275} style={{ left: 1590, top: 660 }} />

      {intro < 1 && <IntroCard s={s} k={intro} />}
      {outro > 0 && <OutroCard c={outro} s={s - at.outro} />}
      <Voice tl={tl} />
    </AbsoluteFill>
  );
};

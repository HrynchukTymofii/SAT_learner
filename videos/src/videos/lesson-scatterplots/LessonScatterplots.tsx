import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { body, C, graphPaper, heading, hold, lerp, pop, ramp } from "../../brand";
import { cue, Timeline, VideoProps, Voice } from "../../timeline";
import { Brand, Logo, Tex } from "../../ui";

// 16:9 one-minute lesson from the app's "Lesson: Scatterplots": what a dot means, the four-point reading
// checklist (direction, form, strength, unusual points), the line of best fit and ŷ = a + bx.
// One scatterplot (hours studied vs. SAT math score) is reused all the way through and morphs to show each idea.

const CARD_L = 80;
const CARD_T = 150;
const CARD_W = 1060;
const CARD_H = 850;
const PANEL_L = 1190;
const PANEL_W = 650;

// Plot area inside the chart card; x 0..20 hours, y 400..800 points
const PL = 140;
const PR = 50;
const PT = 50;
const PB = 120;
const px = (x: number) => PL + (x / 20) * (CARD_W - PL - PR);
const py = (y: number) => PT + (1 - (y - 400) / 400) * (CARD_H - PT - PB);

const A = 450;
const B = 12;
const trend = (x: number) => A + B * x;
// Exponential-looking curve through the same range, for "or a curve?"
const curve = (x: number) => 455 + 300 * ((Math.exp(x / 6) - 1) / (Math.exp(20 / 6) - 1));

// 22 students, alternating above / below the trend so the fit splits them evenly; dot 6 is the one introduced first
const DOTS = Array.from({ length: 22 }, (_, i) => {
  const x = 1 + i * 0.85 + (random(`x${i}`) - 0.5) * 0.6;
  const n = (i % 2 ? 1 : -1) * (10 + 34 * random(`n${i}`));
  return { x, n };
});
const FIRST = 8;
const OUTLIER = { x: 17.2, y: 500 };

const card: React.CSSProperties = { background: C.white, border: `4px solid ${C.ink}`, borderRadius: 36, boxShadow: `0 10px 0 ${C.ink}` };

const Pill: React.FC<{ x: number; y: number; k: number; bg: string; children: React.ReactNode; size?: number }> = ({ x, y, k, bg, children, size = 30 }) =>
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

const Chart: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const { at } = tl;
  const axes = ramp(s, at.dot - 0.2, 0.7);
  const xTitle = pop(s, cue(tl, "cloud", "hours") - 0.1);
  const yTitle = pop(s, cue(tl, "cloud", "score") - 0.1);
  // first dot and its coordinates
  const first = pop(s, cue(tl, "dot", "observation") - 0.2, 0.5);
  const guides = hold(s, cue(tl, "dot", "pair"), at.cloud + 1.2);
  // the shape changes: curve morph, then tight / loose noise
  const morph = Math.min(ramp(s, cue(tl, "form", "curve") - 0.3, 0.7), 1 - ramp(s, at.strength - 0.1, 0.6));
  const lineGuide = hold(s, cue(tl, "form", "line") - 0.1, cue(tl, "form", "curve") + 0.1, 0.3);
  const curveGuide = hold(s, cue(tl, "form", "curve") - 0.1, at.strength + 0.2, 0.3);
  const tight = ramp(s, cue(tl, "strength", "tightly") - 0.2, 0.6);
  const loose = ramp(s, cue(tl, "strength", "spread") - 0.2, 0.6);
  const back = ramp(s, at.outlier - 0.3, 0.6);
  const amp = lerp(lerp(lerp(1, 0.22, tight), 1.7, loose), 1, back);
  // direction arrow
  const arrow = ramp(s, cue(tl, "direction", "grows") - 0.2, 0.9) * (1 - ramp(s, at.form - 0.3, 0.3));
  // outlier
  const out = ramp(s, cue(tl, "outlier", "this") - 0.1, 0.3);
  const outPill = pop(s, cue(tl, "outlier", "outlier") - 0.15);
  // best fit, residuals, slope triangle, intercept
  const fit = ramp(s, cue(tl, "fit", "line") - 0.1, 1.3);
  const resUp = hold(s, cue(tl, "fit", "above") - 0.2, at.equation + 0.2);
  const resDown = hold(s, cue(tl, "fit", "below") - 0.2, at.equation + 0.2);
  const tri = ramp(s, cue(tl, "equation", "slope") - 0.1, 0.6);
  const icpt = pop(s, cue(tl, "equation", "prediction") - 0.1);
  const per = pop(s, cue(tl, "predict", "twelve") - 0.1);

  const dotY = (d: { x: number; n: number }) => lerp(trend(d.x), curve(d.x), morph) + d.n * amp * (1 - 0.5 * morph);
  const label: React.CSSProperties = { fontFamily: body, fontWeight: 700, fontSize: 26, fill: C.ink2 };
  const gridC = "rgba(124,77,219,.16)";
  const fitLen = Math.hypot(px(20) - px(0), py(trend(20)) - py(trend(0)));
  const curvePath = Array.from({ length: 41 }, (_, i) => `${i ? "L" : "M"}${px(i / 2)} ${py(curve(i / 2))}`).join(" ");
  const ring = (t0: number) => ((s - t0) % 1.2) / 1.2;
  const rO = ring(cue(tl, "outlier", "this"));
  const arrowLen = Math.hypot(px(18) - px(2), py(trend(18) + 40) - py(trend(2) - 40));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={CARD_W} height={CARD_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <marker id="head" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <path d="M0 0 L4 2 L0 4 Z" fill={C.violet} />
          </marker>
        </defs>
        <g opacity={axes}>
          {[0, 4, 8, 12, 16, 20].map((x) => (
            <g key={x}>
              <line x1={px(x)} x2={px(x)} y1={py(400)} y2={py(800)} stroke={gridC} strokeWidth={2} />
              <text x={px(x)} y={py(400) + 40} textAnchor="middle" style={label}>{x}</text>
            </g>
          ))}
          {[400, 500, 600, 700, 800].map((y) => (
            <g key={y}>
              <line x1={px(0)} x2={px(20)} y1={py(y)} y2={py(y)} stroke={gridC} strokeWidth={2} />
              <text x={px(0) - 16} y={py(y) + 9} textAnchor="end" style={label}>{y}</text>
            </g>
          ))}
          <line x1={px(0)} x2={px(20)} y1={py(400)} y2={py(400)} stroke={C.ink} strokeWidth={4} />
          <line x1={px(0)} x2={px(0)} y1={py(400)} y2={py(800)} stroke={C.ink} strokeWidth={4} />
          <text x={(px(0) + px(20)) / 2} y={CARD_H - 30} textAnchor="middle" opacity={xTitle} style={{ ...label, fontFamily: heading, fontSize: 34, fill: C.ink }}>
            x: hours studied
          </text>
          <text transform={`translate(44 ${(py(400) + py(800)) / 2}) rotate(-90)`} textAnchor="middle" opacity={yTitle} style={{ ...label, fontFamily: heading, fontSize: 34, fill: C.ink }}>
            y: SAT math score
          </text>
        </g>

        {/* the first dot's coordinates */}
        <g opacity={guides} stroke={C.violet} strokeWidth={4} strokeDasharray="10 9">
          <line x1={px(DOTS[FIRST].x)} x2={px(DOTS[FIRST].x)} y1={py(400)} y2={py(dotY(DOTS[FIRST]))} />
          <line x1={px(0)} x2={px(DOTS[FIRST].x)} y1={py(dotY(DOTS[FIRST]))} y2={py(dotY(DOTS[FIRST]))} />
        </g>

        {/* guides for form */}
        <line x1={px(0)} y1={py(trend(0))} x2={px(20)} y2={py(trend(20))} stroke={C.violet} strokeWidth={5} strokeDasharray="14 12" opacity={lineGuide} />
        <path d={curvePath} fill="none" stroke={C.violet} strokeWidth={5} strokeDasharray="14 12" opacity={curveGuide} />

        {/* residuals */}
        {DOTS.map((d, i) => {
          const up = d.n > 0;
          const k = up ? resUp : resDown;
          return k > 0 ? <line key={i} x1={px(d.x)} x2={px(d.x)} y1={py(trend(d.x))} y2={py(dotY(d))} stroke={up ? C.violet : "#C99A1E"} strokeWidth={4} opacity={k} /> : null;
        })}

        {/* line of best fit */}
        <line x1={px(0)} y1={py(trend(0))} x2={px(20)} y2={py(trend(20))} stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeDasharray={fitLen} strokeDashoffset={fitLen * (1 - fit)} />

        {/* slope triangle: +5 h → +60 */}
        <g opacity={tri}>
          <path d={`M${px(10)} ${py(trend(10))} L${px(15)} ${py(trend(10))} L${px(15)} ${py(trend(15))}`} fill="none" stroke={C.green} strokeWidth={6} strokeLinejoin="round" />
        </g>

        {/* direction arrow */}
        {arrow > 0 && (
          <line
            x1={px(2)}
            y1={py(trend(2) - 40)}
            x2={px(2) + (px(18) - px(2)) * arrow}
            y2={py(trend(2) - 40) + (py(trend(18) + 40) - py(trend(2) - 40)) * arrow}
            stroke={C.violet}
            strokeWidth={22}
            strokeLinecap="round"
            opacity={0.55}
            markerEnd="url(#head)"
            strokeDasharray={arrowLen}
          />
        )}

        {/* dots */}
        {DOTS.map((d, i) => {
          const k = i === FIRST ? first : pop(s, at.cloud + 0.2 + i * 0.07, 0.35);
          if (k <= 0) return null;
          const above = d.n > 0;
          const fill = resUp > 0 && above ? C.lavDeep : resDown > 0 && !above ? C.butter : i === FIRST && s < at.direction ? C.butter : C.white;
          return <circle key={i} cx={px(d.x)} cy={py(dotY(d))} r={13 * k} fill={fill} stroke={C.ink} strokeWidth={4} />;
        })}
        {pop(s, at.cloud + 0.2 + 22 * 0.07, 0.35) > 0 && (
          <>
            {out > 0 && <circle cx={px(OUTLIER.x)} cy={py(OUTLIER.y)} r={16 + 34 * rO} fill="none" stroke={C.red} strokeWidth={5} opacity={(1 - rO) * out * (1 - ramp(s, at.fit, 0.4))} />}
            <circle
              cx={px(OUTLIER.x)}
              cy={py(OUTLIER.y)}
              r={13 * pop(s, at.cloud + 0.2 + 22 * 0.07, 0.35) + 3 * out}
              fill={out > 0.5 ? C.rose : C.white}
              stroke={out > 0.5 ? C.red : C.ink}
              strokeWidth={4}
            />
          </>
        )}

        {/* intercept a */}
        {icpt > 0 && <circle cx={px(0)} cy={py(A)} r={16 * icpt} fill={C.butter} stroke={C.ink} strokeWidth={5} />}
      </svg>

      <Pill x={px(DOTS[FIRST].x) + 10} y={py(dotY(DOTS[FIRST])) - 56} k={pop(s, cue(tl, "dot", "x") - 0.1) * (1 - ramp(s, at.direction - 0.3, 0.3))} bg={C.butter}>
        {s < cue(tl, "cloud", "student") ? "(x, y)" : `(${DOTS[FIRST].x.toFixed(0)} h, ${Math.round(dotY(DOTS[FIRST]))})`}
      </Pill>
      <Pill x={px(16.5)} y={py(trend(18) + 20)} k={pop(s, cue(tl, "direction", "positive") - 0.1) * (1 - ramp(s, at.form - 0.3, 0.3))} bg={C.lav} size={36}>
        positive ↗
      </Pill>
      <Pill x={px(4)} y={py(560)} k={pop(s, cue(tl, "form", "line") - 0.1) * (1 - ramp(s, cue(tl, "form", "curve") - 0.2, 0.3))} bg={C.lav}>
        line?
      </Pill>
      <Pill x={px(6)} y={py(620)} k={pop(s, cue(tl, "form", "curve") - 0.1) * (1 - ramp(s, at.strength, 0.3))} bg={C.lav}>
        curve?
      </Pill>
      <Pill x={px(5)} y={py(640)} k={pop(s, cue(tl, "strength", "strong") - 0.1) * (1 - ramp(s, cue(tl, "strength", "spread") - 0.2, 0.3))} bg={C.mint} size={34}>
        strong
      </Pill>
      <Pill x={px(5)} y={py(680)} k={pop(s, cue(tl, "strength", "weak") - 0.1) * (1 - ramp(s, at.outlier - 0.3, 0.3))} bg={C.rose} size={34}>
        weak
      </Pill>
      <Pill x={px(OUTLIER.x)} y={py(OUTLIER.y) + 60} k={outPill * (1 - ramp(s, at.fit, 0.4))} bg={C.rose} size={34}>
        outlier
      </Pill>
      <Pill x={px(4.5)} y={py(720)} k={pop(s, cue(tl, "fit", "above") - 0.1) * (1 - ramp(s, at.equation, 0.3))} bg={C.lavDeep}>
        11 above
      </Pill>
      <Pill x={px(15)} y={py(470)} k={pop(s, cue(tl, "fit", "below") - 0.1) * (1 - ramp(s, at.equation, 0.3))} bg={C.butter}>
        11 below
      </Pill>
      <Pill x={px(12.5)} y={py(trend(10)) + 40} k={tri} bg={C.mint} size={28}>
        +5 h
      </Pill>
      <Pill x={px(15) + 70} y={(py(trend(10)) + py(trend(15))) / 2} k={tri} bg={C.mint} size={28}>
        {per > 0 ? "+60 = 5 × 12" : "+60"}
      </Pill>
      <Pill x={px(0) + 120} y={py(A) + 50} k={icpt} bg={C.butter} size={28}>
        a = 450
      </Pill>
    </div>
  );
};

const Check: React.FC<{ on: boolean }> = ({ on }) => (
  <div style={{ width: 46, height: 46, borderRadius: 23, flex: "none", background: on ? C.mint : "rgba(228,205,255,.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {on && (
      <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    )}
  </div>
);

const ITEMS = [
  { id: "direction", name: "Direction", value: "positive ↗" },
  { id: "form", name: "Form", value: "linear" },
  { id: "strength", name: "Strength", value: "fairly strong" },
  { id: "outlier", name: "Unusual points", value: "1 outlier" },
];

const Panel: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const { at } = tl;
  const page1 = hold(s, at.dot, at.direction - 0.1);
  const page2 = hold(s, at.direction, at.fit - 0.1);
  const page3 = ramp(s, at.fit - 0.3, 0.4);
  const h = (k: number): React.CSSProperties => ({ position: "absolute", inset: "44px 46px", opacity: k, transform: `translateY(${(1 - k) * 30}px)` });
  const title: React.CSSProperties = { fontFamily: heading, fontWeight: 800, fontSize: 30, color: C.lav, letterSpacing: "0.08em", textTransform: "uppercase" };
  const big: React.CSSProperties = { fontFamily: heading, fontWeight: 800, fontSize: 56, lineHeight: 1.12, color: C.white };
  const line = (t: number): React.CSSProperties => {
    const k = pop(s, t - 0.15, 0.45);
    return { opacity: Math.min(1, k * 2), transform: `translateX(${(1 - k) * 30}px)` };
  };

  return (
    <div style={{ position: "absolute", inset: 0, color: C.white }}>
      {page1 > 0 && (
        <div style={h(page1)}>
          <div style={title}>What is a scatterplot?</div>
          <div style={{ ...big, marginTop: 28, ...line(cue(tl, "dot", "each")) }}>
            One dot = one <span style={{ color: C.butter }}>observation</span>
          </div>
          <div style={{ marginTop: 26, ...line(cue(tl, "dot", "pair")) }}>
            <Tex tex="(x,\ y)" style={{ fontSize: 76, color: C.butter }} />
          </div>
          <div style={{ marginTop: 60, ...line(cue(tl, "cloud", "student")) }}>
            <div style={{ ...big, fontSize: 46 }}>Here, one dot = one student</div>
            <div style={{ marginTop: 22, fontFamily: body, fontWeight: 600, fontSize: 36, color: C.lav, ...line(cue(tl, "cloud", "hours")) }}>x = hours studied</div>
            <div style={{ marginTop: 10, fontFamily: body, fontWeight: 600, fontSize: 36, color: C.lav, ...line(cue(tl, "cloud", "score")) }}>y = math score</div>
          </div>
        </div>
      )}
      {page2 > 0 && (
        <div style={h(page2)}>
          <div style={title}>Read it in 4 checks</div>
          <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 22 }}>
            {ITEMS.map((it, i) => {
              const start = at[it.id];
              const active = s >= start - 0.2 && s < (ITEMS[i + 1] ? at[ITEMS[i + 1].id] - 0.2 : at.fit);
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
                    <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 42 }}>{it.name}</div>
                    <div style={{ fontFamily: body, fontWeight: 700, fontSize: 30, marginTop: 2, opacity: done ? 0.85 : 0, color: active ? C.ink2 : C.lav }}>{it.value}</div>
                  </div>
                  <Check on={done} />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {page3 > 0 && (
        <div style={h(page3)}>
          <div style={title}>Line of best fit</div>
          <div style={{ ...big, fontSize: 46, marginTop: 24, ...line(cue(tl, "fit", "middle")) }}>Runs through the middle of the cloud</div>
          <div style={{ marginTop: 36, ...line(cue(tl, "equation", "y")) }}>
            <Tex tex="\hat{y} = a + b\,x" style={{ fontSize: 88, color: C.butter }} />
          </div>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, ...line(cue(tl, "equation", "slope")) }}>
              <Tex tex="b" style={{ fontSize: 56, color: C.mint, width: 50 }} />
              <div style={{ fontFamily: body, fontWeight: 700, fontSize: 32 }}>slope: change in y per unit of x</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, ...line(cue(tl, "equation", "prediction")) }}>
              <Tex tex="a" style={{ fontSize: 56, color: C.butter, width: 50 }} />
              <div style={{ fontFamily: body, fontWeight: 700, fontSize: 32 }}>prediction at x = 0</div>
            </div>
          </div>
          <div style={{ marginTop: 30, background: C.mint, color: C.ink, borderRadius: 26, padding: "20px 28px", ...line(cue(tl, "predict", "twelve")) }}>
            <Tex tex="b = 12" style={{ fontSize: 54 }} />
            <div style={{ fontFamily: body, fontWeight: 700, fontSize: 32, marginTop: 4 }}>+1 hour ≈ +12 points</div>
          </div>
        </div>
      )}
    </div>
  );
};

const Intro: React.FC<{ s: number; k: number }> = ({ s, k }) => (
  <AbsoluteFill style={{ background: C.ink, ...graphPaper("rgba(228,205,255,.07)", 60), opacity: 1 - k, alignItems: "center", justifyContent: "center" }}>
    {/* a few dots drifting up and to the right behind the title */}
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 26 }, (_, i) => {
        const x = 120 + i * 66 + random(`ix${i}`) * 40;
        const y = 930 - i * 30 - random(`iy${i}`) * 180;
        const p = pop(s, 0.1 + i * 0.05, 0.4);
        return <circle key={i} cx={x} cy={y} r={14 * p} fill={i % 3 ? C.lavDeep : C.butter} opacity={0.3} />;
      })}
    </svg>
    <div style={{ textAlign: "center", transform: `scale(${0.9 + 0.1 * pop(s, 0.1, 0.6)})` }}>
      <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 40, color: C.lav, letterSpacing: "0.1em" }}>SAT MATH · 1-MINUTE LESSON</div>
      <div style={{ marginTop: 18, fontFamily: heading, fontWeight: 900, fontSize: 140, color: C.white, lineHeight: 1 }}>
        How to read a <span style={{ color: C.butter }}>scatterplot</span>
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

export const LessonScatterplots: React.FC<VideoProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!tl) return null;
  const s = frame / fps;
  const { at } = tl;
  const intro = ramp(s, at.dot - 0.45, 0.5);
  const cardIn = pop(s, at.dot - 0.35, 0.6);
  const outro = ramp(s, at.outro - 0.4, 0.5);

  return (
    <AbsoluteFill style={{ background: C.lav, ...graphPaper("rgba(11,10,15,.06)", 60), fontFamily: body, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: CARD_L, top: 44, opacity: cardIn }}>
        <Brand size={68} sub="Lesson · Scatterplots" />
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
        <div style={{ position: "absolute", left: -4, top: -4 }}>
          <Chart s={s} tl={tl} />
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

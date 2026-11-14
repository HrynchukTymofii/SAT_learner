import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { body, C, graphPaper, heading, lerp, pop, ramp } from "../../brand";
import { cue, spoken, Timeline, VideoProps, Voice } from "../../timeline";
import { Key, Unit1600 } from "../../mascot/Unit1600";
import { Brand, Logo, ReadAlong, Tex } from "../../ui";

// 9:16 short for one SAT problem (Scatterplots practice, $360 ticket budget): the graph draws itself while the
// question is read, then it is solved on screen (adult price, student price), "your turn" with a 3 s countdown,
// and only then the equation is built, which is the answer: revealing it early loses the viewers.
// Every highlight lands on the word the voice says. Unit-1600, the mascot, narrates from the bottom right
// (expressions, pointing and gaze cued to its lines). Ends on the app.
// TikTok / Reels / Shorts cover the top ~170 px, bottom ~450 px and right ~120 px, so what must be read
// stays in x 60..960, y 170..1470.

const PAD = 60;
const CW = 960;
const TOP = 170;
const GRAPH_TOP = 290;
const GRAPH_H = 620;
const STAGE_TOP = GRAPH_TOP + GRAPH_H + 30;

const QUESTION = "A $360 budget buys x student tickets and y adult tickets. Which equation matches the graph?";

const card: React.CSSProperties = { background: C.white, border: `4px solid ${C.ink}`, borderRadius: 32, boxShadow: `0 10px 0 ${C.ink}` };

// Plot area inside the graph card; x 0..26 student tickets, y 0..20 adult tickets
const PL = 130;
const PR = 40;
const PT = 44;
const PB = 112;
const px = (x: number) => PL + (x / 26) * (CW - PL - PR);
const py = (y: number) => PT + (1 - y / 20) * (GRAPH_H - PT - PB);

const Pill: React.FC<{ x: number; y: number; k: number; bg: string; children: React.ReactNode; anchor?: "left" | "right" }> = ({ x, y, k, bg, children, anchor = "left" }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(${anchor === "left" ? 0 : -100}%, -50%) scale(${k})`,
      transformOrigin: anchor === "left" ? "0 50%" : "100% 50%",
      opacity: Math.min(1, k * 2),
      background: bg,
      border: `3px solid ${C.ink}`,
      borderRadius: 18,
      padding: "8px 18px",
      fontFamily: heading,
      fontWeight: 800,
      fontSize: 34,
      color: C.ink,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const Graph: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const axes = ramp(s, 0.3, 0.8);
  const draw = ramp(s, cue(tl, "question", "student") - 0.2, 2.6);
  const xPulse = pop(s, cue(tl, "question", "x"), 0.5) * (1 - ramp(s, cue(tl, "question", "x") + 0.6, 0.4));
  const yPulse = pop(s, cue(tl, "question", "y"), 0.5) * (1 - ramp(s, cue(tl, "question", "y") + 0.6, 0.4));
  // Each end of the line lights up as it is said, then shows that ticket's price
  const kA = pop(s, cue(tl, "adult", "eighteen") - 0.1);
  const kB = pop(s, cue(tl, "student", "twenty-four") - 0.1);
  const priceA = ramp(s, cue(tl, "adult", "twenty") - 0.1, 0.3);
  const priceB = ramp(s, cue(tl, "student", "fifteen") - 0.1, 0.3);
  const gridC = "rgba(124,77,219,.18)";
  const len = Math.hypot(px(24) - px(0), py(0) - py(18));
  const ring = (k: number, t0: number) => {
    const p = ((s - t0) % 1.2) / 1.2;
    return k > 0 ? { r: 16 + 30 * p, o: (1 - p) * 0.8 } : { r: 0, o: 0 };
  };
  const rA = ring(kA, cue(tl, "adult", "eighteen"));
  const rB = ring(kB, cue(tl, "student", "twenty-four"));
  const label: React.CSSProperties = { fontFamily: body, fontWeight: 700, fontSize: 26, fill: C.ink2 };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={CW} height={GRAPH_H} style={{ position: "absolute", inset: 0 }}>
        <g opacity={axes}>
          {[0, 6, 12, 18, 24].map((x) => (
            <g key={x}>
              <line x1={px(x)} x2={px(x)} y1={py(0)} y2={py(20)} stroke={gridC} strokeWidth={2} />
              <text x={px(x)} y={py(0) + 40} textAnchor="middle" style={label}>{x}</text>
            </g>
          ))}
          {[0, 3, 6, 9, 12, 15, 18].map((y) => (
            <g key={y}>
              <line x1={px(0)} x2={px(26)} y1={py(y)} y2={py(y)} stroke={gridC} strokeWidth={2} />
              <text x={px(0) - 18} y={py(y) + 9} textAnchor="end" style={label}>{y}</text>
            </g>
          ))}
          <line x1={px(0)} x2={px(26)} y1={py(0)} y2={py(0)} stroke={C.ink} strokeWidth={4} />
          <line x1={px(0)} x2={px(0)} y1={py(0)} y2={py(20)} stroke={C.ink} strokeWidth={4} />
          <text x={(px(0) + px(26)) / 2} y={GRAPH_H - 22} textAnchor="middle" style={{ ...label, fontFamily: heading, fontSize: 34, fill: xPulse > 0.05 ? C.violet : C.ink }}>
            Student tickets (x)
          </text>
          <text
            transform={`translate(40 ${(py(0) + py(20)) / 2}) rotate(-90)`}
            textAnchor="middle"
            style={{ ...label, fontFamily: heading, fontSize: 34, fill: yPulse > 0.05 ? C.violet : C.ink }}
          >
            Adult tickets (y)
          </text>
        </g>

        <line x1={px(0)} y1={py(18)} x2={px(24)} y2={py(0)} stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        {[{ x: 0, y: 18, ...rA }, { x: 24, y: 0, ...rB }].map((r, i) => (
          <circle key={i} cx={px(r.x)} cy={py(r.y)} r={r.r} fill="none" stroke={C.violet} strokeWidth={5} opacity={r.o} />
        ))}
        {[0, 6, 12, 18, 24].map((x) => {
          const k = pop(s, cue(tl, "question", "student") - 0.2 + 2.6 * (x / 24) * 0.85, 0.35);
          const lit = (x === 0 && kA > 0) || (x === 24 && kB > 0);
          return (
            <circle
              key={x}
              cx={px(x)}
              cy={py(18 - x * 0.75)}
              r={13 * k + (lit ? 4 : 0)}
              fill={lit ? C.butter : C.white}
              stroke={C.ink}
              strokeWidth={5}
            />
          );
        })}
      </svg>

      <Pill x={px(0) + 34} y={py(18) - 2} k={kA} bg={C.butter}>
        {priceA > 0 ? <span>18 × $20 = $360</span> : <span>x = 0 → 18 adults</span>}
      </Pill>
      <Pill x={px(24) - 4} y={py(0) - 68} k={kB} bg={C.butter} anchor="right">
        {priceB > 0 ? <span>24 × $15 = $360</span> : <span>y = 0 → 24 students</span>}
      </Pill>
    </div>
  );
};

const Countdown: React.FC<{ k: number }> = ({ k }) => {
  const n = Math.min(3, 3 - Math.floor(k * 3));
  const R = 96;
  const inK = ramp(k, 0, 0.08);
  const beat = pop((k * 3) % 1, 0, 0.25);
  return (
    <AbsoluteFill style={{ background: `rgba(11,10,15,${0.62 * inK})`, alignItems: "center", justifyContent: "center", opacity: inK, borderRadius: 28 }}>
      <div style={{ position: "relative", width: R * 2 + 24, height: R * 2 + 24, transform: `scale(${0.85 + 0.15 * beat})` }}>
        <svg width={R * 2 + 24} height={R * 2 + 24} style={{ position: "absolute", inset: 0 }}>
          <circle cx={R + 12} cy={R + 12} r={R} stroke="rgba(228,205,255,.3)" strokeWidth={16} fill="none" />
          <circle
            cx={R + 12}
            cy={R + 12}
            r={R}
            stroke={C.butter}
            strokeWidth={16}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * R}
            strokeDashoffset={2 * Math.PI * R * k}
            transform={`rotate(-90 ${R + 12} ${R + 12})`}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontFamily: heading, fontSize: 130, fontWeight: 900 }}>{n}</div>
      </div>
      <div style={{ marginTop: 22, color: C.white, fontFamily: heading, fontSize: 54, fontWeight: 800 }}>Pause and solve it!</div>
    </AbsoluteFill>
  );
};

// One solution step: number, title, body; slides in from the right and out to the left
const Step: React.FC<{ s: number; from: number; to: number; n: string; title: string; children: React.ReactNode }> = ({ s, from, to, n, title, children }) => {
  const kin = ramp(s, from - 0.35, 0.45);
  const kout = ramp(s, to - 0.3, 0.35);
  if (kin <= 0 || kout >= 1) return null;
  return (
    <div
      style={{
        ...card,
        position: "absolute",
        left: PAD,
        top: STAGE_TOP,
        width: CW,
        boxSizing: "border-box",
        padding: "28px 34px 30px",
        opacity: kin * (1 - kout),
        transform: kin < 1 || kout > 0 ? `translateX(${(1 - kin) * 120 - kout * 120}px)` : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 26, background: C.ink, color: C.butter, fontFamily: heading, fontWeight: 900, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {n}
        </div>
        <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 42, color: C.ink }}>{title}</div>
      </div>
      <div style={{ marginTop: 18 }}>{children}</div>
    </div>
  );
};

// A line of math that pops in at time t
const MathLine: React.FC<{ s: number; t: number; tex: string; size?: number; note?: string }> = ({ s, t, tex, size = 50, note }) => {
  const k = pop(s, t - 0.15, 0.4);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, height: 92, opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * 24}px)`, color: C.ink }}>
      {note && <div style={{ width: 230, fontFamily: heading, fontWeight: 700, fontSize: 36, color: C.ink2 }}>{note}</div>}
      <Tex tex={tex} style={{ fontSize: size }} />
    </div>
  );
};

// 15x + 20y = 360 assembled term by term, each with what it means
const Term: React.FC<{ s: number; t: number; tex: string; bg: string; caption: string }> = ({ s, t, tex, bg, caption }) => {
  const k = pop(s, t - 0.15, 0.45);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: Math.min(1, k * 2), transform: `scale(${0.6 + 0.4 * k})` }}>
      <div style={{ background: bg, border: `3px solid ${C.ink}`, borderRadius: 20, padding: "6px 20px", color: C.ink }}>
        <Tex tex={tex} style={{ fontSize: 64 }} />
      </div>
      <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 30, color: C.ink2 }}>{caption}</div>
    </div>
  );
};

const Op: React.FC<{ s: number; t: number; tex: string }> = ({ s, t, tex }) => (
  <div style={{ opacity: ramp(s, t - 0.15, 0.3), color: C.ink, marginBottom: 46 }}>
    <Tex tex={tex} style={{ fontSize: 60 }} />
  </div>
);

const EndCard: React.FC<{ c: number; s: number }> = ({ c, s }) => {
  const { height } = useVideoConfig();
  const points = ["700+ SAT-style problems", "Every one solved step by step", "Lessons for each topic"];
  return (
    <AbsoluteFill style={{ background: C.ink, ...graphPaper("rgba(228,205,255,.07)", 54), transform: `translateY(${(1 - c) * height}px)` }}>
      <div style={{ position: "absolute", top: TOP + 60, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ transform: `scale(${0.7 + 0.3 * c}) rotate(${(1 - c) * -12}deg)` }}>
          <Logo size={230} />
        </div>
        <div style={{ marginTop: 40, fontFamily: heading, fontWeight: 900, fontSize: 100, color: C.white, letterSpacing: "-0.01em" }}>SAT Math Learner</div>
        <div style={{ marginTop: 6, fontFamily: heading, fontWeight: 600, fontSize: 42, color: C.lav }}>Your SAT math coach, in your pocket</div>
        <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 26 }}>
          {points.map((p, i) => {
            const k = pop(s, 0.5 + i * 0.25, 0.4);
            return (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 22, opacity: Math.min(1, k * 2), transform: `translateX(${(1 - k) * 40}px)` }}>
                <div style={{ width: 54, height: 54, borderRadius: 27, background: C.mint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </div>
                <div style={{ fontFamily: body, fontWeight: 700, fontSize: 44, color: C.white }}>{p}</div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 70,
            background: C.butter,
            color: C.ink,
            fontFamily: heading,
            fontWeight: 900,
            fontSize: 52,
            padding: "26px 64px",
            borderRadius: 999,
            border: `4px solid ${C.white}`,
            transform: `scale(${1 + 0.035 * Math.sin(s * Math.PI * 2)})`,
          }}
        >
          Free on iOS & Android
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ProblemTickets: React.FC<VideoProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!tl) return null;
  const s = frame / fps;
  const { at, len } = tl;

  const intro = pop(s, 0.05, 0.6);
  const hook = 1 - ramp(s, at.question - 0.3, 0.35);
  const qIn = ramp(s, at.question - 0.2, 0.4);
  const qOut = ramp(s, at.adult - 0.3, 0.4);
  const think = ramp(s, at.think, len.think, (x) => x);
  // the answer only once the equation has been built and is said in full
  const ansT = cue(tl, "build", "fifteen", 1) - 0.25;
  const ansIn = pop(s, ansT, 0.5);
  const cta = ramp(s, at.cta - 0.45, 0.6);
  const graphIn = pop(s, 0.15, 0.6);

  // the mascot's direction: from each moment on, this face / these arms / this gaze
  const keys: Key[] = [
    { t: 0, expr: "bored", arms: "down", gaze: [0, 0] },
    { t: cue(tl, "hook", "wrecks"), expr: "smug" },
    { t: at.question, expr: "neutral", gaze: [-9, -7] },
    { t: cue(tl, "adult", "genius") - 0.1, expr: "smug", gaze: [0, 0] },
    { t: cue(tl, "adult", "no") - 0.1, expr: "neutral", arms: "point", gaze: [-9, -7] },
    { t: cue(tl, "student", "not") - 0.1, expr: "smug", arms: "down", gaze: [0, 0] },
    { t: cue(tl, "student", "i'd") - 0.05, expr: "wink" },
    { t: at.prompt, expr: "neutral" },
    { t: cue(tl, "prompt", "wait") - 0.1, expr: "bored" },
    { t: at.think + 0.4, gaze: [-10, 0] },
    { t: at.think + 1.4, gaze: [10, 0] },
    { t: at.think + 2.4, gaze: [0, 0] },
    { t: at.build, expr: "neutral", arms: "point", gaze: [-9, -7] },
    { t: cue(tl, "build", "boom") - 0.1, expr: "happy", arms: "cheer", gaze: [0, 0] },
    { t: ansT + 0.6, expr: "wide", arms: "point", gaze: [-9, -9] },
    { t: at.cta - 0.3, expr: "wink", arms: "wave", gaze: [0, 0] },
    { t: at.cta + 1.6, expr: "happy" },
  ];

  return (
    <AbsoluteFill style={{ background: C.lav, ...graphPaper("rgba(11,10,15,.06)", 54), fontFamily: body, overflow: "hidden" }}>
      {/* header */}
      <div style={{ position: "absolute", left: PAD, top: TOP, width: CW, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: intro, transform: `translateY(${(1 - intro) * -30}px)` }}>
        <Brand size={84} sub="SAT Math · Graphs" />
        <div style={{ background: C.ink, color: C.butter, fontFamily: heading, fontWeight: 800, fontSize: 30, padding: "10px 22px", borderRadius: 999, marginRight: 60 }}>Medium</div>
      </div>

      {/* graph */}
      <div
        style={{
          ...card,
          position: "absolute",
          left: PAD,
          top: GRAPH_TOP,
          width: CW,
          height: GRAPH_H,
          boxSizing: "border-box",
          overflow: "hidden",
          opacity: Math.min(1, graphIn * 1.5),
          // no transform once settled: Chrome can keep painting the SVG text at the old scale
          transform: graphIn < 1 ? `scale(${0.92 + 0.08 * graphIn})` : undefined,
        }}
      >
        <div style={{ position: "absolute", left: -4, top: -4 }}>
          <Graph s={s} tl={tl} />
        </div>
        {think > 0 && think < 1 && <Countdown k={think} />}
      </div>

      {/* hook */}
      {hook > 0 && (
        <div style={{ position: "absolute", left: PAD, top: STAGE_TOP + 40, width: CW, opacity: hook, textAlign: "center" }}>
          <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 92, lineHeight: 1.25, color: C.ink, transform: `scale(${0.9 + 0.1 * pop(s, 0.1, 0.6)})` }}>
            Oh great, a <span style={{ background: C.butter, border: `4px solid ${C.ink}`, borderRadius: 22, padding: "0 16px" }}>graph</span> problem.
          </div>
        </div>
      )}

      {/* question */}
      {qIn > 0 && qOut < 1 && (
        <div
          style={{
            ...card,
            position: "absolute",
            left: PAD,
            top: STAGE_TOP,
            width: CW,
            boxSizing: "border-box",
            padding: "32px 38px",
            opacity: qIn * (1 - qOut),
            transform: `translateY(${(1 - qIn) * 60}px) translateX(${-qOut * 140}px)`,
          }}
        >
          <ReadAlong text={QUESTION} p={spoken(tl, "question", s)} style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.3, color: C.ink }} />
        </div>
      )}

      {/* solution: solved before the answer is shown */}
      <Step s={s} from={at.adult} to={at.student} n="1" title="Price of an adult ticket">
        <MathLine s={s} t={cue(tl, "adult", "eighteen")} note="no students" tex="x = 0 \;\Rightarrow\; y = 18" />
        <MathLine s={s} t={cue(tl, "adult", "over")} note="1 adult" tex="\$360 \div 18 = \textbf{\$20}" />
      </Step>
      <Step s={s} from={at.student} to={at.prompt} n="2" title="Price of a student ticket">
        <MathLine s={s} t={cue(tl, "student", "twenty-four")} note="no adults" tex="y = 0 \;\Rightarrow\; x = 24" />
        <MathLine s={s} t={cue(tl, "student", "over")} note="1 student" tex="\$360 \div 24 = \textbf{\$15}" />
      </Step>
      <Step s={s} from={at.prompt} to={at.build} n="?" title="Your turn: write the equation">
        <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
          {[
            ["student", "$15", C.mint],
            ["adult", "$20", C.butter],
            ["budget", "$360", C.lav],
          ].map(([what, price, bg]) => (
            <div key={what} style={{ flex: 1, background: bg, border: `3px solid ${C.ink}`, borderRadius: 22, padding: "14px 0", textAlign: "center" }}>
              <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 56, color: C.ink }}>{price}</div>
              <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 30, color: C.ink2 }}>{what}</div>
            </div>
          ))}
        </div>
      </Step>
      <Step s={s} from={at.build} to={at.cta + 0.4} n="3" title="Add up the spending">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 14 }}>
          <Term s={s} t={cue(tl, "build", "fifteen")} tex="15x" bg={C.mint} caption="students" />
          <Op s={s} t={cue(tl, "build", "plus")} tex="+" />
          <Term s={s} t={cue(tl, "build", "twenty")} tex="20y" bg={C.butter} caption="adults" />
          <Op s={s} t={cue(tl, "build", "equals")} tex="=" />
          <Term s={s} t={cue(tl, "build", "budget")} tex="360" bg={C.lav} caption="budget" />
        </div>
      </Step>

      {/* answer, stamped onto the graph */}
      {ansIn > 0 && (
        <div
          style={{
            position: "absolute",
            left: PAD + 50,
            top: GRAPH_TOP + GRAPH_H - 270,
            width: CW - 100,
            boxSizing: "border-box",
            padding: "18px 0 22px",
            background: C.ink,
            border: `5px solid ${C.butter}`,
            borderRadius: 32,
            boxShadow: "0 18px 40px rgba(11,10,15,.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            opacity: Math.min(1, ansIn * 3),
            transform: `rotate(-3deg) scale(${lerp(1.7, 1, ramp(s, ansT, 0.25))})`,
          }}
        >
          <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 34, color: C.lav, letterSpacing: "0.08em" }}>ANSWER</div>
          <div style={{ color: C.butter }}>
            <Tex tex="15x + 20y = 360" style={{ fontSize: 80, whiteSpace: "nowrap" }} />
          </div>
        </div>
      )}

      {cta > 0 && <EndCard c={cta} s={s - at.cta} />}
      <Unit1600 s={s} tl={tl} keys={keys} width={360} style={{ left: 575, top: 1268 }} />
      <Voice tl={tl} />
    </AbsoluteFill>
  );
};

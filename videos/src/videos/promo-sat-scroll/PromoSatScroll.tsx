import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { body, C, graphPaper, heading, hold, lerp, pop, ramp } from "../../brand";
import { cue, Timeline, VideoProps, Voice } from "../../timeline";
import { Unit1600 } from "../../mascot/Unit1600";
import { Logo, Tex } from "../../ui";
import { BG, Background, Captions, card, Chip, Odometer, outC, Scene, Sfx, Sfxs, swing, Tag, W } from "../../reel";

// 9:16 promo for the planned "SAT Scroll" feature: a feed you scroll through, card by card: a bit of theory,
// a real SAT problem, a short video, and it adapts to your answers.
// Motion language copied from SaaS promo reels: light graph paper with a tilted 3D grid floor, cards that pop
// with overshoot, 2.5D tilted phone, kinetic captions with highlight boxes, odometer counters, dark/light
// switches, a spinning icon reveal and a "comment X" ending. Every beat is cued to the spoken word.
// Captions stay in y 170..440; what must be read stays in x 60..960, y 170..1470 (Reels/TikTok UI covers the rest).


// ---------- captions ----------
// One chunk on screen at a time; *starred* words get the highlight box. Word counts must match the voice.
const CAPS: Record<string, string[]> = {
  hook: ["What if *studying*", "for the *SAT*", "felt like *scrolling* your feed?"],
  intro: ["Meet *SAT Scroll,*", "the new feature in", "SAT Math Learner."],
  theory: ["Swipe up:", "*thirty seconds* of theory.", "One idea,", "no textbook."],
  task: ["Swipe again:", "a *real SAT* problem.", "Tap your answer."],
  video: ["Stuck?", "A *short video* explains it", "in under a minute."],
  adaptive: ["And it's *adaptive.*", "Get it right,", "and the next card gets *harder.*", "Miss it,", "and it *slows down*", "and teaches you again."],
  math: ["Ten minutes a day", "is about *forty cards.*", "That's *two hundred eighty*", "a week,", "without opening a book."],
  cta: ["*SAT Scroll*", "is coming soon.", "Comment *SCROLL*", "and I'll send you", "*early access.*"],
};
// Mini feed card for the scrolling wall in the hook
const KINDS = [
  { bg: C.lav, tag: "THEORY", tagBg: C.butter, ink: C.ink },
  { bg: C.white, tag: "SAT PROBLEM", tagBg: C.mint, ink: C.ink },
  { bg: C.ink, tag: "VIDEO", tagBg: C.lav, ink: C.white },
  { bg: C.butter, tag: "QUIZ", tagBg: C.rose, ink: C.ink },
  { bg: C.mint, tag: "FORMULA", tagBg: C.white, ink: C.ink },
];
const MiniCard: React.FC<{ kind: number; w: number; h: number }> = ({ kind, w, h }) => {
  const k = KINDS[kind % KINDS.length];
  const bar = (wp: number, o = 0.18) => <div style={{ height: 14, width: `${wp}%`, borderRadius: 8, background: k.ink, opacity: o }} />;
  return (
    <div style={{ width: w, height: h, borderRadius: 28, background: k.bg, border: `4px solid ${C.ink}`, padding: 22, display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box", ...(k.bg === C.lav ? graphPaper("rgba(11,10,15,.06)", 30) : {}) }}>
      <div style={{ alignSelf: "flex-start", background: k.tagBg, border: `3px solid ${C.ink}`, borderRadius: 999, padding: "3px 12px", fontFamily: heading, fontWeight: 800, fontSize: 16, color: C.ink }}>{k.tag}</div>
      {kind % KINDS.length === 2 ? (
        <div style={{ flex: 1, borderRadius: 18, background: "rgba(228,205,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 0, height: 0, borderLeft: `36px solid ${C.lav}`, borderTop: "22px solid transparent", borderBottom: "22px solid transparent", marginLeft: 10 }} />
        </div>
      ) : (
        <>
          <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 30, color: k.ink }}>{["Slope", "x + 3 = 11", "Circles", "Ratios", "Area"][kind % 5]}</div>
          {bar(90)}
          {bar(70)}
          {bar(80)}
          <div style={{ flex: 1 }} />
          {kind % KINDS.length === 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {["A", "B", "C", "D"].map((l, i) => (
                <div key={l} style={{ flex: 1, height: 34, borderRadius: 10, border: `3px solid ${C.ink}`, background: i === 1 ? C.mint : C.white, fontFamily: heading, fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>{l}</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ---------- scene 1: hook ----------
const Hook: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const tSat = cue(tl, "hook", "SAT");
  const tScroll = cue(tl, "hook", "scrolling");
  // the wall scrolls slowly, then flicks fast on "scrolling" and settles
  const offset = s * 120 + 1500 * ramp(s, tScroll - 0.05, 1.1, Easing.inOut(Easing.cubic));
  const blur = Math.sin(Math.PI * ramp(s, tScroll - 0.05, 1.1, Easing.inOut(Easing.cubic))) * 6;
  const CW = 300;
  const CH = 390;
  const GAP = 34;
  const span = (CH + GAP) * 6;
  const stamp = pop(s, tSat - 0.06, 0.4);
  const slam = stamp > 0 ? lerp(2.4, 1, ramp(s, tSat - 0.06, 0.22, Easing.in(Easing.quad))) : 0;
  const shake = s > tSat && s < tSat + 0.25 ? Math.sin(s * 90) * 10 * (1 - (s - tSat) / 0.25) : 0;
  const pill = pop(s, 0.55, 0.45);
  const wiggle = s > tScroll ? Math.sin((s - tScroll) * 18) * 4 * Math.max(0, 1 - (s - tScroll) / 0.8) : 0;

  return (
    <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
      {/* the feed wall */}
      <div style={{ position: "absolute", left: 0, top: 380, width: W, height: 1240, perspective: 1600, overflow: "hidden", maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)" }}>
        <div style={{ position: "absolute", left: (W - (CW * 3 + GAP * 2)) / 2, top: 0, transform: "rotateX(24deg) rotateZ(-8deg) scale(1.15)", transformOrigin: "50% 40%", display: "flex", gap: GAP, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
          {[0, 1, 2].map((col) => {
            const rise = ramp(s, 0.05 + col * 0.12, 0.8, swing);
            const y = (((offset * (col === 1 ? 1.15 : 1) + col * 140) % span) + span) % span;
            return (
              <div key={col} style={{ display: "flex", flexDirection: "column", gap: GAP, transform: `translateY(${-y + (1 - rise) * 1200}px)` }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <MiniCard key={i} kind={(i * 2 + col * 3) % 5} w={CW} h={CH} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* app pill */}
      {pill > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1130, transform: `translate(-50%, -50%) scale(${pill})`, display: "flex", alignItems: "center", gap: 18, background: C.white, border: `4px solid ${C.ink}`, borderRadius: 999, padding: "14px 34px 14px 16px", boxShadow: `0 10px 0 ${C.ink}` }}>
          <Logo size={72} />
          <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 42, color: C.ink }}>SAT Math Learner</div>
        </div>
      )}

      {/* stamped SAT card */}
      {stamp > 0 && (
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 800,
            transform: `translate(-50%, -50%) scale(${slam * (0.92 + 0.08 * stamp)}) rotate(${-6 + wiggle}deg)`,
            background: C.ink,
            border: `6px solid ${C.white}`,
            outline: `5px solid ${C.ink}`,
            borderRadius: 48,
            padding: "10px 60px 22px",
            boxShadow: "0 30px 60px rgba(11,10,15,.35)",
          }}
        >
          <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 250, lineHeight: 1, color: C.lav, letterSpacing: -6 }}>SAT</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- scene 2: intro (dark), spinning icon reveal ----------
const Intro: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const t0 = tl.at.intro - 0.1;
  const spin = ramp(s, t0, 1.0, Easing.out(Easing.exp));
  const icon = pop(s, t0, 0.6);
  const tag = pop(s, cue(tl, "intro", "new") - 0.05, 0.4);
  const tScroll = cue(tl, "intro", "Scroll");
  const sub = pop(s, cue(tl, "intro", "Math", 0) - 0.1, 0.45);
  const title = "SAT Scroll";
  // three cards orbiting the icon on a tilted ring
  const orbit = ramp(s, t0 + 0.2, 0.6);
  const orbiters = [0, 1, 2].map((i) => {
    const a = s * 1.4 + (i * Math.PI * 2) / 3;
    const x = Math.cos(a) * 360;
    const z = Math.sin(a);
    const y = Math.sin(a) * 90;
    return { i, x, y, z };
  });
  const iconEl = (
    <div style={{ position: "absolute", left: 540, top: 820, transform: `translate(-50%, -50%) perspective(1200px) rotateY(${(1 - spin) * 720}deg) scale(${icon})` }}>
      <div style={{ borderRadius: 96, boxShadow: "0 0 120px rgba(201,170,251,.7)", border: `6px solid ${C.ink}` }}>
        <Logo size={340} />
      </div>
      {tag > 0 && (
        <div style={{ position: "absolute", right: -70, top: -40, transform: `scale(${tag}) rotate(12deg)`, background: C.butter, border: `4px solid ${C.ink}`, borderRadius: 22, padding: "8px 24px", fontFamily: heading, fontWeight: 900, fontSize: 48, color: C.ink }}>NEW</div>
      )}
    </div>
  );
  const orb = (o: (typeof orbiters)[number]) => (
    <div key={o.i} style={{ position: "absolute", left: 540 + o.x, top: 820 + o.y, transform: `translate(-50%, -50%) scale(${(0.55 + 0.2 * o.z) * orbit}) rotate(${o.x / 40}deg)`, opacity: orbit * (0.55 + 0.45 * (o.z + 1) / 2) }}>
      <MiniCard kind={o.i} w={220} h={290} />
    </div>
  );
  return (
    <AbsoluteFill>
      {orbiters.filter((o) => o.z < 0).map(orb)}
      {iconEl}
      {orbiters.filter((o) => o.z >= 0).map(orb)}
      <div style={{ position: "absolute", left: 0, width: W, top: 1110, display: "flex", justifyContent: "center", fontFamily: heading, fontWeight: 900, fontSize: 150, letterSpacing: -4, lineHeight: 1 }}>
        {title.split("").map((ch, i) => {
          const k = pop(s, cue(tl, "intro", "SAT") - 0.1 + i * 0.045 + (i > 3 ? tScroll - cue(tl, "intro", "SAT") - 0.2 : 0), 0.35);
          return (
            <span key={i} style={{ display: "inline-block", whiteSpace: "pre", color: i > 3 ? C.lav : C.white, opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * 60}px) rotate(${(1 - k) * 20}deg)` }}>
              {ch}
            </span>
          );
        })}
      </div>
      {sub > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1340, transform: `translate(-50%, -50%) scale(${sub})`, background: "rgba(228,205,255,.12)", border: `3px solid ${C.lavDeep}`, borderRadius: 999, padding: "12px 32px", fontFamily: heading, fontWeight: 700, fontSize: 40, color: C.lav, whiteSpace: "nowrap" }}>
          in SAT Math Learner
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- scene 3: the phone feed ----------
const PW = 500;
const PH = 1010;
const BEZEL = 14;
const SW = PW - BEZEL * 2;
const SH = PH - BEZEL * 2;

const Rail: React.FC<{ dark?: boolean; liked?: number }> = ({ dark, liked = 0 }) => (
  <div style={{ position: "absolute", right: 16, bottom: 150, display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>
    {["heart", "save", "share"].map((n, i) => (
      <div key={n} style={{ width: 64, height: 64, borderRadius: 32, background: dark ? "rgba(255,255,255,.12)" : "rgba(11,10,15,.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={34} height={34} viewBox="0 0 24 24" fill={i === 0 && liked > 0 ? C.red : "none"} stroke={i === 0 && liked > 0 ? C.red : dark ? C.white : C.ink} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" style={{ transform: i === 0 ? `scale(${1 + 0.4 * Math.sin(Math.PI * Math.min(1, liked))})` : undefined }}>
          {i === 0 && <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />}
          {i === 1 && <path d="M6 3h12v18l-6-4-6 4z" />}
          {i === 2 && <path d="M4 12v7h16v-7M12 3v12M7 8l5-5 5 5" />}
        </svg>
      </div>
    ))}
  </div>
);

const StartCard: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ width: SW, height: SH, background: C.lav, ...graphPaper("rgba(11,10,15,.06)", 36), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}>
    <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 26, letterSpacing: 2, color: C.ink2 }}>TODAY'S SCROLL</div>
    <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 110, color: C.ink, lineHeight: 1 }}>40</div>
    <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 36, color: C.ink }}>cards · 10 min</div>
    <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${-Math.abs(Math.sin(s * 4)) * 22}px)` }}>
      <svg width={70} height={70} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 14l6-6 6 6" />
      </svg>
      <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 30, color: C.ink }}>Swipe up</div>
    </div>
  </div>
);

const TheoryCard: React.FC<{ s: number; t0: number }> = ({ s, t0 }) => {
  const line = ramp(s, t0 + 0.35, 0.8);
  const tri = ramp(s, t0 + 1.1, 0.5);
  const X = (x: number) => 50 + x * 40;
  const Y = (y: number) => 250 - y * 20;
  return (
    <div style={{ width: SW, height: SH, background: C.white, padding: "90px 34px 0", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 22, position: "relative" }}>
      <Tag bg={C.butter}>THEORY · 30 s</Tag>
      <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 54, color: C.ink, lineHeight: 1.05 }}>Slope of a line</div>
      <div style={{ fontFamily: body, fontWeight: 600, fontSize: 26, color: C.ink2, lineHeight: 1.35 }}>How steep a line is: how far it goes up for every step right.</div>
      <div style={{ background: C.lav, borderRadius: 24, border: `3px solid ${C.ink}`, padding: "14px 0", textAlign: "center", fontSize: 44, color: C.ink, whiteSpace: "nowrap" }}>
        <Tex tex={"m = \\dfrac{y_2 - y_1}{x_2 - x_1}"} />
        <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 26, color: C.ink2, marginTop: 4 }}>rise over run</div>
      </div>
      <svg width={SW - 68} height={290} viewBox="0 0 400 290">
        {Array.from({ length: 10 }, (_, i) => (
          <line key={"v" + i} x1={X(i)} x2={X(i)} y1={10} y2={Y(0)} stroke="rgba(124,77,219,.15)" strokeWidth={2} />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={"h" + i} x1={X(0)} x2={X(8.8)} y1={Y(i)} y2={Y(i)} stroke="rgba(124,77,219,.15)" strokeWidth={2} />
        ))}
        <line x1={X(0)} x2={X(8.8)} y1={Y(0)} y2={Y(0)} stroke={C.ink} strokeWidth={3} />
        <line x1={X(0)} x2={X(0)} y1={10} y2={Y(0)} stroke={C.ink} strokeWidth={3} />
        <line x1={X(0)} y1={Y(2)} x2={lerp(X(0), X(5), line)} y2={lerp(Y(2), Y(12), line)} stroke={C.violet} strokeWidth={7} strokeLinecap="round" />
        <g opacity={tri}>
          <line x1={X(1)} y1={Y(4)} x2={X(4)} y2={Y(4)} stroke={C.green} strokeWidth={6} strokeLinecap="round" />
          <line x1={X(4)} y1={Y(4)} x2={X(4)} y2={Y(10)} stroke="#D49B00" strokeWidth={6} strokeLinecap="round" />
          <text x={X(2.5)} y={Y(4) + 34} textAnchor="middle" style={{ fontFamily: heading, fontWeight: 800, fontSize: 26, fill: C.green }}>run</text>
          <text x={X(4) + 14} y={Y(7) + 8} style={{ fontFamily: heading, fontWeight: 800, fontSize: 26, fill: "#B07F00" }}>rise</text>
        </g>
      </svg>
      <Rail liked={ramp(s, t0 + 2.2, 0.3)} />
    </div>
  );
};

const TaskCard: React.FC<{ s: number; tap: number }> = ({ s, tap }) => {
  const picked = ramp(s, tap, 0.2);
  const xp = pop(s, tap + 0.25, 0.4);
  const opts = ["\\tfrac{1}{2}", "2", "4", "8"];
  return (
    <div style={{ width: SW, height: SH, background: C.white, padding: "90px 34px 0", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 22, position: "relative" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <Tag bg={C.mint}>SAT PROBLEM</Tag>
        <Tag bg={C.butter}>MEDIUM</Tag>
      </div>
      <div style={{ fontFamily: body, fontWeight: 700, fontSize: 34, color: C.ink, lineHeight: 1.35, marginTop: 6 }}>
        A line passes through the points <Tex tex="(0, 2)" /> and <Tex tex="(4, 10)" />. What is the slope of the line?
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 10, marginRight: 70 }}>
        {opts.map((o, i) => {
          const isB = i === 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "14px 18px",
                borderRadius: 22,
                border: `3px solid ${C.ink}`,
                background: isB && picked > 0 ? C.mint : C.white,
                boxShadow: `0 ${isB ? lerp(6, 2, picked) : 6}px 0 ${C.ink}`,
                transform: `translateY(${isB ? picked * 4 : 0}px) scale(${isB ? 1 + 0.05 * Math.sin(Math.PI * picked) : 1})`,
                opacity: !isB && picked > 0 ? lerp(1, 0.45, picked) : 1,
              }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 14, background: isB && picked > 0 ? C.green : C.lav, color: isB && picked > 0 ? C.white : C.ink, fontFamily: heading, fontWeight: 900, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isB && picked > 0.5 ? "✓" : "ABCD"[i]}
              </div>
              <div style={{ fontSize: 38, color: C.ink }}>
                <Tex tex={o} />
              </div>
            </div>
          );
        })}
      </div>
      {xp > 0 && (
        <div style={{ position: "absolute", left: "50%", bottom: 120, transform: `translateX(-50%) scale(${xp}) rotate(-4deg)`, background: C.butter, border: `4px solid ${C.ink}`, borderRadius: 22, padding: "10px 26px", fontFamily: heading, fontWeight: 900, fontSize: 42, color: C.ink, whiteSpace: "nowrap" }}>
          Correct! +10 XP
        </div>
      )}
      <Rail />
    </div>
  );
};

const VideoCard: React.FC<{ s: number; t0: number; tl: Timeline }> = ({ s, t0, tl }) => {
  const playBtn = 1 - ramp(s, t0 + 0.5, 0.3);
  const prog = interpolate(s, [t0 + 0.5, t0 + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const secs = Math.floor(prog * 48);
  return (
    <div style={{ width: SW, height: SH, background: C.ink, padding: "90px 0 0", boxSizing: "border-box", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "0 34px", display: "flex", gap: 12 }}>
        <Tag bg={C.lav}>VIDEO · 0:48</Tag>
      </div>
      <div style={{ padding: "18px 34px 0", fontFamily: heading, fontWeight: 900, fontSize: 44, color: C.white, lineHeight: 1.1 }}>Why the slope is 2</div>
      <div style={{ position: "relative", margin: "26px 20px 0", height: 560, borderRadius: 30, overflow: "hidden", background: C.lav, ...graphPaper("rgba(11,10,15,.07)", 36) }}>
        <div style={{ position: "absolute", left: 30, top: 34, background: C.white, border: `3px solid ${C.ink}`, borderRadius: 20, padding: "10px 18px", fontSize: 38, color: C.ink }}>
          <Tex tex={"\\dfrac{10 - 2}{4 - 0} = \\dfrac{8}{4} = 2"} />
        </div>
        <Unit1600
          s={s}
          tl={tl}
          enter={t0 - 0.2}
          width={290}
          keys={[
            { t: 0, expr: "happy", arms: "point", gaze: [-0.4, -0.4] },
            { t: t0 + 1.4, expr: "smug", arms: "wave", gaze: [0, 0] },
          ]}
          style={{ position: "absolute", left: 130, top: 200 }}
        />
        {playBtn > 0.01 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(11,10,15,${0.35 * playBtn})` }}>
            <div style={{ width: 140, height: 140, borderRadius: 70, background: C.white, border: `4px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.6 + 0.4 * playBtn})`, opacity: playBtn }}>
              <div style={{ width: 0, height: 0, borderLeft: `50px solid ${C.ink}`, borderTop: "30px solid transparent", borderBottom: "30px solid transparent", marginLeft: 14 }} />
            </div>
          </div>
        )}
      </div>
      <div style={{ margin: "26px 20px 0", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, height: 12, borderRadius: 6, background: "rgba(255,255,255,.18)", overflow: "hidden" }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", background: C.butter }} />
        </div>
        <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 26, color: C.lav, fontVariantNumeric: "tabular-nums" }}>0:{String(secs).padStart(2, "0")}</div>
      </div>
      <Rail dark />
    </div>
  );
};

const Finger: React.FC<{ x: number; y: number; k: number; press: number }> = ({ x, y, k, press }) =>
  k <= 0.01 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${1 - 0.18 * press})`, opacity: k }}>
      <div style={{ width: 96, height: 96, borderRadius: 48, background: "rgba(255,255,255,.55)", border: `5px solid ${C.ink}`, boxShadow: "0 10px 30px rgba(11,10,15,.3)" }} />
      {press > 0 && <div style={{ position: "absolute", left: 48, top: 48, width: 96 + 120 * press, height: 96 + 120 * press, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `5px solid ${C.violet}`, opacity: 1 - press }} />}
    </div>
  );

const PhoneScene: React.FC<{ s: number; tl: Timeline; swipes: number[]; tap: number }> = ({ s, tl, swipes, tap }) => {
  const t0 = tl.at.theory - 0.15;
  const enter = ramp(s, t0, 0.7, swing);
  const idx = swipes.reduce((a, t) => a + ramp(s, t, 0.5, Easing.out(Easing.back(1.1))), 0);
  // the phone turns a little toward each new card (2.5D)
  const ry = lerp(-14, 12, (Math.sin(idx * Math.PI * 0.9) + 1) / 2) + (1 - enter) * 30;
  const rx = 7 + (1 - enter) * 25;
  const top = 450 + (1 - enter) * 900;
  // swipe gesture: the finger rises from the lower screen just before each swipe
  let finger = { x: 0, y: 0, k: 0, press: 0 };
  for (const t of swipes) {
    const p = ramp(s, t - 0.3, 0.45, Easing.inOut(Easing.cubic));
    const vis = hold(s, t - 0.3, t + 0.3, 0.15);
    if (vis > 0.01) finger = { x: 560, y: lerp(1300, 900, p), k: vis, press: 0 };
  }
  const tapVis = hold(s, tap - 0.4, tap + 0.5, 0.2);
  if (tapVis > 0.01) finger = { x: lerp(700, 560, ramp(s, tap - 0.4, 0.35)), y: lerp(1200, 975, ramp(s, tap - 0.4, 0.35)), k: tapVis, press: ramp(s, tap, 0.45) };

  const chipTheory = pop(s, cue(tl, "theory", "thirty") - 0.05) * (1 - ramp(s, swipes[1] - 0.2, 0.2));
  const chipTask = pop(s, cue(tl, "task", "real") - 0.05) * (1 - ramp(s, swipes[2] - 0.2, 0.2));
  const chipVideo = pop(s, cue(tl, "video", "under") - 0.05);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: (W - PW) / 2, top, width: PW, height: PH, perspective: 2200 }}>
        <div
          style={{
            width: PW,
            height: PH,
            borderRadius: 72,
            background: C.ink,
            padding: BEZEL,
            boxSizing: "border-box",
            transform: `rotateY(${ry}deg) rotateX(${rx}deg)`,
            boxShadow: `${-ry * 2}px 50px 80px rgba(11,10,15,.35)`,
          }}
        >
          <div style={{ width: SW, height: SH, borderRadius: 58, overflow: "hidden", position: "relative", background: C.white }}>
            <div style={{ transform: `translateY(${-idx * SH}px)` }}>
              <StartCard s={s} />
              <TheoryCard s={s} t0={swipes[0]} />
              <TaskCard s={s} tap={tap} />
              <VideoCard s={s} t0={swipes[2]} tl={tl} />
            </div>
            {/* status bar + story-style progress */}
            <div style={{ position: "absolute", left: 0, top: 0, width: SW, padding: "20px 40px 0", boxSizing: "border-box", display: "flex", justifyContent: "space-between", fontFamily: heading, fontWeight: 700, fontSize: 24, color: idx > 2.5 ? C.white : C.ink }}>
              <span>9:41</span>
              <span style={{ width: 120, height: 34, borderRadius: 17, background: C.ink, marginTop: -4 }} />
              <span>100%</span>
            </div>
            <div style={{ position: "absolute", left: 30, right: 30, top: 66, display: "flex", gap: 8 }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ flex: 1, height: 7, borderRadius: 4, background: idx > 2.5 ? "rgba(255,255,255,.25)" : "rgba(11,10,15,.12)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.max(0, Math.min(1, idx - n + 1)) * 100}%`, background: C.violet }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Chip k={chipTheory} x={170} y={760} bg={C.butter} rot={-7}>
        ⏱ 30 s
      </Chip>
      <Chip k={chipTask} x={880} y={640} bg={C.mint} rot={6} size={36}>
        Real SAT format
      </Chip>
      <Chip k={chipVideo} x={190} y={1250} bg={C.lav} rot={-5}>
        &lt; 1 min
      </Chip>
      <Finger {...finger} />
    </AbsoluteFill>
  );
};

// ---------- scene 4: adaptive (dark), difficulty gauge ----------
const Adaptive: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const tRight = cue(tl, "adaptive", "right");
  const tHard = cue(tl, "adaptive", "harder");
  const tMiss = cue(tl, "adaptive", "Miss");
  const tSlow = cue(tl, "adaptive", "slows");
  const tTeach = cue(tl, "adaptive", "teaches");
  const up = ramp(s, tHard - 0.25, 0.7, Easing.out(Easing.back(2.2)));
  const down = ramp(s, tSlow - 0.2, 0.8, Easing.out(Easing.back(2.2)));
  const v = 0.5 + 0.36 * up - 0.62 * down;
  const idle = Math.sin(s * 7) * 0.008;
  const ang = -90 + (v + idle) * 180;
  const gIn = pop(s, tl.at.adaptive - 0.1, 0.6);
  const CX = 540;
  const CY = 980;
  const R = 330;
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [CX + R * Math.cos(((a - 90) * Math.PI) / 180), CY + R * Math.sin(((a - 90) * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
  };
  const levelRoll = s < tHard - 0.1 ? 3 : s < tSlow - 0.05 ? lerp(3, 4, ramp(s, tHard - 0.1, 0.45, swing)) : lerp(4, 2, ramp(s, tSlow - 0.05, 0.6, swing));
  const right = pop(s, tRight - 0.08);
  const miss = pop(s, tMiss - 0.08);
  const teach = pop(s, tTeach - 0.1, 0.5);
  const badgeUp = hold(s, tHard - 0.05, tMiss - 0.05, 0.15);
  const badgeDown = ramp(s, tSlow, 0.3);
  const labels = [
    { t: "EASY", a: -62, c: C.mint },
    { t: "MEDIUM", a: 0, c: C.butter },
    { t: "HARD", a: 62, c: C.rose },
  ];

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${gIn})`, transformOrigin: `${CX}px ${CY}px` }}>
        <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path d={arc(-90, -31)} stroke={C.mint} strokeWidth={56} fill="none" />
          <path d={arc(-29, 29)} stroke={C.butter} strokeWidth={56} fill="none" />
          <path d={arc(31, 90)} stroke={C.rose} strokeWidth={56} fill="none" />
          {Array.from({ length: 19 }, (_, i) => {
            const a = ((-90 + i * 10 - 90) * Math.PI) / 180;
            return <line key={i} x1={CX + (R - 50) * Math.cos(a)} y1={CY + (R - 50) * Math.sin(a)} x2={CX + (R - (i % 3 === 0 ? 80 : 66)) * Math.cos(a)} y2={CY + (R - (i % 3 === 0 ? 80 : 66)) * Math.sin(a)} stroke="rgba(228,205,255,.5)" strokeWidth={4} strokeLinecap="round" />;
          })}
          <g transform={`rotate(${ang} ${CX} ${CY})`}>
            <path d={`M ${CX - 16} ${CY} L ${CX} ${CY - R + 40} L ${CX + 16} ${CY} Z`} fill={C.white} />
          </g>
          <circle cx={CX} cy={CY} r={34} fill={C.white} stroke={C.ink} strokeWidth={6} />
        </svg>
        {labels.map((l) => {
          const a = ((l.a - 90) * Math.PI) / 180;
          return (
            <div key={l.t} style={{ position: "absolute", left: CX + (R + 110) * Math.cos(a), top: CY + (R + 70) * Math.sin(a) - (l.a === 0 ? 0 : 30), transform: "translate(-50%, -50%)", fontFamily: heading, fontWeight: 800, fontSize: 34, color: l.c, letterSpacing: 2 }}>
              {l.t}
            </div>
          );
        })}
        {/* level counter under the gauge */}
        <div style={{ position: "absolute", left: CX, top: CY + 110, transform: "translate(-50%, 0)", display: "flex", alignItems: "center", gap: 18, background: "rgba(228,205,255,.1)", border: `3px solid ${C.lavDeep}`, borderRadius: 28, padding: "8px 30px" }}>
          <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 40, color: C.lav, letterSpacing: 2 }}>LEVEL</div>
          <div style={{ height: 96, overflow: "hidden", fontFamily: heading, fontWeight: 900, fontSize: 92, color: C.white, width: 64 }}>
            <div style={{ transform: `translateY(${-(levelRoll - 1) * 96}px)` }}>
              {[1, 2, 3, 4, 5].map((d) => (
                <div key={d} style={{ height: 96, lineHeight: "96px", textAlign: "center" }}>{d}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {badgeUp > 0.01 && (
        <Chip k={badgeUp} x={830} y={600} bg={C.rose} rot={8}>
          ↑ harder
        </Chip>
      )}
      {badgeDown > 0.01 && (
        <Chip k={badgeDown} x={250} y={600} bg={C.mint} rot={-8}>
          ↓ slower
        </Chip>
      )}
      <Chip k={right * (1 - ramp(s, tMiss - 0.1, 0.2))} x={260} y={1330} bg={C.mint} rot={-4} size={44}>
        ✓ Correct
      </Chip>
      <Chip k={miss} x={820} y={1330} bg={C.rose} rot={4} size={44}>
        ✗ Missed
      </Chip>
      {teach > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1460, transform: `translate(-50%, -50%) scale(${teach}) translateY(${(1 - teach) * 80}px)`, ...card, background: C.lav, padding: "18px 30px", display: "flex", alignItems: "center", gap: 20, whiteSpace: "nowrap" }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderLeft: `24px solid ${C.lav}`, borderTop: "15px solid transparent", borderBottom: "15px solid transparent", marginLeft: 6 }} />
          </div>
          <div>
            <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: C.ink2 }}>NEXT CARD</div>
            <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 40, color: C.ink }}>Slope, explained again</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- scene 5: the numbers ----------
const Numbers: React.FC<{ s: number; tl: Timeline }> = ({ s, tl }) => {
  const tTen = cue(tl, "math", "Ten");
  const tForty = cue(tl, "math", "forty");
  const tWeek = cue(tl, "math", "two");
  const tBook = cue(tl, "math", "book");
  const r1 = pop(s, tTen - 0.1, 0.5);
  const r2 = pop(s, tForty - 0.25, 0.5);
  const r3 = pop(s, tWeek - 0.25, 0.5);
  const clock = ramp(s, tTen, 1.2, Easing.inOut(Easing.cubic));
  const n40 = 40 * ramp(s, tForty - 0.2, 1.0, outC);
  const n280 = 280 * ramp(s, tWeek - 0.1, 1.6, outC);
  const book = pop(s, tBook - 0.15, 0.45);
  const row = (k: number, y: number, rot: number, extra: React.CSSProperties, children: React.ReactNode) =>
    k <= 0 ? null : (
      <div style={{ position: "absolute", left: 70, width: 940, top: y, transform: `translateX(${(1 - k) * 300}px) rotate(${rot}deg) scale(${0.85 + 0.15 * k})`, opacity: Math.min(1, k * 2), ...card, padding: "28px 36px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 34, ...extra }}>
        {children}
      </div>
    );
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <AbsoluteFill>
      {row(
        r1,
        480,
        -2,
        { background: C.white },
        <>
          <svg width={150} height={150} viewBox="0 0 100 100">
            <circle cx={50} cy={50} r={44} fill={C.lav} stroke={C.ink} strokeWidth={5} />
            <path d={`M 50 50 L 50 6 A 44 44 0 ${clock * (1 / 6) > 0.5 ? 1 : 0} 1 ${50 + 44 * Math.sin(clock * (Math.PI / 3))} ${50 - 44 * Math.cos(clock * (Math.PI / 3))} Z`} fill={C.violet} opacity={0.8} />
            <line x1={50} y1={50} x2={50 + 34 * Math.sin(clock * Math.PI * 4)} y2={50 - 34 * Math.cos(clock * Math.PI * 4)} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
            <circle cx={50} cy={50} r={6} fill={C.ink} />
          </svg>
          <div>
            <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 96, color: C.ink, lineHeight: 1 }}>10 min</div>
            <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 38, color: C.ink2 }}>a day</div>
          </div>
        </>,
      )}
      {row(
        r2,
        760,
        1.5,
        { background: C.butter },
        <>
          <div style={{ display: "flex", alignItems: "baseline", fontFamily: heading, fontWeight: 900, fontSize: 120, color: C.ink, lineHeight: 1 }}>
            <span style={{ fontSize: 80, marginRight: 8 }}>≈</span>
            <Odometer n={n40} digits={2} h={130} />
          </div>
          <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 52, color: C.ink, lineHeight: 1.05 }}>
            cards
            <div style={{ fontWeight: 700, fontSize: 32, color: C.ink2 }}>about 15 s each</div>
          </div>
        </>,
      )}
      {row(
        r3,
        1050,
        -1.5,
        { background: C.ink, flexDirection: "column", alignItems: "stretch", gap: 20, boxShadow: `0 10px 0 ${C.violet}` },
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Odometer n={n280} digits={3} h={150} style={{ fontFamily: heading, fontWeight: 900, fontSize: 150, color: C.lav, lineHeight: 1 }} />
            <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 52, color: C.white, lineHeight: 1.05 }}>
              cards
              <div style={{ color: C.butter }}>a week</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {days.map((d, i) => {
              const k = ramp(s, tWeek - 0.1 + i * 0.2, 0.25, swing);
              return (
                <div key={i} style={{ flex: 1, height: 74, borderRadius: 18, border: `3px solid ${C.lavDeep}`, background: k > 0.5 ? C.lav : "transparent", transform: `scale(${0.85 + 0.15 * k})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: heading, fontWeight: 800, fontSize: 30, color: k > 0.5 ? C.ink : C.lav }}>
                  {k > 0.5 ? "40" : d}
                </div>
              );
            })}
          </div>
        </>,
      )}
      <Chip k={book} x={740} y={1455} bg={C.rose} rot={6} size={40}>
        <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round">
          <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 5v16" />
          <path d="M2 2l20 20" stroke={C.red} />
        </svg>
        0 textbooks
      </Chip>
    </AbsoluteFill>
  );
};

// ---------- scene 6: call to action ----------
const WORD = "SCROLL";
const Cta: React.FC<{ s: number; tl: Timeline; typeAt: number[]; sendAt: number }> = ({ s, tl, typeAt, sendAt }) => {
  const t0 = tl.at.cta - 0.1;
  const head = pop(s, t0, 0.5);
  const stamp = pop(s, cue(tl, "cta", "coming") - 0.1, 0.35);
  const slam = stamp > 0 ? lerp(2.2, 1, ramp(s, cue(tl, "cta", "coming") - 0.1, 0.2, Easing.in(Easing.quad))) : 0;
  const bar = pop(s, cue(tl, "cta", "Comment") - 0.3, 0.5);
  const typed = typeAt.filter((t) => s >= t).length;
  const sent = ramp(s, sendAt, 0.25);
  const notif = ramp(s, sendAt + 0.25, 0.55, Easing.out(Easing.back(1.4)));
  const tAccess = cue(tl, "cta", "access");
  const pulse = s > tAccess ? 1 + 0.06 * Math.sin((s - tAccess) * 10) : 1;
  const caret = Math.floor(s * 2.5) % 2 === 0;
  return (
    <AbsoluteFill>
      {/* app + feature name */}
      <div style={{ position: "absolute", left: 540, top: 600, transform: `translate(-50%, -50%) scale(${head})`, display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ borderRadius: 54, border: `5px solid ${C.ink}`, transform: `rotate(${Math.sin(s * 2) * 4}deg)` }}>
          <Logo size={190} />
        </div>
        <div style={{ fontFamily: heading, fontWeight: 900, fontSize: 112, lineHeight: 0.95, color: C.ink, letterSpacing: -3 }}>
          SAT
          <br />
          <span style={{ color: C.violet }}>Scroll</span>
        </div>
      </div>
      {stamp > 0 && (
        <div style={{ position: "absolute", left: 540, top: 820, transform: `translate(-50%, -50%) scale(${slam}) rotate(-5deg)`, background: C.butter, border: `5px solid ${C.ink}`, borderRadius: 24, padding: "10px 40px", fontFamily: heading, fontWeight: 900, fontSize: 64, color: C.ink, letterSpacing: 3, whiteSpace: "nowrap", boxShadow: `0 10px 0 ${C.ink}` }}>
          COMING SOON
        </div>
      )}

      {/* notification that answers the comment */}
      {notif > 0.01 && (
        <div style={{ position: "absolute", left: 60, width: 960, top: lerp(860, 990, notif), opacity: Math.min(1, notif * 2), transform: `scale(${0.9 + 0.1 * notif})`, ...card, borderRadius: 40, padding: "24px 28px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 24 }}>
          <Logo size={100} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: body, fontWeight: 700, fontSize: 26, color: C.ink2 }}>SAT Math Learner · now</div>
            <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 38, color: C.ink }}>You're on the SAT Scroll list</div>
          </div>
          <div style={{ background: C.ink, color: C.butter, borderRadius: 20, padding: "16px 24px", fontFamily: heading, fontWeight: 900, fontSize: 34, transform: `scale(${pulse})` }}>Access</div>
        </div>
      )}

      {/* comment bar */}
      {bar > 0 && (
        <div style={{ position: "absolute", left: 60, width: 960, top: 1250, transform: `translateY(${(1 - bar) * 200}px)`, opacity: Math.min(1, bar * 2), display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 96, height: 96, borderRadius: 48, background: C.lav, border: `4px solid ${C.ink}`, flex: "none" }} />
          <div style={{ flex: 1, height: 104, borderRadius: 52, background: C.white, border: `4px solid ${C.ink}`, display: "flex", alignItems: "center", padding: "0 20px 0 36px", boxShadow: `0 8px 0 ${C.ink}` }}>
            <div style={{ flex: 1, fontFamily: heading, fontWeight: 900, fontSize: 52, color: typed ? C.ink : "rgba(11,10,15,.35)", letterSpacing: typed ? 3 : 0 }}>
              {typed ? (sent > 0.5 ? "" : WORD.slice(0, typed)) : <span style={{ fontWeight: 600, fontSize: 40 }}>Add a comment…</span>}
              {sent <= 0.5 && caret && typed > 0 && <span style={{ color: C.violet, fontWeight: 400 }}>|</span>}
            </div>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: typed === WORD.length ? C.violet : "rgba(11,10,15,.12)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.2 * Math.sin(Math.PI * sent)})` }}>
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
          </div>
        </div>
      )}
      {/* the sent comment flying up */}
      {sent > 0 && sent < 1 && (
        <div style={{ position: "absolute", left: 540, top: lerp(1300, 1100, sent), transform: "translate(-50%, -50%)", opacity: 1 - sent, fontFamily: heading, fontWeight: 900, fontSize: 60, color: C.violet, letterSpacing: 3 }}>{WORD}</div>
      )}
    </AbsoluteFill>
  );
};

export const PromoSatScroll: React.FC<VideoProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  if (!tl) return null;
  const s = frame / fps;
  const at = tl.at;

  const b1 = at.intro - 0.15;
  const b2 = at.theory - 0.15;
  const b3 = at.adaptive - 0.12;
  const b4 = at.math - 0.12;
  const b5 = at.cta - 0.12;
  const end = tl.total;
  const dark = hold(s, b1 + 0.2, b2 + 0.15, 0.3) + hold(s, b3 + 0.2, b4 + 0.15, 0.3);

  // phone beats
  const swipes = [cue(tl, "theory", "up") - 0.1, cue(tl, "task", "again") - 0.1, cue(tl, "video", "Stuck") + 0.05];
  const tap = cue(tl, "task", "answer") + 0.05;
  // comment typing: SCROLL is typed while the voice says it, then sent on "send"
  const tComment = cue(tl, "cta", "Comment");
  const typeAt = WORD.split("").map((_, i) => tComment + 0.25 + i * 0.1);
  const sendAt = cue(tl, "cta", "send") - 0.1;

  const ticks = (from: number, dur: number, n: number) => Array.from({ length: n }, (_, i) => ({ t: from + dur * Math.pow(i / n, 1.6), src: "tick", v: 0.35 }));
  const sfx: Sfx[] = [
    { t: 0.05, src: "whoosh", v: 0.45 },
    { t: 0.55, src: "pop" },
    { t: cue(tl, "hook", "SAT") - 0.06, src: "stamp", v: 0.8 },
    { t: cue(tl, "hook", "scrolling") - 0.1, src: "whoosh", v: 0.6 },
    ...[b1, b2, b3, b4, b5].map((t) => ({ t: t - 0.05, src: "whoosh", v: 0.55 })),
    { t: cue(tl, "intro", "new") - 0.05, src: "pop" },
    { t: cue(tl, "intro", "Scroll") - 0.1, src: "pop" },
    { t: cue(tl, "intro", "Math") - 0.1, src: "pop", v: 0.35 },
    ...swipes.map((t) => ({ t: t - 0.05, src: "whoosh", v: 0.5 })),
    { t: cue(tl, "theory", "thirty") - 0.05, src: "pop" },
    { t: cue(tl, "task", "real") - 0.05, src: "pop" },
    { t: tap, src: "tap", v: 0.7 },
    { t: tap + 0.1, src: "ding", v: 0.55 },
    { t: cue(tl, "video", "under") - 0.05, src: "pop" },
    { t: cue(tl, "adaptive", "right") - 0.08, src: "ding", v: 0.5 },
    { t: cue(tl, "adaptive", "harder") - 0.25, src: "whoosh", v: 0.35 },
    { t: cue(tl, "adaptive", "Miss") - 0.08, src: "buzz", v: 0.55 },
    { t: cue(tl, "adaptive", "teaches") - 0.1, src: "pop" },
    { t: cue(tl, "math", "Ten") - 0.1, src: "pop" },
    { t: cue(tl, "math", "forty") - 0.25, src: "pop" },
    ...ticks(cue(tl, "math", "forty") - 0.2, 0.9, 12),
    { t: cue(tl, "math", "two") - 0.25, src: "pop" },
    ...ticks(cue(tl, "math", "two") - 0.1, 1.4, 18),
    { t: cue(tl, "math", "book") - 0.15, src: "pop" },
    { t: cue(tl, "cta", "coming") - 0.1, src: "stamp", v: 0.75 },
    { t: tComment - 0.3, src: "pop", v: 0.4 },
    ...typeAt.map((t) => ({ t, src: "key", v: 0.6 })),
    { t: sendAt, src: "tap", v: 0.7 },
    { t: sendAt + 0.25, src: "notif", v: 0.6 },
  ];

  const musicVol = (f: number) => {
    const t = f / fps;
    const fadeOut = interpolate(f, [durationInFrames - 45, durationInFrames - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return 0.16 * Math.min(1, t / 0.4) * fadeOut;
  };

  return (
    <AbsoluteFill style={{ background: BG }}>
      <Background s={s} dark={dark} />
      <Scene s={s} from={0} to={b1}>
        <Hook s={s} tl={tl} />
      </Scene>
      <Scene s={s} from={b1} to={b2}>
        <Intro s={s} tl={tl} />
      </Scene>
      <Scene s={s} from={b2} to={b3}>
        <PhoneScene s={s} tl={tl} swipes={swipes} tap={tap} />
      </Scene>
      <Scene s={s} from={b3} to={b4}>
        <Adaptive s={s} tl={tl} />
      </Scene>
      <Scene s={s} from={b4} to={b5}>
        <Numbers s={s} tl={tl} />
      </Scene>
      <Scene s={s} from={b5} to={end} last>
        <Cta s={s} tl={tl} typeAt={typeAt} sendAt={sendAt} />
      </Scene>
      <Captions s={s} tl={tl} dark={dark} caps={CAPS} />

      <Voice tl={tl} />
      <Audio src={staticFile("music/beat.wav")} volume={musicVol} />
      <Sfxs list={sfx} />
    </AbsoluteFill>
  );
};

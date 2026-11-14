// Drawing code for the SAT Learner store creatives (creatives.html):
// icons, app screens in iOS points, device frames, the slide layout, header, listing and Play feature graphic.
// Screens follow the app as redesigned in Nov 2026 (components/ds, palette.ts, ChipTabBar).

/* =============================== icons (lucide, as in the app) =============================== */
const I = (d, s = 22, w = 2, c = "currentColor") => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" stroke="${c}" stroke-width="${w}">${d}</svg>`;
const P = {
  home: `<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>`,
  book: `<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>`,
  checkSq: `<path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5"/><path d="m9 11 3 3L22 4"/>`,
  user: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  cal: `<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/>`,
  timer: `<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>`,
  play: `<path d="M6 3l14 9-14 9z" fill="currentColor"/>`,
  arrow: `<path d="M5 12h14m-7-7 7 7-7 7"/>`,
  plus: `<path d="M5 12h14M12 5v14"/>`,
  tick: `<path d="M20 6 9 17l-5-5"/>`,
  bell: `<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>`,
  search: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
  bulb: `<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>`,
  bookmark: `<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>`,
  left: `<path d="m15 18-6-6 6-6"/>`,
  right: `<path d="m9 18 6-6-6-6"/>`,
  trophy: `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>`,
  help: `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>`,
  redo: `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>`,
  flame: `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`,
  target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
  crown: `<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>`,
  chart: `<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>`,
  zap: `<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>`,
  star: `<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>`,
  more: `<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>`,
  x: `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`,
  grid: `<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`,
  arrowLeft: `<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>`,
  pencil: `<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>`,
  settings: `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`,
  flag: `<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>`,
};
const ic = (name, s, w, c) => I(P[name], s, w, c);
const INK = "#0B0A0F";

/* =============================== status bars =============================== */
const iosIcons = (c) => `<span class="r">
  <svg width="19" height="12" viewBox="0 0 19 12"><g fill="${c}"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></g></svg>
  <svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.2c2.4 0 4.6.9 6.2 2.5l1.2-1.2A10.4 10.4 0 008.5.5 10.4 10.4 0 001.1 3.5l1.2 1.2a8.7 8.7 0 016.2-2.5zm0 3.4c1.5 0 2.8.6 3.8 1.5l1.2-1.2a7 7 0 00-10 0l1.2 1.2c1-.9 2.3-1.5 3.8-1.5zm0 3.4c.6 0 1.1.2 1.5.6L8.5 11.1 7 9.6c.4-.4.9-.6 1.5-.6z" fill="${c}"/></svg>
  <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="${c}" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2" fill="${c}"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="${c}" opacity=".5"/></svg></span>`;
const androidIcons = (c) => `<span class="r">
  <svg width="16" height="14" viewBox="0 0 16 14"><path d="M8 13.5L0 3.6A12.6 12.6 0 0116 3.6z" fill="${c}"/></svg>
  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M14 0v14H0z" fill="${c}"/></svg>
  <svg width="9" height="15" viewBox="0 0 9 15"><rect x="0" y="1.5" width="9" height="13.5" rx="1.5" fill="${c}"/><rect x="2.5" y="0" width="4" height="2" rx=".5" fill="${c}"/></svg></span>`;
const statusBar = (kind) => kind === "android"
  ? `<div class="sb android" style="color:${INK}"><span>9:41</span>${androidIcons(INK)}</div>`
  : `<div class="sb ${kind === "ipad" ? "ipad" : ""}" style="color:${INK}"><span>${kind === "ipad" ? "9:41 &nbsp;Thu Nov 5" : "9:41"}</span>${iosIcons(INK)}</div>`;

/* =============================== shared app parts =============================== */
const TABS = [["Home", "home"], ["Course", "book"], ["Tests", "checkSq"], ["Profile", "user"]];
const tabBar = (active, kind) => `<div class="tabbar" style="padding-bottom:${kind === "android" ? 20 : 30}px${kind === "ipad" ? ";padding-left:60px;padding-right:60px" : ""}"><div class="row">
  ${TABS.map(([t, i]) => t === active ? `<div class="t on">${ic(i, 22, 2.3)}${t}</div>` : `<div class="t">${ic(i, 22, 1.9)}</div>`).join("")}</div></div>`;
const tile = (icon, tone, s = 40, r = 13, is = 19) => `<span class="icT ${tone}" style="width:${s}px;height:${s}px;border-radius:${r}px">${ic(icon, is, 2)}</span>`;
const round = (icon, bg = "#fff", size = 46) => `<span class="icT" style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:1.5px solid var(--line)">${ic(icon, Math.round(size * .44), 1.9)}</span>`;

// Line art used on the pastel cards (components/art)
const ART = {
  slope: (w = 136) => `<svg width="${w}" height="${w * .94}" viewBox="0 0 170 160" fill="none" stroke="#0B0A0F" stroke-width="2.4" stroke-linecap="round">
    <path d="M30 140V20M20 120h140"/><path d="M30 20l-5 8M30 20l5 8M160 120l-8-5M160 120l-8 5"/><path d="M36 132 150 36" stroke-width="4"/>
    <circle cx="72" cy="102" r="7" fill="#fff"/><circle cx="118" cy="63" r="7" fill="#0B0A0F"/><path d="M72 102h46v-39" stroke-dasharray="4 6"/>
    <text x="122" y="104" font-family="Outfit" font-size="16" font-weight="600" fill="#0B0A0F" stroke="none">Δx</text>
    <g transform="translate(128 6)"><rect width="38" height="24" rx="12" fill="#0B0A0F" stroke="none"/><text x="19" y="16.5" text-anchor="middle" font-family="Outfit" font-size="12" font-weight="700" fill="#FEE7A6" stroke="none">y=mx</text></g></svg>`,
  parabola: (w = 360, h = 160) => `<svg width="${w}" height="${h}" viewBox="0 0 360 160" fill="none" stroke="#0B0A0F" stroke-linecap="round">
    <path d="M20 132h320M180 12v140" stroke-width="2" opacity=".45"/>
    <path d="M70 18 C110 150 250 150 290 18" stroke-width="4.5"/>
    <path d="M60 140 L330 40" stroke-width="3.5" stroke-dasharray="10 9"/>
    <circle cx="180" cy="117" r="8" fill="#FEE7A6" stroke-width="3"/><circle cx="263" cy="70" r="8" fill="#0B0A0F" stroke-width="3"/>
    <g transform="translate(206 120)"><rect width="74" height="26" rx="13" fill="#0B0A0F" stroke="none"/><text x="37" y="18" text-anchor="middle" font-family="Outfit" font-size="13" font-weight="700" fill="#E4CDFF" stroke="none">y = x² − 4</text></g></svg>`,
  stopwatch: (s = 104) => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none" stroke="#0B0A0F" stroke-width="3.2" stroke-linecap="round">
    <circle cx="48" cy="56" r="32" fill="#fff"/><path d="M40 14h16M48 14v10M76 26l6-6"/><path d="M48 56V36M48 56l12 8" stroke-width="4"/><circle cx="48" cy="56" r="3.5" fill="#0B0A0F"/></svg>`,
};

/* =============================== app screens (in points) =============================== */
let LIFTED = false; // true while drawing a slide's device: its liftable block is hidden and drawn bigger on top
// Wraps the block a slide lifts out of the screen. grow = size of the lifted copy, pad = frame around it
const lift = (style, { grow = 1.3, pad = 14, r = 28, head = "", top = false } = {}) =>
  LIFTED ? `data-lift="${grow}" data-pad="${pad}" data-r="${r}" data-head="${head}" data-top="${top ? 1 : ""}" style="${style};visibility:hidden"` : `style="${style}"`;
// Extra row a lifted copy starts with (the planner's day joined with its study reminder)
const LIFT_HEAD = {
  reminder: () => `<div style="display:flex;align-items:center;gap:12px;padding:2px 2px 14px;margin-bottom:12px;border-bottom:1px solid var(--line)"><span class="icT lav" style="width:44px;height:44px;border-radius:14px">${ic("bell", 21, 2)}</span>
    <div style="flex:1"><div style="font-weight:800;font-size:16.5px">Time to study</div><div class="cap">Daily reminder</div></div><span class="tag ink" style="font-size:12.5px">7:00 PM</span></div>`,
};
const CHAPTERS = [
  ["Linear Equations", 100, 6, 3], ["Systems of Equations", 100, 5, 2], ["Linear Functions", 62, 6, 3],
  ["Quadratic Functions", 18, 7, 3], ["Ratios and Percentages", 0, 5, 2], ["Exponential Functions", 0, 6, 2],
  ["Statistics and Data", 0, 5, 2], ["Geometry and Trigonometry", 0, 8, 3],
];
const SCREENS = {
  // Home tab (app/(tabs)/index.tsx)
  home: (W, H, kind) => {
    const ipad = kind === "ipad";
    const days = [["Su", 1], ["Mo", 2, "dot"], ["Tu", 3, "dot"], ["We", 4, "dot"], ["Th", 5, "on"], ["Fr", 6], ["Sa", 7]];
    return `<div class="scroll">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><div class="d" style="font-size:19px">Hi, Alex</div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:3px" class="cap"><span class="tag ink" style="padding:2px 7px;font-size:10px;letter-spacing:.08em">PRO</span>1,240 points</div></div>
        <div style="display:flex;gap:10px;align-items:center">${round("bell")}<span class="icT butter d" style="width:48px;height:48px;border-radius:50%;font-size:18px;font-weight:700;border:3px solid #fff">A</span></div>
      </div>
      <div class="d" style="font-size:34px;line-height:37px;letter-spacing:-.8px">Let's crack<br>some math.</div>
      <div style="display:flex;gap:8px;margin:0 -20px;padding:0 20px;overflow:hidden">
        ${[["SAT in 23 days", "cal", "butter"], ["Course", "book", "mint"], ["Practice exam", "timer", "lav"], ["Planner", "cal", ""]].map(([t, i, tone]) =>
          `<span class="${tone}" style="flex:none;display:flex;gap:7px;align-items:center;border-radius:999px;padding:9px 15px 9px 12px;font-weight:700;font-size:13px;${tone ? "" : "background:#fff;border:1.5px solid var(--line)"}">${ic(i, 15, 2)}${t}</span>`).join("")}
      </div>
      <div class="butter paper" style="border-radius:30px;padding:20px;position:relative;display:flex;flex-direction:column;gap:10px;min-height:236px;overflow:hidden">
        <div style="font-weight:700;font-size:13px">Continue where you left off</div>
        <div class="d" style="font-size:30px;line-height:31px;letter-spacing:-.7px;max-width:58%">Linear Functions</div>
        <div style="display:flex;align-items:center;gap:8px;font-weight:700;font-size:13px"><div class="prog" style="width:110px"><b style="width:62%"></b></div>62%</div>
        <div class="abs" style="right:${ipad ? 40 : 4}px;top:40px">${ART.slope(ipad ? 170 : 136)}</div>
        <div class="pill" style="margin-top:auto;position:relative">Continue chapter<i>${ic("play", 18, 0)}</i></div>
      </div>
      <div><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px"><span class="h2">This week</span><span style="color:var(--brand);font-weight:700;font-size:13.5px">Planner</span></div>
        <div class="card" style="display:flex;padding:8px">${days.map(([l, n, s]) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:9px 0 13px;border-radius:999px;position:relative;font-weight:700;font-size:15px;${s === "on" ? "background:#0B0A0F;color:#fff" : ""}">
          <small style="font-weight:600;font-size:11.5px;${s === "on" ? "opacity:.75" : "color:var(--muted)"}">${l}</small>${n}
          ${s ? `<span class="abs" style="bottom:5px;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:${s === "on" ? "var(--lav)" : "var(--lav2)"}"></span>` : ""}</div>`).join("")}</div></div>
      <div><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px"><span class="h2">Today's plan</span><span style="color:var(--brand);font-weight:700;font-size:13.5px">Edit</span></div>
        <div class="cap" style="margin-bottom:12px">1 of 3 done</div>
        <div style="display:grid;gap:10px">${task("Finish 2 lessons in Linear Functions", "Lesson", true)}${task("Practice quiz: slope and intercepts", "Quiz")}${task("Review your wrong answers", "Review")}</div></div>
    </div>${tabBar("Home", kind)}`;
  },

  // Course tab (app/(tabs)/course/index.tsx)
  course: (W, H, kind) => `<div class="scroll" style="gap:16px">
      <div><div class="cap" style="text-transform:uppercase;letter-spacing:.1em;font-weight:800;font-size:11.5px">SAT Math course</div>
        <div class="d" style="font-size:30px;line-height:34px;letter-spacing:-.6px;margin-top:4px">From the basics to 800</div></div>
      <div style="border-radius:28px;overflow:hidden;background:var(--lav)">
        <div class="lav paper" style="height:170px;display:grid;place-items:center;position:relative">${ART.parabola(kind === "ipad" ? 480 : 360, 160)}
          <span class="abs" style="left:16px;top:14px;background:#fff;border-radius:999px;padding:6px 12px;font-weight:700;font-size:13px">34% complete</span></div>
        <div style="margin:0 6px 6px;border-radius:23px;background:#0B0A0F;display:flex;align-items:center;gap:12px;padding:12px 10px 12px 16px">
          <div style="flex:1"><div style="color:rgba(255,255,255,.65);font-size:12.5px;font-weight:600">Continue · Chapter 3</div>
            <div style="color:#fff;font-weight:700;font-size:15.5px;margin-top:3px">Linear Functions</div>
            <div style="height:4px;border-radius:4px;background:rgba(255,255,255,.18);margin-top:8px;overflow:hidden"><div style="width:62%;height:100%;background:var(--lav)"></div></div></div>
          <span class="icT lav" style="width:46px;height:46px;border-radius:50%">${ic("play", 18, 0)}</span></div>
      </div>
      <div style="display:flex;gap:10px">${[["book", "47 lessons"], ["help", "20 quizzes"], ["trophy", "8 chapters"]].map(([i, t]) =>
        `<div style="flex:1;display:flex;align-items:center;gap:8px"><span class="icT" style="width:38px;height:38px;border-radius:50%;border:1.5px solid var(--line);background:#fff">${ic(i, 17, 1.9)}</span><span class="cap">${t}</span></div>`).join("")}</div>
      <div><div class="h2">Chapters</div>
        <div style="display:flex;gap:14px;margin-top:8px">${[["Finished · 2", "var(--mint)"], ["Started · 2", "var(--butter)"], ["Not started · 4", "var(--surface2)"]].map(([t, c]) =>
          `<span class="cap" style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border-radius:4px;background:${c};border:1px solid var(--line)"></span>${t}</span>`).join("")}</div></div>
      <div style="display:grid;gap:10px;margin-top:-4px">${CHAPTERS.map((c, k) => k === 0 ? `<div ${lift("", { grow: 1.3, pad: 0, r: 20 })}>${chapterRow(c, k)}</div>` : chapterRow(c, k)).join("")}</div>
    </div>${tabBar("Course", kind)}`,

  // A topic quiz after answering (components/quiz/QuizScreen.tsx)
  // A topic quiz after answering (components/quiz/QuizScreen.tsx + QuizHeader, QuestionToggles, QuestionOptions, QuestionBottomNav)
  quiz: (W, H, kind) => `<div class="abs" style="left:0;right:0;top:62px;padding:0 20px">${quizHeader({ n: 3, total: 10, answered: 3 })}</div>
    <div class="scroll" style="top:122px;padding-top:8px;gap:0"><div ${lift("display:flex;flex-direction:column", { grow: 1.25, top: true })}>
      <div style="display:flex;align-items:center;gap:8px"><div style="flex:1;display:flex">${tag("Linear Equations")}</div>${togglePills(true)}</div>
      <div style="font-family:Outfit;font-weight:500;font-size:19px;line-height:1.45;letter-spacing:-.01em;margin:14px 0 18px">If 3<i>x</i> + 7 = 19, what is the value of <i>x</i>?</div>
      ${options([["A", "3", "dim"], ["B", "4", "correct"], ["C", "6", "dim"], ["D", "26/3", "dim"]])}
      <div style="margin-top:18px;position:relative">
        <div class="abs" style="left:40px;top:-7px;width:18px;height:18px;background:var(--butter);transform:rotate(45deg);border-radius:4px"></div>
        <div style="background:var(--butter);border-radius:24px;padding:14px 16px 16px;position:relative">
          <div style="display:flex;align-items:center;gap:8px">${ic("bulb", 18, 2.1)}<span class="d" style="font-size:17px">Explanation</span></div>
          <div style="font-size:16px;line-height:1.6;margin-top:6px">Subtract 7 from both sides: 3<i>x</i> = 12.<br>Divide both sides by 3: <i>x</i> = 4.</div></div></div>
    </div></div>${bottomNav("Next", "arrow")}`,

  // A full practice exam: the same quiz screen with the 70-minute timer, no explanations until the end
  exam: (W, H, kind) => `<div class="abs" style="left:0;right:0;top:62px;padding:0 20px">${quizHeader({ n: 12, total: 44, answered: 11, timer: "58:24" })}</div>
    <div class="scroll" style="top:122px;padding-top:8px;gap:0"><div ${lift("display:flex;flex-direction:column", { grow: 1.12, top: true })}>
      <div style="display:flex;align-items:center;gap:8px"><div style="flex:1;display:flex">${tag("Practice exam 2")}</div>${togglePills(false)}</div>
      <div style="font-family:Outfit;font-weight:500;font-size:19px;line-height:1.45;letter-spacing:-.01em;margin:14px 0 14px">The graph of <i>y</i> = <i>x</i>² − 6<i>x</i> + 5 is shown. What is the minimum value of <i>y</i>?</div>
      <div style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:10px;display:grid;place-items:center;margin-bottom:16px">${parabolaGraph(kind === "ipad" ? 420 : 340)}</div>
      ${options([["A", "−4", "selected"], ["B", "−1"], ["C", "3"], ["D", "5"]])}
    </div></div>${bottomNav("Answer", "tick")}`,
  // A lesson (app/course/[chapterId]/lesson/[lessonId]): top bar, step bar, the rich-text page from the website
  // A real lesson (Chapter 5 · Linear equations: 1 lesson + 3 quizzes), its page captured from the website by capture-lesson.mjs
  lesson: (W, H, kind) => `<div class="abs" style="left:0;right:0;top:62px;padding:0 20px">
      <div style="display:flex;align-items:center;gap:12px;min-height:46px">${round("arrowLeft")}<span class="d" style="flex:1;text-align:center;font-size:18px">Step 1 of 4</span><span style="width:46px"></span></div>
      <div style="display:flex;gap:3px;margin-top:12px">${Array.from({ length: 4 }, (_, i) => `<span style="flex:1;height:5px;border-radius:5px;background:${i === 0 ? "var(--lav2)" : "var(--line)"}"></span>`).join("")}</div></div>
    <div class="scroll" style="top:138px;padding-top:10px;gap:0;overflow:hidden">
      <div style="display:flex;gap:6px;margin-bottom:10px">${tag("Lesson")}</div>
      <div class="d" style="font-size:30px;line-height:34px;letter-spacing:-.6px;margin-bottom:16px">Lesson: Linear equations</div>
      <img src="lesson.png" style="width:${W - (kind === "ipad" ? 56 : 40)}px;display:block">
    </div>
    <div class="abs" style="left:0;right:0;bottom:0;padding:12px 20px 48px;background:var(--bg)">
      <span style="min-height:56px;border-radius:999px;background:#0B0A0F;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:6px 6px 6px 22px;font-weight:700;font-size:16px">Done, take the quiz
        <span class="icT lav" style="width:44px;height:44px;border-radius:50%">${ic("arrow", 20, 2.1)}</span></span></div>`,

  // Tests tab (app/(tabs)/tests/index.tsx): lavender header, full test card, practice modes, results
  tests: (W, H, kind) => `<div class="abs lav paper" style="inset:0"></div>
    <div class="abs" style="inset:0;padding-top:66px;display:flex;flex-direction:column">
      <div style="padding:0 20px 26px;display:flex;flex-direction:column;gap:6px">
        <span style="font-weight:800;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;opacity:.7">Practice</span>
        <span class="d" style="font-size:32px;line-height:35px;letter-spacing:-.6px">Test yourself<br>like it's exam day</span></div>
      <div style="flex:1;background:var(--bg);border-radius:34px 34px 0 0;padding:24px 20px 0;display:flex;flex-direction:column;gap:18px">
        <div class="butter paper" style="border-radius:30px;padding:20px;display:flex;flex-direction:column;gap:10px;min-height:220px;position:relative">
          <div style="display:flex;gap:6px"><span class="tag ink">70 min</span><span class="tag ink">44 questions</span></div>
          <div class="d" style="font-size:30px;line-height:31px;letter-spacing:-.7px;max-width:62%">Full SAT Math test</div>
          <div style="font-size:13.5px;font-weight:600;line-height:19px;max-width:62%">Real timing and question mix. Score report at the end.</div>
          <div class="abs" style="right:12px;top:52px">${ART.stopwatch(104)}</div>
          <div class="pill" style="margin-top:auto;min-height:56px">Start full test<i>${ic("play", 18, 0)}</i></div>
        </div>
        <div class="h2">Practice modes</div>
        <div ${lift("display:flex;gap:10px;margin-top:-6px", { grow: 1.3, pad: 12, r: 30 })}>${[["redo", "rose", "Wrong answers", "Redo the questions you missed"], ["bookmark", "butter", "Saved", "Questions you bookmarked"]].map(([i, t, a, b]) =>
          `<div style="flex:1;background:#fff;border:1px solid var(--line);border-radius:22px;padding:14px;display:flex;flex-direction:column;gap:18px">${tile(i, t, 40, 13, 19)}<div><div style="font-weight:700;font-size:15px">${a}</div><div class="cap" style="margin-top:3px">${b}</div></div></div>`).join("")}</div>
        <div class="card" style="display:flex;align-items:center;gap:12px;padding:14px">${tile("chart", "mint", 44, 14, 20)}<div style="flex:1"><div style="font-weight:700;font-size:15px">Your results</div><div class="cap">Every test is saved. See your scores in Profile.</div></div>${ic("right", 18, 2)}</div>
      </div></div>${tabBar("Tests", kind)}`,
  planner: (W, H, kind) => {
    const cells = []; for (let k = 0; k < 35; k++) { cells.push(k); }
    const study = [2, 3, 4, 9, 10, 11, 12], sat = 28, today = 5;
    return `${backHeader("Study planner")}
    <div class="scroll" style="top:110px;padding-top:0;gap:16px">
      <div class="butter paper" style="border-radius:26px;padding:18px 20px;display:flex;align-items:center;gap:14px">
        <div style="flex:1"><div style="font-weight:700;font-size:13px">Your SAT</div><div class="d" style="font-size:26px;line-height:30px;letter-spacing:-.5px;margin-top:2px">Saturday, Nov 28</div></div>
        <div style="text-align:center;background:#0B0A0F;color:#fff;border-radius:20px;padding:10px 14px"><div class="d" style="font-size:28px;line-height:30px;color:var(--butter)">23</div><div style="font-size:11px;font-weight:700;opacity:.8">days left</div></div>
      </div>
      <div class="card" style="padding:16px 12px 10px">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0 6px 10px"><span class="h2" style="font-size:18px">November 2026</span><span style="display:flex;gap:6px">${round("left")}${round("right")}</span></div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);row-gap:6px;text-align:center">
          ${["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => `<span class="cap" style="font-size:11.5px;padding-bottom:4px">${d}</span>`).join("")}
          ${cells.map(d => { const n = d + 1; if (n < 1 || n > 30) return `<span></span>`;
            const st = n === today ? "background:#0B0A0F;color:#fff" : n === sat ? "background:var(--butter)" : "";
            return `<span style="position:relative;height:40px;display:grid;place-items:center"><span style="width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:14.5px;${st}">${n}</span>${study.includes(n) ? `<span class="abs" style="bottom:1px;left:50%;margin-left:-2.5px;width:5px;height:5px;border-radius:50%;background:var(--lav2)"></span>` : ""}</span>`; }).join("")}
        </div>
      </div>
      <div><div class="h2">Thursday, Nov 5</div><div class="cap" style="margin:4px 0 12px">2 of 3 done</div>
        <div style="display:grid;gap:10px">${task("Finish 2 lessons in Linear Functions", "Lesson", true)}${task("Practice quiz: slope and intercepts", "Quiz", true)}${task("Review your wrong answers", "Review")}</div></div>
    </div>`;
  },

  // Profile tab with results and achievements
  // Profile tab (app/(tabs)/profile/index.tsx), a PRO user
  profile: (W, H, kind) => `<div class="scroll" style="gap:18px">
      <div style="display:flex;justify-content:space-between;align-items:center"><span class="d" style="font-size:30px;letter-spacing:-.6px">Profile</span>${round("settings")}</div>
      <div class="lav paper" style="border-radius:30px;padding:20px;display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;align-items:center;gap:14px">
          <span class="icT butter" style="width:72px;height:72px;border-radius:50%;border:3px solid #fff;font-family:Outfit;font-weight:700;font-size:24px">AM</span>
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px"><span class="h2">Alex Morgan</span>
            <span style="font-size:12.5px;font-weight:600;opacity:.7">alex.morgan@mail.com</span>
            <span style="margin-top:2px"><span class="tag ink" style="padding:2px 7px;font-size:10px;letter-spacing:.08em;font-weight:800">PRO</span></span></div>
          <span class="icT" style="width:40px;height:40px;border-radius:50%;background:#fff;border:1.5px solid rgba(11,10,15,.2)">${ic("pencil", 18, 1.9)}</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;background:#fff;border-radius:20px;padding:14px">
          <div><div style="font-size:12.5px;font-weight:600;opacity:.6">Total points</div><div class="d" style="font-size:32px;line-height:36px">1,240</div></div>
          <div style="text-align:right"><div style="font-size:12.5px;font-weight:600;opacity:.6">Achievements</div><div class="d" style="font-size:22px">9/22</div></div>
        </div>
      </div>
      <div style="display:flex;gap:10px">${[["Lessons", 18, "book", "mint"], ["Quizzes", 7, "help", "butter"], ["Day streak", 12, "flame", "rose"]].map(([l, v, i, t]) =>
        `<div class="card" style="flex:1;padding:14px;display:flex;flex-direction:column;gap:12px">${tile(i, t, 36, 12, 18)}<div><div class="d" style="font-size:26px;line-height:30px">${v}</div><div class="cap">${l}</div></div></div>`).join("")}</div>
      <div class="butter paper" style="border-radius:26px;padding:18px;display:flex;align-items:center">
        <div style="flex:1"><div style="font-weight:700;font-size:13.5px">Average SAT Math score</div><div class="d" style="font-size:40px;line-height:46px">690</div><div style="font-size:12.5px;font-weight:600;opacity:.7">out of 800</div></div>${targetArt(84)}</div>
      <div><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px"><span class="h2">Achievements · 9/22</span><span style="color:var(--brand);font-weight:700;font-size:13.5px">See all</span></div>
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;row-gap:10px">${BADGES.map((b) => badgeCard(b)).join("")}</div></div>
    </div>${tabBar("Profile", kind)}`,
};

function task(text, kind, done) {
  return `<div style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:20px;${done ? "background:var(--mint)" : "background:#fff;border:1px solid var(--line)"}">
    <span style="width:28px;height:28px;border-radius:50%;display:grid;place-items:center;flex:none;${done ? "background:#0B0A0F;color:#fff" : "border:1.5px solid var(--line)"}">${done ? ic("tick", 16, 3) : ""}</span>
    <span style="flex:1;font-weight:700;font-size:14.5px;line-height:20px;${done ? "text-decoration:line-through" : ""}">${text}</span><small class="cap" style="${done ? "color:var(--ink)" : ""}">${kind}</small></div>`;
}
function chapterRow([title, p, l, q], k) {
  const tone = p >= 100 ? "mint" : p > 0 ? "butter" : "", num = String(k + 1).padStart(2, "0");
  return `<div class="card" style="display:flex;align-items:center;gap:12px;padding:10px 14px 10px 10px;border-radius:20px">
    <span class="${tone} paper d" style="width:56px;height:56px;border-radius:16px;display:grid;place-items:center;font-size:20px;flex:none;${tone ? "" : "background-color:var(--surface2);color:var(--muted)"}">${num}</span>
    <div style="flex:1;min-width:0"><div style="font-weight:700;font-size:15px">${title}</div><div class="cap" style="margin-top:2px">${l} lessons · ${q} quizzes</div>
      ${p > 0 && p < 100 ? `<div style="height:4px;border-radius:4px;background:var(--line);margin-top:7px;overflow:hidden"><div style="width:${p}%;height:100%;background:#0B0A0F"></div></div>` : ""}</div>
    <span style="font-weight:700;font-size:13px;color:${p >= 100 ? "var(--mintInk)" : p > 0 ? "var(--ink)" : "var(--subtle)"}">${p}%</span></div>`;
}
const tag = (label, tone = "lav") => `<span class="${tone}" style="display:inline-flex;align-items:center;border-radius:999px;padding:4px 10px;font-weight:700;font-size:11.5px">${label}</span>`;
// Hint (butter) and Save (grey) pills next to the question
const togglePills = (hint) => `<div style="display:flex;gap:8px">
  ${hint ? `<span class="butter" style="display:flex;align-items:center;gap:5px;border-radius:999px;padding:7px 12px;font-weight:700;font-size:12px">${ic("bulb", 14, 2.2)}Hint</span>` : ""}
  <span style="display:flex;align-items:center;gap:5px;border-radius:999px;padding:7px 12px;font-weight:700;font-size:12px;background:var(--surface2);color:var(--muted)">${ic("bookmark", 14, 2.2)}Save</span></div>`;
// Answer options. Short answers sit two per row, like the app
function options(list) {
  return `<div style="display:flex;flex-wrap:wrap;gap:10px">${list.map(([letter, text, state]) => optionCard(letter, text, state, "calc(50% - 5px)")).join("")}</div>`;
}
function optionCard(letter, text, state, width) {
  const pastel = state === "correct" || state === "wrong" || state === "selected";
  const bg = state === "correct" ? "var(--mint)" : state === "wrong" ? "var(--rose)" : state === "selected" ? "var(--lav)" : "#fff";
  return `<div style="width:${width};display:flex;align-items:center;gap:14px;padding:12px 14px;min-height:60px;border-radius:20px;background:${bg};border:1.5px solid ${pastel ? "transparent" : "var(--line)"};opacity:${state === "dim" ? .5 : 1}">
    <span style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:13.5px;flex:none;${pastel ? "background:#0B0A0F;color:#fff" : "border:1.5px solid var(--line)"}">${letter}</span>
    <span style="flex:1;font-weight:700;font-size:18px;line-height:23px">${text}</span>${state === "correct" ? ic("tick", 20, 2.6) : ""}</div>`;
}
// QuizHeader: close, "Question n of N", segment bar (up to 20 questions) or one bar, the exam timer, grid / restart once answered
function quizHeader({ n, total, answered, timer }) {
  const bar = total <= 20
    ? `<div style="display:flex;gap:3px">${Array.from({ length: total }, (_, i) => `<span style="flex:1;height:6px;border-radius:6px;background:${i === n - 1 ? "var(--lav2)" : i < answered ? "#0B0A0F" : "var(--line)"}"></span>`).join("")}</div>`
    : `<div style="height:6px;border-radius:6px;background:var(--line);overflow:hidden"><div style="width:${answered / total * 100}%;height:100%;border-radius:6px;background:#0B0A0F"></div></div>`;
  return `<div style="display:flex;align-items:center;gap:10px">${round("x")}
    <div style="flex:1;display:flex;flex-direction:column;gap:7px"><div style="display:flex;justify-content:space-between;gap:8px"><span style="font-weight:700;font-size:13.5px;color:var(--muted);white-space:nowrap">Question ${n} of ${total}</span>${timer ? "" : `<span class="cap" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0">Progress is saved</span>`}</div>${bar}</div>
    ${timer ? `<span class="butter" ${lift("display:flex;align-items:center;gap:6px;border-radius:999px;padding:8px 12px", { grow: 1.9, pad: 0, r: 999 })}>${ic("clock", 15, 2.2)}<b style="font-weight:800;font-size:13.5px;font-variant-numeric:tabular-nums">${timer}</b></span>`
      : `${round("grid", "#fff", 42)}${round("redo", "#fff", 42)}`}</div>`;
}
function backHeader(title) {
  return `<div class="abs" style="left:0;right:0;top:56px;display:flex;align-items:center;gap:12px;padding:0 20px">${round("left")}<div class="d" style="font-size:20px;flex:1">${title}</div>${round("plus")}</div>`;
}
// QuestionBottomNav: round back button and the ink pill with its lavender dot
function bottomNav(label, icon) {
  return `<div class="abs" style="left:0;right:0;bottom:0;padding:12px 20px 48px;background:var(--bg);display:flex;align-items:center;gap:10px;z-index:20">
    ${round("arrowLeft", "#fff", 56)}
    <span style="flex:1;min-height:56px;border-radius:999px;background:#0B0A0F;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:6px 6px 6px 22px;font-weight:700;font-size:16px">${label}
      <span class="icT lav" style="width:44px;height:44px;border-radius:50%">${ic(icon, 20, 2.1)}</span></span></div>`;
}
// y = x² − 6x + 5 on a unit grid, the vertex dot exactly on the curve at (3, −4)
function parabolaGraph(w) {
  const h = w * .56, x0 = -1, x1 = 7, y0 = -5, y1 = 8;
  const X = (x) => (x - x0) / (x1 - x0) * w, Y = (y) => h - (y - y0) / (y1 - y0) * h;
  let grid = "";
  for (let x = x0; x <= x1; x++) grid += `<line x1="${X(x)}" y1="0" x2="${X(x)}" y2="${h}" stroke="#0B0A0F" stroke-opacity=".07"/>`;
  for (let y = y0; y <= y1; y++) grid += `<line x1="0" y1="${Y(y)}" x2="${w}" y2="${Y(y)}" stroke="#0B0A0F" stroke-opacity=".07"/>`;
  const pts = [];
  for (let k = 0; k <= 80; k++) { const x = -0.4 + k * (6.8 / 80), y = x * x - 6 * x + 5; if (y <= y1) pts.push(`${X(x).toFixed(1)},${Y(y).toFixed(1)}`); }
  const tick = (x, t) => `<text x="${X(x)}" y="${Y(0) + 16}" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="11" fill="#6B6577">${t}</text>`;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">${grid}
    <path d="M0 ${Y(0)}H${w}M${X(0)} 0V${h}" stroke="#0B0A0F" stroke-width="1.6" opacity=".55"/>
    <polyline points="${pts.join(" ")}" stroke="#7A4BDB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${tick(1, "1")}${tick(3, "3")}${tick(5, "5")}
    <circle cx="${X(1)}" cy="${Y(0)}" r="4" fill="#0B0A0F"/><circle cx="${X(5)}" cy="${Y(0)}" r="4" fill="#0B0A0F"/>
    <circle cx="${X(3)}" cy="${Y(-4)}" r="5.5" fill="#fff" stroke="#0B0A0F" stroke-width="2.5"/>
    <text x="${X(3) + 12}" y="${Y(-4) + 4}" font-family="Outfit" font-weight="600" font-size="13" fill="#0B0A0F">(3, ?)</text>
    <text x="${X(0) + 6}" y="13" font-family="Outfit" font-weight="600" font-size="13" fill="#0B0A0F">y</text>
    <text x="${w - 12}" y="${Y(0) - 7}" font-family="Outfit" font-weight="600" font-size="13" fill="#0B0A0F">x</text></svg>`;
}
// y = 2x + 1 on a small grid, for the lesson's rule box
const lineGraph = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none" stroke-linecap="round">
  <path d="M10 70H92M30 8V94" stroke="#0B0A0F" stroke-width="1.6" opacity=".5"/><path d="M6 106 60 -2" stroke="#0B0A0F" stroke-width="3.5"/>
  <circle cx="30" cy="58" r="5" fill="#FEE7A6" stroke="#0B0A0F" stroke-width="2.4"/>
  <path d="M30 58h12v-24" stroke="#7A4BDB" stroke-width="2.4" stroke-dasharray="4 4"/></svg>`;
const targetArt = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none" stroke="#0B0A0F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="46" cy="54" r="34" fill="#fff"/><circle cx="46" cy="54" r="22"/><circle cx="46" cy="54" r="10" fill="#C9AAFB"/><path d="M46 54 84 16" stroke-width="3.2"/><path d="M76 14l8 2 2 8"/></svg>`;

// Achievement medals, ported from components/achievements (BadgeArt on a 64 grid, AchievementBadge card)
function badgeArt(id, ink, fill) {
  const s = `stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const label = (x, y, t, size = 11) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="700" fill="${ink}" text-anchor="middle" font-family="Outfit">${t}</text>`;
  switch (id) {
    case "exam-700": return `<path ${s} stroke-width="1.6" d="M4 52 H60"/><path d="M46 52 V31 C50 40 54 48 60 50 V52 Z" fill="${fill}"/><path ${s} d="M4 50 C16 48 20 12 32 12 C44 12 48 48 60 50"/><path ${s} d="M46 56 V24"/>${label(46, 20, "700", 10)}`;
    case "streak-7": return `<path ${s} stroke-width="1.6" d="M8 50 A26 26 0 0 1 56 50"/>${Array.from({ length: 7 }, (_, i) => { const a = Math.PI - i * Math.PI / 6; return `<circle cx="${32 + 24 * Math.cos(a)}" cy="${50 - 24 * Math.sin(a)}" r="4" fill="${i === 6 ? fill : ink}" stroke="${ink}" stroke-width="1.6"/>`; }).join("")}${label(32, 50, "7", 16)}`;
    case "quiz-10": return `<path ${s} stroke-width="1.6" d="M32 6 V58 M6 32 H58"/><circle cx="32" cy="32" r="16" fill="${fill}" fill-opacity=".9" stroke="${ink}" stroke-width="2.6"/><circle cx="43.3" cy="20.7" r="3" fill="${ink}"/>${label(32, 62, "x²+y²=r²", 8.5)}`;
    case "chapter-1": return `<circle cx="32" cy="32" r="22" fill="${fill}" stroke="${ink}" stroke-width="2.4"/><path ${s} stroke-width="3" d="M22 33 L29 40 L43 25"/><path ${s} stroke-width="1.6" stroke-dasharray="1 5" d="M32 4 V10 M32 54 V60 M4 32 H10 M54 32 H60"/>`;
    case "perfect-1": return `<circle cx="32" cy="32" r="23" ${s}/><path d="M32 9 A23 23 0 1 1 31.9 9" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".25"/>${label(32, 37, "100%", 14)}<polygon points="32,52 34,57 39,57 35,60 36.5,64 32,61.5 27.5,64 29,60 25,57 30,57" fill="${fill}" stroke="${ink}" stroke-width="1.4" transform="translate(0 -6)"/>`;
    case "exam-1": return `<circle cx="32" cy="36" r="21" fill="#fff" stroke="${ink}" stroke-width="2.4"/><path d="M32 36 V15 A21 21 0 1 1 14.4 47.4 Z" fill="${fill}"/><circle cx="32" cy="36" r="21" ${s}/><path ${s} d="M27 8 H37 M32 8 V15 M48 18 L52 14"/><path ${s} stroke-width="3" d="M32 36 L32 22"/><circle cx="32" cy="36" r="2.8" fill="${ink}"/>`;
    default: return `<circle cx="32" cy="32" r="20" ${s}/>`;
  }
}
let medalId = 0;
function medal(id, tone, size = 112) {
  const k = "m" + ++medalId;
  const lines = Array.from({ length: 11 }, (_, i) => `<line x1="${i * 11 + 3}" y1="0" x2="${i * 11 + 3}" y2="112"/><line x1="0" y1="${i * 11 + 3}" x2="112" y2="${i * 11 + 3}"/>`).join("");
  return `<span style="position:relative;display:block;width:${size}px;height:${size}px;flex:none"><svg width="${size}" height="${size}" viewBox="0 0 112 112">
    <defs><clipPath id="${k}"><circle cx="56" cy="56" r="51"/></clipPath></defs>
    <circle cx="56" cy="56" r="51" fill="var(--${tone})"/><g clip-path="url(#${k})" stroke="#0B0A0F" stroke-opacity=".08">${lines}</g>
    <circle cx="56" cy="56" r="54" fill="none" stroke="#0B0A0F" stroke-width="2" opacity=".85"/>
    <g transform="translate(21 21) scale(${70 / 64})">${badgeArt(id, "#0B0A0F", "#fff")}</g></svg>
    <span class="icT" style="position:absolute;right:${size * .018}px;bottom:${size * .018}px;width:${size * .232}px;height:${size * .232}px;border-radius:50%;border:${size * .022}px solid #fff;background:var(--mintInk);color:#fff">${ic("tick", size * .116, 3)}</span></span>`;
}
const BADGES = [
  ["exam-700", "High scorer", "Score 700+ on a practice exam", "butter"],
  ["streak-7", "Week streak", "Study 7 days in a row", "rose"],
  ["quiz-10", "Math master", "Finish 10 topic quizzes", "butter"],
  ["chapter-1", "Chapter closed", "Finish every lesson and quiz in a chapter", "lav"],
];
function badgeCard([id, title, desc, tone], width = "48.5%") {
  return `<div style="width:${width};border-radius:24px;padding:16px 12px 14px;display:flex;flex-direction:column;align-items:center;gap:10px;background:#fff;border:1px solid var(--${tone})">
    ${medal(id, tone)}<div style="text-align:center"><div class="d" style="font-size:15.5px;line-height:19px">${title}</div><div style="font-weight:600;font-size:12px;line-height:16px;color:var(--muted);margin-top:3px">${desc}</div></div>
    <span class="${tone}" style="border-radius:999px;padding:3px 10px;font-weight:700;font-size:11px">Unlocked</span></div>`;
}

// iPhone: a 402x874pt screen drawn `w` design px wide
function phone(screen, w, { left, top, rotate = 0, android = false }) {
  const bez = w * (android ? .03 : .034), sw = w - bez * 2, k = sw / 402, sh = 874 * k, rad = w * (android ? .12 : .155);
  const kind = android ? "android" : "phone";
  const cam = android
    ? `<div class="island" style="top:${14 * k}px;width:${22 * k}px;height:${22 * k}px"></div>`
    : `<div class="island" style="top:${11 * k}px;width:${124 * k}px;height:${36 * k}px"></div>`;
  return `<div class="device" style="left:${left}px;top:${top}px;width:${w}px;height:${sh + bez * 2}px;border-radius:${rad}px;transform:rotate(${rotate}deg)">
    <div class="screen" style="left:${bez}px;top:${bez}px;width:${sw}px;height:${sh}px;border-radius:${rad - bez}px">
      <div class="app" style="width:402px;height:874px;transform:scale(${k})">${SCREENS[screen](402, 874, kind)}${statusBar(kind)}</div>${cam}
    </div></div>`;
}
// iPad: a 768x1024pt screen
function tablet(screen, w, { left, top, rotate = 0 }) {
  const bez = w * .028, sw = w - bez * 2, k = sw / 600, sh = 800 * k, rad = w * .055;
  return `<div class="device" style="left:${left}px;top:${top}px;width:${w}px;height:${sh + bez * 2}px;border-radius:${rad}px;transform:rotate(${rotate}deg)">
    <div class="screen" style="left:${bez}px;top:${bez}px;width:${sw}px;height:${sh}px;border-radius:${rad - bez * .8}px">
      <div class="app ipad" style="width:600px;height:800px;transform:scale(${k})">${SCREENS[screen](600, 800, "ipad")}${statusBar("ipad")}</div>
    </div></div>`;
}

/* =============================== the slides =============================== */
// One short line per slide; <em> is the accent word
const SLIDES = [
  { screen: "exam",    line: "Hit <em>800</em> on SAT Math" },
  { screen: "course",  line: "Every topic, <em>step by step</em>" },
  { screen: "quiz",    line: "<em>800+</em> practice questions" },
  { screen: "lesson",  line: "Learn it, <em>then practice</em>" },
  { screen: "tests",   line: "Redo every <em>mistake</em>" },
  { screen: "planner", line: "A plan up to <em>exam day</em>" },
]

// One detail per slide that lifts out of the phone, sized to outline that feature
const FLOAT = {
  home: () => `<div class="float" style="display:flex;align-items:center;gap:14px;padding:16px 22px 16px 16px">
      <span class="icT mint" style="width:46px;height:46px;border-radius:50%">${ic("tick", 22, 3)}</span>
      <div><div style="font-weight:800;font-size:19px">Today's plan</div><div class="cap" style="font-size:14px">1 of 3 done · 12 day streak</div></div></div>`,
  course: () => `<div class="float" style="display:flex;align-items:center;gap:14px;padding:12px 22px 12px 12px">
      <span class="mint paper d" style="width:58px;height:58px;border-radius:17px;display:grid;place-items:center;font-size:21px">01</span>
      <div><div style="font-weight:800;font-size:18px">Linear Equations</div><div class="cap" style="font-size:13.5px;color:var(--mintInk);font-weight:700">Chapter finished · 100%</div></div></div>`,
  // the whole question block (question, answers, explanation) lifted out at a slightly bigger size
  quiz: () => `<div class="float" style="width:410px;padding:20px;background:var(--bg);border-radius:30px">
      <div style="display:flex;align-items:center;gap:8px"><div style="flex:1;display:flex">${tag("Linear Equations")}</div>${togglePills(true)}</div>
      <div style="font-family:Outfit;font-weight:500;font-size:23px;line-height:1.4;letter-spacing:-.01em;margin:14px 0 16px">If 3<i>x</i> + 7 = 19, what is the value of <i>x</i>?</div>
      ${options([["A", "3", "dim"], ["B", "4", "correct"], ["C", "6", "dim"], ["D", "26/3", "dim"]])}
      <div style="margin-top:18px;position:relative">
        <div class="abs" style="left:40px;top:-7px;width:18px;height:18px;background:var(--butter);transform:rotate(45deg);border-radius:4px"></div>
        <div style="background:var(--butter);border-radius:24px;padding:14px 16px 16px;position:relative">
          <div style="display:flex;align-items:center;gap:8px">${ic("bulb", 18, 2.1)}<span class="d" style="font-size:17px">Explanation</span></div>
          <div style="font-size:16px;line-height:1.6;margin-top:6px">Subtract 7 from both sides: 3<i>x</i> = 12.<br>Divide both sides by 3: <i>x</i> = 4.</div></div></div></div>`,
  // just the correct answer, for the small listing and banner layouts
  answer: () => `<div class="float" style="padding:10px;width:250px">${optionCard("B", "4", "correct", "100%")}</div>`,
  exam: () => `<div class="float butter" style="display:flex;align-items:center;gap:12px;padding:16px 26px 16px 20px;border-radius:999px">${ic("clock", 32, 2.2)}<div><b style="display:block;font-weight:800;font-size:32px;line-height:34px;font-variant-numeric:tabular-nums">58:24</b><span style="font-weight:700;font-size:13px">44 questions · 70 min</span></div></div>`,
  reminder: () => `<div class="float" style="display:flex;align-items:center;gap:14px;padding:14px 22px 14px 14px">
      <span class="icT lav" style="width:48px;height:48px;border-radius:15px">${ic("bell", 22, 2)}</span>
      <div><div style="font-weight:800;font-size:18px">Time to study</div><div class="cap" style="font-size:13.5px">Every day at 7:00 PM</div></div></div>`,
  ownPlan: () => `<div class="float" style="display:flex;align-items:center;gap:14px;padding:14px 22px 14px 14px">
      <span class="icT mint" style="width:48px;height:48px;border-radius:15px">${ic("plus", 22, 2.4)}</span>
      <div><div style="font-weight:800;font-size:18px">Make your own plan</div><div class="cap" style="font-size:13.5px">Add tasks for any day</div></div></div>`,
  planner: () => `<div class="float" style="width:330px;padding:16px">
      <div style="display:flex;align-items:center;gap:12px"><span class="icT lav" style="width:46px;height:46px;border-radius:15px">${ic("bell", 22, 2)}</span>
        <div style="flex:1"><div style="font-weight:800;font-size:18px">Time to study</div><div class="cap" style="font-size:13.5px">Today's plan · 2 of 3 done</div></div><span class="cap" style="font-weight:700">7:00 PM</span></div>
      <div style="display:grid;gap:8px;margin-top:14px">${task("Finish 2 lessons in Linear Functions", "Lesson", true)}${task("Practice quiz: slope and intercepts", "Quiz", true)}${task("Review your wrong answers", "Review")}</div></div>`,
  profile: () => `<div class="float" style="padding:0;border-radius:24px;width:200px">${badgeCard(BADGES[0], "100%")}</div>`,
};
// Where each detail floats: [fraction of slide height, side]; over a part of the screen that doesn't need reading
const EXTRA = { planner: [[.44, "right", 1, "reminder"], [.585, "left", 1, "ownPlan"]] };

const headline = (html, { size, color = "#F4F1F8", accent = "#C9AAFB", align = "center" }) =>
  `<div class="d" style="font-size:${size}px;line-height:1.08;letter-spacing:-.035em;text-wrap:balance;color:${color};text-align:${align}">${html.replace(/<em>/g, `<em style="font-style:normal;color:${accent}">`)}</div>`;

// Dark ink night with the brand's graph paper, faint maths symbols and a lavender glow behind the device
const GLYPHS = ["π", "√", "x²", "Σ", "∞", "÷", "Δ", "θ", "%", "≠", "f(x)", "±"];
function backdrop(W, H, { gx = .5, gy = .58, glow = 1.3 } = {}) {
  const g = Math.round(W / 15);
  const sy = (k) => ((k * 71.3 + 37) % (H * .95));
  const glyphs = Array.from({ length: 22 }, (_, k) => {
    const x = (k * 137.5 + 20) % W, y = sy(k), s = W * (.03 + (k % 3) * .012);
    return `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-family="Outfit" font-weight="600" font-size="${s.toFixed(0)}" fill="${k % 4 === 0 ? "#FEE7A6" : "#C9AAFB"}" opacity="${(.08 + (k % 4) * .035).toFixed(2)}" transform="rotate(${(k % 5) * 6 - 12} ${x.toFixed(0)} ${y.toFixed(0)})">${GLYPHS[k % GLYPHS.length]}</text>`;
  }).join("");
  return `<div class="abs" style="inset:0;background:radial-gradient(90% 60% at ${gx * 100}% ${gy * 100}%,#2B2142 0%,#16131E 55%,#0B0A0F 100%)"></div>
    <div class="abs" style="inset:0;background-image:linear-gradient(rgba(201,170,251,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(201,170,251,.07) 1px,transparent 1px);background-size:${g}px ${g}px;-webkit-mask-image:radial-gradient(70% 60% at ${gx * 100}% ${gy * 100}%,#000,transparent)"></div>
    <svg class="abs" style="inset:0" width="${W}" height="${H}">${glyphs}</svg>
    <div class="abs" style="left:${W * gx}px;top:${H * gy}px;width:${W * glow}px;height:${W * glow}px;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(201,170,251,.36),rgba(201,170,251,0) 60%)"></div>`;
}

// Portrait store slide (App Store iPhone / iPad, Google Play phone). W×H in design px.
// The lifted block is placed by placeLifts() after layout, over the spot it had in the screen.
function slide(sl, i, W, H, device) {
  const ipad = device === "ipad", android = device === "android";
  const rot = i % 2 ? 4 : -4;
  const tsize = W * (ipad ? .068 : .096), ttop = H * (ipad ? .08 : .085);
  const pw = W * (ipad ? .8 : android ? .72 : .82), top = H * (ipad ? .225 : android ? .25 : .225);
  LIFTED = true;
  const dev = ipad ? tablet(sl.screen, pw, { left: (W - pw) / 2, top, rotate: rot / 2 })
    : phone(sl.screen, pw, { left: (W - pw) / 2, top, rotate: rot, android });
  LIFTED = false;
  const ex = EXTRA[sl.screen] || [], fs = W / (ipad ? 700 : 603);
  return `${backdrop(W, H)}
    <div class="abs" style="left:${W * .07}px;right:${W * .07}px;top:${ttop}px">${headline(sl.line, { size: tsize })}</div>
    ${dev}
    ${ex.map(([y, side, sc, key], j) => `<div class="abs" ${j ? "" : "data-front"} style="${side}:${W * (ipad ? .05 : .03)}px;top:${H * y}px;transform:rotate(${(j % 2 ? 1 : -1) * rot / 2}deg) scale(${fs * sc});transform-origin:${side} top">${FLOAT[key]()}</div>`).join("")}`;
}

// Landscape Google Play tablet slide: the line on the left, the phone and its card on the right
function slideWide(sl, i, W, H) {
  const rot = i % 2 ? 4 : -4, pw = 620, left = W * .62 - pw / 2;
  const ex = EXTRA[sl.screen] || [];
  LIFTED = true;
  const dev = phone(sl.screen, pw, { left, top: 120, rotate: rot, android: true });
  LIFTED = false;
  return `${backdrop(W, H, { gx: .6, gy: .6, glow: .9 })}
    <div class="abs" style="left:110px;width:${W * .4}px;top:0;bottom:0;display:flex;align-items:center">${headline(sl.line, { size: 118, align: "left" })}</div>
    ${dev}
    ${ex.map(([y, side, sc, key], j) => `<div class="abs" ${j ? "" : "data-front"} style="left:${side === "right" ? left + pw - 160 : left - 260}px;top:${H * (y + .05)}px;transform:rotate(${(j % 2 ? 1 : -1) * rot / 2}deg) scale(1.45);transform-origin:left top">${FLOAT[key]()}</div>`).join("")}`;
}

// After layout: copy every hidden [data-lift] block into a bigger card over the same spot, tilted with its device
function placeLifts(stage) {
  const sr = stage.getBoundingClientRect(), z = sr.width / stage.offsetWidth;
  stage.querySelectorAll("[data-lift]").forEach((el) => {
    const app = el.closest(".app"), k = parseFloat(app.style.transform.match(/scale\(([\d.]+)\)/)[1]);
    const m = el.closest(".device").style.transform.match(/rotate\((-?[\d.]+)deg\)/), rot = m ? +m[1] : 0;
    const r = el.getBoundingClientRect(); let cx = (r.left + r.width / 2 - sr.left) / z, cy = (r.top + r.height / 2 - sr.top) / z;
    const pad = +el.dataset.pad, card = document.createElement("div"), sc = k * +el.dataset.lift;
    if (el.dataset.top) {
      // keep the top edge where it was: move the centre down by the extra height, along the device's tilt
      const extra = (el.offsetHeight * sc - el.offsetHeight * k) / 2 + pad * sc, a = rot * Math.PI / 180;
      cx -= Math.sin(a) * extra; cy += Math.cos(a) * extra;
    }
    card.className = "abs float";
    card.style.cssText = `left:${cx}px;top:${cy}px;width:${el.offsetWidth + pad * 2}px;padding:${pad}px;background:var(--bg);border-radius:${el.dataset.r}px;transform:translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`;
    const copy = el.cloneNode(true);
    copy.removeAttribute("data-lift"); copy.style.visibility = "visible"; copy.style.margin = "0";
    if (el.dataset.head) copy.insertAdjacentHTML("afterbegin", LIFT_HEAD[el.dataset.head]());
    card.appendChild(copy);
    const front = stage.querySelector("[data-front]");
    front ? stage.insertBefore(card, front) : stage.appendChild(card);
  });
}

/* =============================== header, listing, feature graphic =============================== */
const appIcon = (s) => `<img src="../../app/assets/images/icon.png" style="width:${s}px;height:${s}px;border-radius:${s * .225}px;box-shadow:0 ${s * .12}px ${s * .3}px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.08);display:block">`;

// App Store header: a tilted wall of the app's pastel cards, the name in the middle. 2000x857 → 3840x1646
function header() {
  const tones = ["butter", "lav", "mint", "lav2", "rose"];
  const bits = [
    (t) => `<div class="d" style="font-size:54px">x²</div>`, (t) => ART.stopwatch(110), (t) => `<div class="d" style="font-size:54px">π</div>`,
    (t) => medal("exam-700", t, 116), (t) => `<div class="d" style="font-size:46px">800</div>`, (t) => `<div class="d" style="font-size:54px">√x</div>`,
    (t) => medal("perfect-1", t, 116), (t) => `<div class="d" style="font-size:46px">f(x)</div>`, (t) => `<div class="d" style="font-size:54px">Δ</div>`,
  ];
  const tw = 230, th = 172, gap = 26, cols = 13, rows = 7;
  let tiles = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = r * cols + c, tone = tones[(r * 2 + c) % tones.length];
    const x = c * (tw + gap) + (r % 2 ? (tw + gap) / 2 : 0), y = r * (th + gap);
    tiles += `<div class="abs ${tone} paper" style="left:${x}px;top:${y}px;width:${tw}px;height:${th}px;border-radius:30px;display:grid;place-items:center;color:#0B0A0F">${bits[(k * 4) % bits.length](tone === "butter" ? "lav" : "butter")}</div>`;
  }
  return `<div class="abs" style="inset:0;background:#0B0A0F"></div>
    <div class="abs" style="left:-560px;top:-420px;width:${cols * (tw + gap) + 200}px;height:${rows * (th + gap)}px;transform:rotate(-12deg);opacity:.92">${tiles}</div>
    <div class="abs" style="inset:0;background:radial-gradient(62% 80% at 50% 50%,#0B0A0F 0%,#0B0A0FF5 52%,#0B0A0F00 100%)"></div>
    <div class="abs" style="inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div class="d" style="font-size:236px;line-height:1;letter-spacing:-.045em;color:#F4F1F8">SAT <span style="color:#C9AAFB">Learner</span></div>
      <div style="margin-top:30px;font-size:46px;font-weight:600;color:rgba(244,241,248,.7)">SAT Math prep, made simple</div>
    </div>`;
}

// Listing (search results) 2000x1333 → 3840x2560: one line on top, the picture below
const listTop = (html, size = 96) => `<div class="abs" style="left:120px;right:120px;top:96px">${headline(html, { size })}</div>`;
const fan = (W, screens) => {
  const pw = 500, cx = W / 2;
  return [[screens[0], -340 - pw / 2, 400, -9], [screens[2], 340 - pw / 2, 400, 9], [screens[1], -pw / 2, 300, 0]]
    .map(([s, dx, y, r]) => phone(s, pw, { left: cx + dx, top: y, rotate: r })).join("");
};
const LISTINGS = [
  { name: "Three phones", draw: (W, H) => `${backdrop(W, H, { gy: .7, glow: .9 })}${fan(W, ["course", "exam", "quiz"])}${listTop("Hit <em>800</em> on SAT Math")}` },
  { name: "Quiz with details", draw: (W, H) => `${backdrop(W, H, { gy: .7, glow: .9 })}
      ${phone("quiz", 520, { left: W / 2 - 260, top: 300 })}
      <div class="abs" style="left:250px;top:620px;transform:rotate(-4deg) scale(1.6);transform-origin:left top">${FLOAT.exam()}</div>
      <div class="abs" style="right:230px;top:760px;transform:rotate(4deg) scale(1.6);transform-origin:right top">${FLOAT.answer()}</div>
      ${listTop("<em>800+</em> practice questions")}` },
];

// Google Play feature graphic 1024x500: the line and icon on the left, the app on the right
const FEATURES = [
  { name: "Phone", draw: (W, H) => `${backdrop(W, H, { gx: .74, gy: .7, glow: .8 })}
      <div class="abs" style="left:64px;top:0;bottom:0;width:520px;display:flex;flex-direction:column;justify-content:center;gap:26px">
        <div style="display:flex;align-items:center;gap:18px">${appIcon(76)}<div class="d" style="font-size:34px;color:#F4F1F8;letter-spacing:-.03em">SAT Learner</div></div>
        ${headline("Hit <em>800</em> on<br>SAT Math", { size: 78, align: "left" })}
      </div>
      ${phone("exam", 300, { left: 640, top: 70, rotate: -6, android: true })}
      <div class="abs" style="left:560px;top:330px;transform:rotate(3deg) scale(.8);transform-origin:left top">${FLOAT.exam()}</div>` },
  { name: "Cards", draw: (W, H) => `${backdrop(W, H, { gx: .5, gy: .5, glow: .9 })}
      <div class="abs" style="inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px">
        ${appIcon(110)}${headline("Hit <em>800</em> on SAT Math", { size: 60 })}</div>
      <div class="abs" style="left:40px;top:60px;transform:rotate(-8deg) scale(.8);transform-origin:left top">${FLOAT.exam()}</div>
      <div class="abs" style="right:40px;top:50px;transform:rotate(7deg) scale(.8);transform-origin:right top">${FLOAT.planner()}</div>
      <div class="abs" style="left:60px;bottom:50px;transform:rotate(6deg) scale(.8);transform-origin:left bottom">${FLOAT.answer()}</div>
      <div class="abs" style="right:60px;bottom:50px;transform:rotate(-6deg) scale(.8);transform-origin:right bottom">${FLOAT.profile()}</div>` },
];

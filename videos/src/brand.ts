import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { Easing, interpolate } from "remotion";

// The 2026 redesign palette (website/app/globals.css): lavender, butter, white, ink, plus mint and rose.
// Pastel cards keep dark ink; black cards carry white or butter text.
export const C = {
  lav: "#E4CDFF",
  lavDeep: "#C9AAFB",
  violet: "#7C4DDB",
  butter: "#FEE7A6",
  mint: "#CDEFD9",
  green: "#1F9D55",
  rose: "#FFD6DE",
  red: "#E0446A",
  ink: "#0B0A0F",
  ink2: "#4A4458",
  white: "#FFFFFF",
};

export const heading = loadOutfit("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin"] }).fontFamily;
export const body = loadManrope("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;

// Graph-paper texture used on the pastel surfaces
export const graphPaper = (color = "rgba(11,10,15,.06)", step = 48): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
  backgroundSize: `${step}px ${step}px`,
});

const out = Easing.out(Easing.cubic);

// 0 → 1 while s runs from `from` to `from + dur`, eased
export const ramp = (s: number, from: number, dur = 0.4, easing = out) =>
  interpolate(s, [from, from + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

// Overshooting pop for things that appear
// (exactly 0 before it starts: the back easing leaves float dust there, and callers test k > 0)
export const pop = (s: number, from: number, dur = 0.45) => (s <= from ? 0 : ramp(s, from, dur, Easing.out(Easing.back(1.8))));

// 1 while s is inside [from, to], fading in and out over `fade`
export const hold = (s: number, from: number, to: number, fade = 0.35) => Math.min(ramp(s, from - fade, fade), 1 - ramp(s, to - fade, fade));

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

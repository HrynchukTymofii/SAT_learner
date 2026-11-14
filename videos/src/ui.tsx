import katex from "katex";
import "katex/dist/katex.min.css";
import React from "react";
import { C, heading } from "./brand";

export const Tex: React.FC<{ tex: string; style?: React.CSSProperties }> = ({ tex, style }) => (
  <span style={style} dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { throwOnError: false }) }} />
);

// The app icon: graduation cap on a lavender tile
export const Logo: React.FC<{ size: number; tile?: string }> = ({ size, tile = C.lav }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, background: tile, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
    <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 1024 1024" fill="none" stroke={C.ink} strokeWidth={64} strokeLinecap="round" strokeLinejoin="round">
      <path d="M90 430 L500 300 Q530 290 560 300 L960 430 L560 560 Q530 570 500 560 Z" fill={C.white} />
      <path d="M316 525 V690 Q530 760 735 690 V590" />
      <path d="M525 405 L800 495 V720" />
    </svg>
  </div>
);

export const Brand: React.FC<{ size?: number; sub?: string; dark?: boolean }> = ({ size = 84, sub, dark }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.26 }}>
    <Logo size={size} tile={dark ? C.lav : C.white} />
    <div>
      <div style={{ fontFamily: heading, fontWeight: 800, fontSize: size * 0.5, lineHeight: 1.05, color: dark ? C.white : C.ink }}>SAT Math Learner</div>
      {sub && <div style={{ fontFamily: heading, fontWeight: 600, fontSize: size * 0.32, marginTop: 4, color: dark ? C.lav : C.ink2 }}>{sub}</div>}
    </div>
  </div>
);

// Text that lights up word by word as the voice reads it (p = share already read)
export const ReadAlong: React.FC<{ text: string; p: number; style?: React.CSSProperties; hi?: string }> = ({ text, p, style, hi = C.violet }) => {
  const words = text.split(" ");
  const n = Math.round(p * words.length);
  return (
    <div style={style}>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i < n ? 1 : 0.35, color: i === n - 1 ? hi : undefined }}>
          {w}{" "}
        </span>
      ))}
    </div>
  );
};

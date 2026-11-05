import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Line } from "react-native-svg";
import { Check, Lock } from "lucide-react-native";
import { Fonts, usePalette } from "@/constants/palette";
import type { Achievement } from "@/lib/achievements";
import { BadgeArt } from "./BadgeArt";

const SIZE = 112; // medal
const R = SIZE / 2 - 5; // inner disc radius (leaves room for the ring)

/**
 * Medal for one achievement: its own maths drawing on a pastel disc with graph paper.
 * Locked: grey line-art inside a progress ring that fills as you get closer.
 */
export function AchievementBadge({ achievement: a }: { achievement: Achievement }) {
  const c = usePalette();
  const pct = Math.max(0, Math.min(1, a.current / a.target));
  const ringR = SIZE / 2 - 2;
  const circ = 2 * Math.PI * ringR;
  const discFill = a.unlocked ? c[a.tone] : c.surface2;
  const ink = a.unlocked ? c.onPastel : c.subtle;
  const clipId = `clip-${a.id}`;
  const art = 70; // drawing size inside the disc (1.5x the first version)
  const fmt = (n: number) => n.toLocaleString();

  return (
    <View
      style={{
        width: "48.5%",
        borderRadius: 24,
        paddingTop: 16,
        paddingBottom: 14,
        paddingHorizontal: 12,
        alignItems: "center",
        gap: 10,
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: a.unlocked ? c[a.tone] : c.line,
      }}
    >
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <ClipPath id={clipId}>
              <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} />
            </ClipPath>
          </Defs>
          {/* disc + graph paper */}
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill={discFill} />
          {a.unlocked && (
            <G clipPath={`url(#${clipId})`}>
              {Array.from({ length: 11 }, (_, i) => (
                <G key={i}>
                  <Line x1={i * 11 + 3} y1={0} x2={i * 11 + 3} y2={SIZE} stroke="#0B0A0F" strokeOpacity={0.08} strokeWidth={1} />
                  <Line x1={0} y1={i * 11 + 3} x2={SIZE} y2={i * 11 + 3} stroke="#0B0A0F" strokeOpacity={0.08} strokeWidth={1} />
                </G>
              ))}
            </G>
          )}
          {/* ring: solid when unlocked, progress when locked */}
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={ringR} fill="none" stroke={a.unlocked ? c.onPastel : c.line} strokeWidth={a.unlocked ? 2 : 3.5} opacity={a.unlocked ? 0.85 : 1} />
          {!a.unlocked && pct > 0 && (
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={ringR}
              fill="none"
              stroke={c.brand}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeDasharray={`${circ * pct} ${circ}`}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          )}
          {/* the drawing */}
          <G transform={`translate(${(SIZE - art) / 2} ${(SIZE - art) / 2}) scale(${art / 64})`} opacity={a.unlocked ? 1 : 0.8}>
            <BadgeArt id={a.id} ink={ink} fill={a.unlocked ? "#fff" : c.surface} />
          </G>
        </Svg>
        <View
          style={{
            position: "absolute",
            right: 2,
            bottom: 2,
            width: 26,
            height: 26,
            borderRadius: 13,
            borderWidth: 2.5,
            borderColor: c.surface,
            backgroundColor: a.unlocked ? c.success : c.surface2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {a.unlocked ? <Check size={13} color="#fff" strokeWidth={3} /> : <Lock size={11} color={c.muted} strokeWidth={2.4} />}
        </View>
      </View>

      <View style={{ alignItems: "center", gap: 3 }}>
        <Text style={{ fontFamily: Fonts.display, fontSize: 15.5, lineHeight: 19, color: c.ink, textAlign: "center" }} numberOfLines={1}>
          {a.title}
        </Text>
        <Text style={{ fontFamily: Fonts.bodySemi, fontSize: 12, lineHeight: 16, color: c.muted, textAlign: "center" }} numberOfLines={2}>
          {a.description}
        </Text>
      </View>

      <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: a.unlocked ? c[a.tone] : c.surface2 }}>
        <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 11, color: a.unlocked ? c.onPastel : c.muted }}>
          {a.unlocked ? "Unlocked" : `${fmt(a.current)} / ${fmt(a.target)}`}
        </Text>
      </View>
    </View>
  );
}

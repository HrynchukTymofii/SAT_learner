/**
 * Line illustrations drawn on pastel cards (same style as the mockups): black strokes, butter/white accents.
 */
import React from "react";
import Svg, { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";

const INK = "#0B0A0F";

/** A line on axes with two points: "slope" picture for the continue card. */
export function SlopeArt({ width = 136, height = 128 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 170 160" fill="none">
      <G stroke={INK} strokeWidth={2.4} strokeLinecap="round">
        <Path d="M30 140V20M20 120h140" />
        <Path d="M30 20l-5 8M30 20l5 8M160 120l-8-5M160 120l-8 5" />
        <Path d="M36 132 150 36" strokeWidth={4} />
        <Circle cx={72} cy={102} r={7} fill="#fff" />
        <Circle cx={118} cy={63} r={7} fill={INK} />
        <Path d="M72 102h46v-39" strokeDasharray="4 6" />
      </G>
      <SvgText x={122} y={104} fontSize={16} fontWeight="600" fill={INK}>
        Δx
      </SvgText>
      <G transform="translate(128 6)">
        <Rect width={38} height={24} rx={12} fill={INK} />
        <SvgText x={19} y={16.5} textAnchor="middle" fontSize={12} fontWeight="700" fill="#FEE7A6">
          y=mx
        </SvgText>
      </G>
    </Svg>
  );
}

/** Parabola with a calculator: cover art for the course / exams. */
export function ParabolaArt({ width = 335, height = 170 }: { width?: number | string; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 335 190" fill="none" preserveAspectRatio="xMidYMid meet">
      <G stroke={INK} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M40 160V30M24 140h290" />
        <Path d="M60 40c30 150 120 150 160 0" strokeWidth={4} />
        <Circle cx={140} cy={128} r={8} fill="#FEE7A6" />
        <Path d="M140 128v12" strokeDasharray="3 5" />
        <G transform="translate(232 30) rotate(12)">
          <Rect width={70} height={96} rx={12} fill="#fff" />
          <Rect x={10} y={10} width={50} height={20} rx={5} fill="#C9AAFB" />
          <G fill={INK} stroke="none">
            <Circle cx={20} cy={45} r={5} />
            <Circle cx={35} cy={45} r={5} />
            <Circle cx={50} cy={45} r={5} />
            <Circle cx={20} cy={62} r={5} />
            <Circle cx={35} cy={62} r={5} />
            <Circle cx={50} cy={62} r={5} />
            <Circle cx={20} cy={79} r={5} />
            <Circle cx={35} cy={79} r={5} />
          </G>
          <Rect x={45} y={74} width={10} height={10} rx={3} fill="#FEE7A6" stroke={INK} strokeWidth={2} />
        </G>
        <Path d="M268 160l14-14 14 14" />
      </G>
      <SvgText x={74} y={74} fontSize={22} fontWeight="700" fill={INK}>
        x²
      </SvgText>
    </Svg>
  );
}

/** Stopwatch: practice exam art. */
export function StopwatchArt({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <G stroke={INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx={50} cy={56} r={32} fill="#fff" />
        <Path d="M42 14h16M50 14v10M76 30l6-6" />
        <Path d="M50 56V36" strokeWidth={3.4} />
        <Path d="M50 56l14 8" />
        <Circle cx={50} cy={56} r={4} fill={INK} />
      </G>
    </Svg>
  );
}

/** Crown with sparkles: PRO upsell art. */
export function CrownArt({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <G stroke={INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 70 12 32l22 18 16-26 16 26 22-18-6 38z" fill="#FEE7A6" />
        <Path d="M20 80h60" strokeWidth={3.4} />
        <Circle cx={12} cy={32} r={4} fill="#fff" />
        <Circle cx={50} cy={24} r={4} fill="#fff" />
        <Circle cx={88} cy={32} r={4} fill="#fff" />
        <Path d="M84 8v8M80 12h8M14 6v6M11 9h6" />
      </G>
    </Svg>
  );
}

/** Target with arrow: score / goals art. */
export function TargetArt({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <G stroke={INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx={46} cy={54} r={34} fill="#fff" />
        <Circle cx={46} cy={54} r={22} />
        <Circle cx={46} cy={54} r={10} fill="#C9AAFB" />
        <Path d="M46 54 84 16" strokeWidth={3.2} />
        <Path d="M76 14l8 2 2 8" />
      </G>
    </Svg>
  );
}

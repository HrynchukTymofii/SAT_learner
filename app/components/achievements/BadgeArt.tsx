import React from "react";
import { Circle, G, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";

/**
 * One maths drawing per achievement, on a 64x64 grid. `ink` is the stroke colour
 * (dark on a pastel medal, muted grey when locked); `fill` is the accent fill.
 */
export function BadgeArt({ id, ink, fill }: { id: string; ink: string; fill: string }) {
  const s = { stroke: ink, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const label = (x: number, y: number, t: string, size = 11, anchor: "start" | "middle" | "end" = "middle") => (
    <SvgText x={x} y={y} fontSize={size} fontWeight="700" fill={ink} textAnchor={anchor} fontFamily="Outfit_700Bold">
      {t}
    </SvgText>
  );

  switch (id) {
    // ---------------- Learning
    case "lesson-1": // first step on a staircase
      return (
        <G>
          <Path {...s} d="M8 52 H20 V42 H32 V32 H44 V22 H56" />
          <Circle cx={14} cy={46} r={4.5} fill={fill} stroke={ink} strokeWidth={2.2} />
          <Path {...s} strokeDasharray="2 4" d="M14 40 Q20 30 26 36" />
        </G>
      );
    case "lesson-10": // number line, jumping by 10
      return (
        <G>
          <Path {...s} d="M6 44 H58 M54 40 L58 44 L54 48" />
          {[10, 24, 38, 52].map((x) => (
            <Path key={x} {...s} d={`M${x} 40 V48`} />
          ))}
          <Path {...s} d="M10 38 Q17 22 24 38 M24 38 Q31 22 38 38" />
          <Circle cx={38} cy={38} r={3.5} fill={fill} stroke={ink} strokeWidth={2} />
          {label(17, 58, "0", 9)}
          {label(45, 58, "+10", 9)}
        </G>
      );
    case "lesson-30": // open book with a sigma
      return (
        <G>
          <Path {...s} d="M32 18 C24 13 14 13 8 16 V50 C14 47 24 47 32 52 C40 47 50 47 56 50 V16 C50 13 40 13 32 18 Z" fill={fill} />
          <Path {...s} d="M32 18 V52" />
          <Path {...s} strokeWidth={2.2} d="M45 24 H38 L42 31 L38 38 H45" />
          <Path {...s} strokeWidth={1.8} d="M14 26 H25 M14 32 H25 M14 38 H22" />
        </G>
      );
    case "lesson-60": // cap + pi
      return (
        <G>
          <Polygon points="32,12 60,24 32,36 4,24" fill={fill} stroke={ink} strokeWidth={2.4} strokeLinejoin="round" />
          <Path {...s} d="M16 30 V42 C22 48 42 48 48 42 V30" />
          <Path {...s} d="M56 26 V40" />
          <Circle cx={56} cy={42} r={2.5} fill={ink} />
          <Path {...s} strokeWidth={2.2} d="M25 56 H39 M29 56 V48 M35 56 V48" transform="translate(0 -1)" />
        </G>
      );
    case "chapter-1": // full circle, closed
      return (
        <G>
          <Circle cx={32} cy={32} r={22} fill={fill} stroke={ink} strokeWidth={2.4} />
          <Path {...s} strokeWidth={3} d="M22 33 L29 40 L43 25" />
          <Path {...s} strokeWidth={1.6} strokeDasharray="1 5" d="M32 4 V10 M32 54 V60 M4 32 H10 M54 32 H60" />
        </G>
      );
    case "chapter-5": // half a pie chart
      return (
        <G>
          <Circle cx={32} cy={32} r={22} {...s} />
          <Path d="M32 32 V10 A22 22 0 0 1 32 54 Z" fill={fill} stroke={ink} strokeWidth={2.4} strokeLinejoin="round" />
          <Path {...s} d="M32 32 L51 21" />
          {label(20, 36, "½", 13)}
        </G>
      );

    // ---------------- Practice
    case "quiz-1": // x = ?
      return (
        <G>
          <Rect x={8} y={16} width={48} height={32} rx={10} fill={fill} stroke={ink} strokeWidth={2.4} />
          {label(32, 38, "x = ?", 15)}
          <Path {...s} d="M46 48 L50 56 L54 48" />
        </G>
      );
    case "quiz-10": // circle equation on a graph
      return (
        <G>
          <Path {...s} strokeWidth={1.6} d="M32 6 V58 M6 32 H58" />
          <Circle cx={32} cy={32} r={16} fill={fill} fillOpacity={0.9} stroke={ink} strokeWidth={2.6} />
          <Circle cx={43.3} cy={20.7} r={3} fill={ink} />
          {label(32, 62, "x²+y²=r²", 8.5)}
        </G>
      );
    case "quiz-25": // operations gear
      return (
        <G>
          <Path
            d="M32 8 l4 6 7-2 1 7 7 2-3 6 5 5-6 3 1 7-7 0-3 6-6-4-6 4-3-6-7 0 1-7-6-3 5-5-3-6 7-2 1-7 7 2z"
            fill={fill}
            stroke={ink}
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
          <Path {...s} strokeWidth={2} d="M25 27 H31 M28 24 V30 M34 27 H40 M25 38 L30 43 M30 38 L25 43" />
          <Circle cx={37} cy={37.5} r={1.3} fill={ink} />
          <Path {...s} strokeWidth={2} d="M34 40.5 H40" />
          <Circle cx={37} cy={43.5} r={1.3} fill={ink} />
        </G>
      );
    case "perfect-1": // 100%
      return (
        <G>
          <Circle cx={32} cy={32} r={23} {...s} />
          <Path d="M32 9 A23 23 0 1 1 31.9 9" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.25} />
          {label(32, 37, "100%", 14)}
          <Polygon points="32,52 34,57 39,57 35,60 36.5,64 32,61.5 27.5,64 29,60 25,57 30,57" fill={fill} stroke={ink} strokeWidth={1.4} transform="translate(0 -6)" />
        </G>
      );
    case "perfect-5": // pentagon with pentagram
      return (
        <G>
          <Polygon points="32,7 56,25 47,54 17,54 8,25" fill={fill} stroke={ink} strokeWidth={2.4} strokeLinejoin="round" />
          <Path {...s} strokeWidth={1.8} d="M32 7 L47 54 L8 25 H56 L17 54 Z" />
          <Circle cx={32} cy={7} r={2.6} fill={ink} />
        </G>
      );
    case "retake-1": // curve that dips, then climbs higher
      return (
        <G>
          <Path {...s} strokeWidth={1.6} d="M8 8 V56 H58" />
          <Path {...s} d="M10 34 C18 34 20 46 28 46 C38 46 40 14 54 12" />
          <Path {...s} d="M48 10 L55 11 L53 18" />
          <Circle cx={10} cy={34} r={3.5} fill="#fff" stroke={ink} strokeWidth={2} />
          <Circle cx={54} cy={12} r={3.5} fill={fill} stroke={ink} strokeWidth={2} />
          <Path {...s} strokeWidth={1.4} strokeDasharray="2 4" d="M10 34 H54" />
        </G>
      );
    case "saved-5": // five bookmarks, growing
      return (
        <G>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 8 + i * 10;
            const top = 40 - i * 6;
            return <Path key={i} d={`M${x} ${top} H${x + 8} V56 L${x + 4} 52 L${x} 56 Z`} fill={i === 4 ? fill : "none"} stroke={ink} strokeWidth={2} strokeLinejoin="round" />;
          })}
          <Path {...s} strokeWidth={1.4} strokeDasharray="2 4" d="M10 36 L54 12" />
        </G>
      );

    // ---------------- Exams
    case "exam-1": // stopwatch with the 70 min sector
      return (
        <G>
          <Circle cx={32} cy={36} r={21} fill="#fff" stroke={ink} strokeWidth={2.4} />
          <Path d="M32 36 V15 A21 21 0 1 1 14.4 47.4 Z" fill={fill} stroke="none" />
          <Circle cx={32} cy={36} r={21} {...s} />
          <Path {...s} d="M27 8 H37 M32 8 V15 M48 18 L52 14" />
          <Path {...s} strokeWidth={3} d="M32 36 L32 22" />
          <Circle cx={32} cy={36} r={2.8} fill={ink} />
        </G>
      );
    case "exam-3": // three stacked papers
      return (
        <G>
          <Rect x={18} y={8} width={30} height={38} rx={4} {...s} />
          <Rect x={14} y={13} width={30} height={38} rx={4} fill="#fff" stroke={ink} strokeWidth={2.4} />
          <Rect x={10} y={18} width={30} height={38} rx={4} fill={fill} stroke={ink} strokeWidth={2.4} />
          <Path {...s} strokeWidth={1.8} d="M16 28 H34 M16 35 H34 M16 42 H27" />
          {label(52, 60, "×3", 12)}
        </G>
      );
    case "exam-600": // rising bar chart
      return (
        <G>
          <Path {...s} strokeWidth={1.6} d="M6 56 H58" />
          <Rect x={10} y={38} width={10} height={18} rx={2} {...s} />
          <Rect x={27} y={28} width={10} height={28} rx={2} {...s} />
          <Rect x={44} y={14} width={10} height={42} rx={2} fill={fill} stroke={ink} strokeWidth={2.4} />
          <Path {...s} strokeDasharray="2 4" d="M6 14 H58" />
          {label(20, 11, "600", 10)}
        </G>
      );
    case "exam-700": // bell curve, marker in the top tail
      return (
        <G>
          <Path {...s} strokeWidth={1.6} d="M4 52 H60" />
          <Path d="M46 52 V31 C50 40 54 48 60 50 V52 Z" fill={fill} stroke="none" />
          <Path {...s} d="M4 50 C16 48 20 12 32 12 C44 12 48 48 60 50" />
          <Path {...s} d="M46 56 V24" />
          {label(46, 20, "700", 10)}
        </G>
      );
    case "exam-800": // crown + 800
      return (
        <G>
          <Path d="M10 44 L6 18 L22 30 L32 12 L42 30 L58 18 L54 44 Z" fill={fill} stroke={ink} strokeWidth={2.4} strokeLinejoin="round" />
          <Path {...s} d="M10 52 H54" />
          {[6, 32, 58].map((x, i) => (
            <Circle key={x} cx={x} cy={i === 1 ? 12 : 18} r={2.6} fill={ink} />
          ))}
          {label(32, 41, "800", 12)}
        </G>
      );

    // ---------------- Habits
    case "streak-3": // arithmetic sequence of rising dots
      return (
        <G>
          <Path {...s} strokeWidth={1.6} strokeDasharray="2 4" d="M10 50 L54 14" />
          <Circle cx={14} cy={46} r={6} {...s} />
          <Circle cx={32} cy={32} r={7.5} fill="#fff" stroke={ink} strokeWidth={2.4} />
          <Circle cx={50} cy={17} r={9} fill={fill} stroke={ink} strokeWidth={2.4} />
          {label(50, 21, "3", 11)}
        </G>
      );
    case "streak-7": // seven points on an arc
      return (
        <G>
          <Path {...s} strokeWidth={1.6} d="M8 50 A26 26 0 0 1 56 50" />
          {Array.from({ length: 7 }, (_, i) => {
            const ang = Math.PI - (i * Math.PI) / 6;
            const x = 32 + 24 * Math.cos(ang);
            const y = 50 - 24 * Math.sin(ang);
            return <Circle key={i} cx={x} cy={y} r={4} fill={i === 6 ? fill : ink} stroke={ink} strokeWidth={1.6} />;
          })}
          {label(32, 50, "7", 16)}
        </G>
      );
    case "days-30": // month grid with ticks
      return (
        <G>
          <Rect x={8} y={12} width={48} height={44} rx={8} fill={fill} stroke={ink} strokeWidth={2.4} />
          <Path {...s} d="M8 24 H56 M20 8 V16 M44 8 V16" />
          {Array.from({ length: 12 }, (_, i) => {
            const x = 15 + (i % 4) * 11;
            const y = 31 + Math.floor(i / 4) * 8;
            return i < 10 ? (
              <Path key={i} {...s} strokeWidth={1.8} d={`M${x - 2.5} ${y} L${x - 0.5} ${y + 2.2} L${x + 3} ${y - 2}`} />
            ) : (
              <Circle key={i} cx={x} cy={y} r={1.6} fill={ink} />
            );
          })}
        </G>
      );
    case "points-1000": // scatter on a line, 10³
      return (
        <G>
          <Path {...s} strokeWidth={1.6} d="M8 8 V56 H58" />
          <Path {...s} d="M10 52 L56 12" />
          {[
            [16, 44],
            [24, 41],
            [30, 33],
            [38, 30],
            [44, 22],
          ].map(([x, y]) => (
            <Circle key={x} cx={x} cy={y} r={2.8} fill={ink} />
          ))}
          <Circle cx={52} cy={15} r={5} fill={fill} stroke={ink} strokeWidth={2.2} />
          {label(20, 20, "10³", 12)}
        </G>
      );
    default:
      return <Circle cx={32} cy={32} r={20} {...s} />;
  }
}

import React from "react";
import Animated, { useAnimatedProps, useFrameCallback, useSharedValue } from "react-native-reanimated";
import Svg, { G, Line, Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const INK = "#0B0A0F";

// Timings (ms)
const CUBE_MS = 8000; // one full turn of the cube
const DRIFT_MS = 20000; // the parabola's slow sway
const HOLD_MS = 2000; // dot rests at each end
const GLIDE_MS = 5500; // dot glides from one side to the other
const DOT_MS = 2 * (HOLD_MS + GLIDE_MS);

// Cube corners and the 12 edges between them
const V = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];
const E = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

/**
 * Paywall header: a slowly turning wireframe cube next to a parabola with a point sliding
 * along the top of it (with its tangent). Drawn for a pastel background.
 */
export function GeometryAnimation({ width, height = 190 }: { width: number; height?: number }) {
  // One clock for everything (milliseconds since the header appeared). It never restarts,
  // so nothing jumps; every motion below is a smooth function of it.
  const t = useSharedValue(0);
  useFrameCallback((frame) => {
    t.value = frame.timeSinceFirstFrame;
  });

  // Layout: graph on the left 55%, cube on the right
  const gx0 = 18;
  const gx1 = width * 0.56;
  const baseY = height - 28;
  const h = (gx0 + gx1) / 2; // parabola vertex x
  const k = 46; // vertex y (top)
  const a = (baseY - 12 - k) / ((gx1 - h) * (gx1 - h)); // opens downward in screen space -> y = k + a(x-h)^2
  const cubeCx = width * 0.79;
  const cubeCy = height * 0.5;
  const cubeS = Math.min(width * 0.13, 46);

  // The parabola drifts a little: its vertex sways sideways and bobs up and down,
  // while the point slides along it the other way
  const span = gx1 - gx0;
  // Pure helpers: they take the animated numbers as arguments. Each useAnimatedProps below
  // reads t.value / p.value itself, because Reanimated only redraws when a shared value is
  // read directly in that worklet (reading it inside a helper left the dot frozen).
  const vx = (tv: number) => {
    "worklet";
    return h + span * 0.04 * Math.sin((tv / DRIFT_MS) * Math.PI * 2);
  };
  const vy = (tv: number) => {
    "worklet";
    return k + 4 * Math.sin((tv / DRIFT_MS) * Math.PI * 2 + 1);
  };
  const curveProps = useAnimatedProps(() => {
    const tv = t.value;
    const cxv = vx(tv);
    const cyv = vy(tv);
    let d = "";
    for (let i = 0; i <= 40; i++) {
      const x = gx0 + (span * i) / 40;
      const y = cyv + a * (x - cxv) * (x - cxv);
      d += (i ? " L " : "M ") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return { d };
  });

  const cubeProps = useAnimatedProps(() => {
    const ang = (t.value / CUBE_MS) * Math.PI * 2;
    const tilt = 0.5 + 0.12 * Math.sin(ang * 2);
    const cy = Math.cos(ang), sy = Math.sin(ang), cx = Math.cos(tilt), sx = Math.sin(tilt);
    const P: number[][] = [];
    for (let i = 0; i < 8; i++) {
      const [x0, y0, z0] = V[i];
      // rotate around Y, then X
      const x1 = x0 * cy + z0 * sy;
      const z1 = -x0 * sy + z0 * cy;
      const y2 = y0 * cx - z1 * sx;
      const z2 = y0 * sx + z1 * cx;
      const f = 4.2 / (z2 + 5.2); // perspective
      P.push([cubeCx + x1 * cubeS * f, cubeCy + y2 * cubeS * f]);
    }
    let d = "";
    for (let i = 0; i < 12; i++) {
      const e0 = P[E[i][0]], e1 = P[E[i][1]];
      d += "M " + e0[0].toFixed(1) + " " + e0[1].toFixed(1) + " L " + e1[0].toFixed(1) + " " + e1[1].toFixed(1) + " ";
    }
    return { d };
  });

  // Dot near the top of the curve: hold left, glide right, hold, glide back (one cycle = DOT_MS)
  const dotAt = (tv: number) => {
    "worklet";
    const ph = tv % DOT_MS;
    let pos; // -1 (left) .. 1 (right)
    if (ph < HOLD_MS) pos = -1;
    else if (ph < HOLD_MS + GLIDE_MS) pos = -Math.cos((Math.PI * (ph - HOLD_MS)) / GLIDE_MS);
    else if (ph < 2 * HOLD_MS + GLIDE_MS) pos = 1;
    else pos = Math.cos((Math.PI * (ph - 2 * HOLD_MS - GLIDE_MS)) / GLIDE_MS);
    const cxv = vx(tv);
    const x = cxv + (gx1 - h) * 0.4 * pos;
    const y = vy(tv) + a * (x - cxv) * (x - cxv);
    return { x, y, m: 2 * a * (x - cxv) }; // m = slope of the tangent there
  };
  // The dot is a path (a circle drawn with two arcs), animated through `d` like the curve and cube
  const dotProps = useAnimatedProps(() => {
    const { x, y } = dotAt(t.value);
    const r = 7;
    return { d: `M ${(x - r).toFixed(1)} ${y.toFixed(1)} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z` };
  });
  // Tangent line through the dot, tilting with the slope
  const tangentProps = useAnimatedProps(() => {
    const { x, y, m } = dotAt(t.value);
    const L = 34 / Math.sqrt(1 + m * m);
    return { d: `M ${(x - L).toFixed(1)} ${(y - m * L).toFixed(1)} L ${(x + L).toFixed(1)} ${(y + m * L).toFixed(1)}` };
  });

  const grid: React.ReactNode[] = [];
  for (let x = 0; x <= width; x += 22) grid.push(<Line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} stroke={INK} strokeOpacity={0.06} strokeWidth={1} />);
  for (let y = 0; y <= height; y += 22) grid.push(<Line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} stroke={INK} strokeOpacity={0.06} strokeWidth={1} />);

  return (
    <Svg width={width} height={height}>
      <G>{grid}</G>
      {/* axes */}
      <Path d={`M ${gx0} ${baseY} L ${gx1 + 8} ${baseY} M ${h} ${baseY + 6} L ${h} ${k - 22}`} stroke={INK} strokeWidth={1.6} strokeLinecap="round" opacity={0.55} />
      <AnimatedPath animatedProps={curveProps} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      <AnimatedPath animatedProps={tangentProps} stroke={INK} strokeWidth={1.8} strokeDasharray="4 5" strokeLinecap="round" />
      <AnimatedPath animatedProps={dotProps} fill="#FEE7A6" stroke={INK} strokeWidth={2.4} />
      {/* cube */}
      <AnimatedPath animatedProps={cubeProps} stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

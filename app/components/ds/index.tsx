/**
 * App design system: the building blocks every screen uses, so the whole app looks
 * like the approved mockups (redesign-previews/v3/app.html).
 *
 * - Pastel cards (lavender, butter, mint, rose) with a graph-paper texture, dark ink in both themes
 * - Round 46px icon buttons with a thin outline
 * - Black pill buttons with a round icon on the right
 * - Outfit for headings, Manrope for everything else
 */
import React, { ReactNode, useId } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { router } from "expo-router";
import { ArrowLeft, Check, ChevronRight, LucideIcon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Fonts, PastelName, usePalette } from "@/constants/palette";

// Space the floating tab bar takes at the bottom of tab screens
export const TAB_BAR_SPACE = 92; // bar height (64) + breathing room; Screen adds the safe-area inset
export const GUTTER = 20;

// ---------------------------------------------------------------- Tap

/**
 * Drop-in Pressable that works on phones with NativeWind.
 * NativeWind's Pressable wrapper drops `style={({ pressed }) => ...}` on iOS/Android (the web is fine),
 * which left every tappable card and chip unstyled. Tap tracks `pressed` itself and hands
 * Pressable a plain, flattened style. Use it instead of Pressable everywhere.
 */
export const Tap = React.forwardRef<View, PressableProps>(function Tap({ style, children, onPressIn, onPressOut, ...rest }, ref) {
  const [pressed, setPressed] = React.useState(false);
  const state = { pressed, hovered: false } as any;
  const resolved = typeof style === "function" ? style(state) : style;
  const kids = typeof children === "function" ? children(state) : children;
  return (
    <Pressable
      ref={ref}
      {...rest}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={StyleSheet.flatten(resolved as StyleProp<ViewStyle>)}
    >
      {kids}
    </Pressable>
  );
});

// ---------------------------------------------------------------- text

type Variant =
  | "hero" // 34, screen hero line
  | "title" // 28, screen title
  | "h2" // 20, section title
  | "h3" // 17, card title
  | "body" // 15
  | "bodyStrong"
  | "small" // 13, muted
  | "smallStrong"
  | "caption" // 12, muted
  | "label"; // 11 uppercase

const variantStyle: Record<Variant, TextStyle> = {
  hero: { fontFamily: Fonts.display, fontSize: 34, lineHeight: 37, letterSpacing: -0.8 },
  title: { fontFamily: Fonts.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.6 },
  h2: { fontFamily: Fonts.display, fontSize: 20, lineHeight: 25, letterSpacing: -0.3 },
  h3: { fontFamily: Fonts.display, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: Fonts.bodyBold, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: Fonts.bodySemi, fontSize: 13, lineHeight: 18 },
  smallStrong: { fontFamily: Fonts.bodyBold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: Fonts.bodySemi, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: Fonts.bodyHeavy, fontSize: 11, lineHeight: 14, letterSpacing: 0.8, textTransform: "uppercase" },
};

const mutedVariants: Variant[] = ["small", "caption", "label"];

export function T({
  variant = "body",
  color,
  style,
  onPastel,
  ...rest
}: TextProps & { variant?: Variant; color?: string; onPastel?: boolean }) {
  const c = usePalette();
  const base = onPastel ? c.onPastel : mutedVariants.includes(variant) ? c.muted : c.ink;
  return <Text {...rest} style={[variantStyle[variant], { color: color ?? base }, style]} />;
}

// ---------------------------------------------------------------- graph paper

/** Faint grid lines drawn over a pastel card. Put it first inside a card with overflow hidden. */
export function GraphPaper({ size = 18, color }: { size?: number; color?: string }) {
  const c = usePalette();
  const id = "gp" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
            <Path d={`M ${size} 0 L 0 0 0 ${size}`} fill="none" stroke={color ?? c.grid} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

// ---------------------------------------------------------------- surfaces

/** Pastel card with graph-paper texture. Text inside should use onPastel. */
export function PastelCard({
  tone = "lav",
  children,
  style,
  onPress,
  paper = true,
  radius = 28,
}: {
  tone?: PastelName;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  paper?: boolean;
  radius?: number;
}) {
  const c = usePalette();
  const content = (
    <>
      {paper && <GraphPaper />}
      {children}
    </>
  );
  const s = [{ backgroundColor: c[tone], borderRadius: radius, padding: 18, overflow: "hidden" as const }, style];
  if (onPress) {
    return (
      <Tap onPress={onPress} style={({ pressed }) => [s, pressed && styles.pressed]}>
        {content}
      </Tap>
    );
  }
  return <View style={s}>{content}</View>;
}

/** Plain card on the page: white (dark: near-black) with a thin outline. */
export function Card({
  children,
  style,
  onPress,
  disabled,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const c = usePalette();
  const s = [{ backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: 22, padding: 16 }, style];
  if (onPress) {
    return (
      <Tap disabled={disabled} onPress={onPress} style={({ pressed }) => [s, pressed && styles.pressed]}>
        {children}
      </Tap>
    );
  }
  return <View style={s}>{children}</View>;
}

// ---------------------------------------------------------------- buttons

export function CircleButton({
  icon: Icon,
  onPress,
  size = 46,
  onPastel,
  label,
  style,
  filled,
}: {
  icon: LucideIcon;
  onPress?: () => void;
  size?: number;
  onPastel?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
  filled?: boolean;
}) {
  const c = usePalette();
  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: onPastel ? "rgba(11,10,15,0.2)" : c.line,
          backgroundColor: filled ? (onPastel ? "#fff" : c.surface) : onPastel ? "transparent" : c.surface,
        },
        style,
        pressed && styles.pressed,
      ]}
    >
      <Icon size={Math.round(size * 0.44)} color={onPastel ? c.onPastel : c.ink} strokeWidth={1.9} />
    </Tap>
  );
}

/**
 * The main call to action: black pill (lavender-tinted ink in dark mode) with a round icon on the right.
 * `tone="white"` is the white pill used on pastel cards.
 */
export function PillButton({
  title,
  onPress,
  icon: Icon,
  tone = "ink",
  disabled,
  loading,
  style,
  center,
}: {
  title: string;
  onPress?: () => void;
  icon?: LucideIcon;
  /** "black" stays black in dark mode too: use it on pastel backgrounds */
  tone?: "ink" | "black" | "white" | "lav" | "soft" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  center?: boolean;
}) {
  const c = usePalette();
  const bg =
    tone === "ink" ? c.inkButton : tone === "black" ? "#0B0A0F" : tone === "white" ? "#fff" : tone === "lav" ? c.lav : tone === "danger" ? c.rose : c.surface2;
  const fg = tone === "ink" ? c.inkButtonText : tone === "black" ? "#fff" : tone === "soft" ? c.ink : c.onPastel;
  const dotBg = tone === "ink" || tone === "black" ? c.lav : c.onPastel;
  const dotFg = tone === "ink" || tone === "black" ? c.onPastel : "#fff";
  const showDot = !!Icon && !center;
  return (
    <Tap
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          minHeight: 56,
          borderRadius: 999,
          backgroundColor: bg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: showDot ? "space-between" : "center",
          paddingLeft: showDot ? 22 : 20,
          paddingRight: showDot ? 6 : 20,
          paddingVertical: 6,
          gap: 10,
          opacity: disabled ? 0.45 : 1,
        },
        style,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {center && Icon && <Icon size={19} color={fg} strokeWidth={2} />}
          <Text numberOfLines={1} style={{ fontFamily: Fonts.bodyBold, fontSize: 16, color: fg, flexShrink: 1 }}>
            {title}
          </Text>
          {showDot && (
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: dotBg, alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color={dotFg} strokeWidth={2.1} />
            </View>
          )}
        </>
      )}
    </Tap>
  );
}

/** Small text button / link in the brand color. */
export function LinkButton({ title, onPress, onPastel }: { title: string; onPress?: () => void; onPastel?: boolean }) {
  const c = usePalette();
  return (
    <Tap hitSlop={10} onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 13.5, color: onPastel ? c.onPastel : c.brand }}>{title}</Text>
    </Tap>
  );
}

// ---------------------------------------------------------------- small pieces

export function Chip({
  label,
  tone,
  count,
  active,
  onPress,
  icon: Icon,
}: {
  label: string;
  tone?: PastelName;
  count?: number | string;
  active?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
}) {
  const c = usePalette();
  const bg = active ? c.inkButton : tone ? c[tone] : c.surface;
  const fg = active ? c.inkButtonText : tone ? c.onPastel : c.ink;
  return (
    <Tap
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
          borderRadius: 999,
          paddingVertical: 9,
          paddingLeft: Icon ? 12 : 15,
          paddingRight: count != null ? 9 : 15,
          backgroundColor: bg,
          borderWidth: !tone && !active ? 1.5 : 0,
          borderColor: c.line,
        },
        pressed && styles.pressed,
      ]}
    >
      {Icon && <Icon size={15} color={fg} strokeWidth={2} />}
      <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 13, color: fg }}>{label}</Text>
      {count != null && (
        <View style={{ backgroundColor: active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
          <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 11.5, color: fg }}>{count}</Text>
        </View>
      )}
    </Tap>
  );
}

/** Little rounded label: PRO, Free, Medium... */
export function Tag({
  label,
  tone,
  icon: Icon,
  solid,
  style,
}: {
  label: string;
  tone?: PastelName | "ink";
  icon?: LucideIcon;
  solid?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = usePalette();
  const bg = tone === "ink" || solid ? c.inkButton : tone ? c[tone] : c.surface2;
  const fg = tone === "ink" || solid ? c.inkButtonText : tone ? c.onPastel : c.muted;
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }, style]}>
      {Icon && <Icon size={12} color={fg} strokeWidth={2.2} />}
      <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 11.5, color: fg }}>{label}</Text>
    </View>
  );
}

export function ProBadge() {
  const c = usePalette();
  return (
    <View style={{ backgroundColor: c.ink, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
      <Text style={{ fontFamily: Fonts.bodyHeavy, fontSize: 10, letterSpacing: 0.8, color: c.bg }}>PRO</Text>
    </View>
  );
}

export function ProgressBar({
  value,
  onPastel,
  height = 6,
  color,
  track,
  style,
}: {
  value: number; // 0..100
  onPastel?: boolean;
  height?: number;
  color?: string;
  track?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const c = usePalette();
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <View style={[{ height, borderRadius: height, backgroundColor: track ?? (onPastel ? "rgba(11,10,15,0.12)" : c.line), overflow: "hidden" }, style]}>
      {/* Plain fill from the left edge; the rounded track clips it. A rounded fill turns into a
          sliding dot at low values on phones, so it has no radius of its own. */}
      <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v}%`, backgroundColor: color ?? (onPastel ? c.onPastel : c.ink) }} />
    </View>
  );
}

/** Rounded square with an icon, in a pastel tone. */
export function IconTile({
  icon: Icon,
  tone = "lav",
  size = 40,
  radius,
  iconColor,
}: {
  icon: LucideIcon;
  tone?: PastelName | "white" | "ink";
  size?: number;
  radius?: number;
  iconColor?: string;
}) {
  const c = usePalette();
  const bg = tone === "white" ? "#fff" : tone === "ink" ? c.onPastel : c[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: radius ?? size * 0.32, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Icon size={Math.round(size * 0.5)} color={iconColor ?? (tone === "ink" ? "#fff" : c.onPastel)} strokeWidth={1.9} />
    </View>
  );
}

/** Square pastel thumbnail with a number or short text, used in lists. */
export function Thumb({ text, tone = "lav", size = 54 }: { text: string; tone?: PastelName | "neutral"; size?: number }) {
  const c = usePalette();
  const neutral = tone === "neutral";
  return (
    <View style={{ width: size, height: size, borderRadius: 15, backgroundColor: neutral ? c.surface2 : c[tone], overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
      {!neutral && <GraphPaper size={12} />}
      <Text style={{ fontFamily: Fonts.displayBold, fontSize: size > 46 ? 18 : 16, color: neutral ? c.ink : c.onPastel }}>{text}</Text>
    </View>
  );
}

/** One row in a list: thumbnail/icon, title, subtitle, and something on the right. */
export function ListRow({
  left,
  title,
  subtitle,
  right,
  onPress,
  disabled,
  style,
  chevron,
}: {
  left?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  chevron?: boolean;
}) {
  const c = usePalette();
  return (
    <Tap
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: c.surface,
          borderColor: c.line,
          borderWidth: 1,
          borderRadius: 20,
          padding: 10,
          paddingRight: 14,
          minHeight: 64,
        },
        style,
        pressed && styles.pressed,
      ]}
    >
      {left}
      <View style={{ flex: 1, minWidth: 0, paddingLeft: left ? 0 : 6 }}>
        <T variant="bodyStrong" numberOfLines={2}>
          {title}
        </T>
        {!!subtitle && (
          <T variant="caption" numberOfLines={2} style={{ marginTop: 2 }}>
            {subtitle}
          </T>
        )}
      </View>
      {right}
      {chevron && <ChevronRight size={18} color={c.subtle} />}
    </Tap>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }, style]}>
      <T variant="h2">{title}</T>
      {!!action && <LinkButton title={action} onPress={onAction} />}
    </View>
  );
}

// ---------------------------------------------------------------- screen chrome

/**
 * Top bar for pushed screens: round back button, optional centred title, optional right slot.
 */
export function TopBar({
  title,
  onBack,
  right,
  onPastel,
  back = true,
  style,
}: {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  onPastel?: boolean;
  back?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 46, gap: 12 }, style]}>
      {back ? (
        <CircleButton
          icon={ArrowLeft}
          label="Back"
          onPastel={onPastel}
          onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/(tabs)")))}
        />
      ) : (
        <View style={{ width: 46 }} />
      )}
      {!!title && (
        <T variant="h3" onPastel={onPastel} numberOfLines={1} style={{ flex: 1, textAlign: "center", fontSize: 18 }}>
          {title}
        </T>
      )}
      {right ?? <View style={{ width: 46 }} />}
    </View>
  );
}

/**
 * A full screen on the app background with safe-area padding.
 * `scroll` (default) wraps children in a ScrollView; `tab` leaves room for the floating tab bar.
 */
export function Screen({
  children,
  scroll = true,
  tab,
  header,
  footer,
  bg,
  contentStyle,
  scrollProps,
  scrollRef,
}: {
  children?: ReactNode;
  scroll?: boolean;
  tab?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  bg?: string;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: ScrollViewProps;
  scrollRef?: React.Ref<ScrollView>;
}) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const bottom = tab ? TAB_BAR_SPACE + insets.bottom : footer ? 16 : insets.bottom + 32;
  return (
    <View style={{ flex: 1, backgroundColor: bg ?? c.bg }}>
      {header && <View style={{ paddingTop: insets.top + 8, paddingHorizontal: GUTTER, paddingBottom: 8 }}>{header}</View>}
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...scrollProps}
          contentContainerStyle={[
            { paddingHorizontal: GUTTER, paddingTop: header ? 8 : insets.top + 12, paddingBottom: bottom, gap: 18 },
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingHorizontal: GUTTER, paddingTop: header ? 8 : insets.top + 12 }, contentStyle]}>{children}</View>
      )}
      {footer && (
        <View style={{ paddingHorizontal: GUTTER, paddingTop: 10, paddingBottom: insets.bottom + 14, backgroundColor: bg ?? c.bg }}>
          {footer}
        </View>
      )}
    </View>
  );
}

/** Friendly empty / error state. */
export function EmptyState({
  icon,
  title,
  text,
  action,
  onAction,
  tone = "lav",
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: string;
  onAction?: () => void;
  tone?: PastelName;
}) {
  return (
    <Card style={{ alignItems: "center", paddingVertical: 28, paddingHorizontal: 22, gap: 10 }}>
      <IconTile icon={icon} tone={tone} size={56} radius={18} />
      <T variant="h3" style={{ textAlign: "center", marginTop: 4 }}>
        {title}
      </T>
      {!!text && (
        <T variant="small" style={{ textAlign: "center" }}>
          {text}
        </T>
      )}
      {!!action && <PillButton title={action} onPress={onAction} center style={{ marginTop: 8, minHeight: 48, alignSelf: "stretch" }} />}
    </Card>
  );
}

export function Loading({ label }: { label?: string }) {
  const c = usePalette();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: c.bg }}>
      <ActivityIndicator color={c.brand} size="large" />
      {!!label && <T variant="small">{label}</T>}
    </View>
  );
}

/** Thin divider line. */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const c = usePalette();
  return <View style={[{ height: 1, backgroundColor: c.line }, style]} />;
}

/** Settings-style grouped list: a card with rows separated by lines. */
export function Group({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = usePalette();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[{ backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: 22, overflow: "hidden" }, style]}>
      {items.map((child, i) => (
        <View key={i}>
          {i > 0 && <View style={{ height: 1, backgroundColor: c.line, marginLeft: 64 }} />}
          {child}
        </View>
      ))}
    </View>
  );
}

export function GroupRow({
  icon,
  tone = "lav",
  title,
  subtitle,
  right,
  onPress,
  danger,
}: {
  icon: LucideIcon;
  tone?: PastelName;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const c = usePalette();
  return (
    <Tap
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 12, minHeight: 60 }, pressed && { backgroundColor: c.surface2 }]}
    >
      <IconTile icon={icon} tone={danger ? "rose" : tone} size={36} radius={11} />
      <View style={{ flex: 1 }}>
        <T variant="bodyStrong" color={danger ? c.danger : undefined}>
          {title}
        </T>
        {!!subtitle && <T variant="caption">{subtitle}</T>}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={c.subtle} /> : null)}
    </Tap>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
});

/** "1 lesson", "3 lessons" */
export const plural = (n: number, word: string) =>
  `${n} ${n === 1 ? word : word === "quiz" ? "quizzes" : word.endsWith("s") ? word + "es" : word + "s"}`;

/** Text field: label above, rounded pill input with an icon. */
export const Field = React.forwardRef<TextInput, TextInputProps & { label?: string; icon?: LucideIcon; right?: ReactNode; multiline?: boolean }>(
  function Field({ label, icon: Icon, right, style, multiline, ...rest }, ref) {
    const c = usePalette();
    const [focused, setFocused] = React.useState(false);
    return (
      <View style={{ gap: 8 }}>
        {!!label && <T variant="smallStrong">{label}</T>}
        <View
          style={{
            flexDirection: "row",
            alignItems: multiline ? "flex-start" : "center",
            gap: 10,
            backgroundColor: c.surface,
            borderWidth: 1.5,
            borderColor: focused ? c.ink : c.line,
            borderRadius: multiline ? 20 : 999,
            paddingHorizontal: 16,
            minHeight: 54,
            paddingVertical: multiline ? 14 : 0,
          }}
        >
          {Icon && <Icon size={19} color={c.muted} style={multiline ? { marginTop: 2 } : undefined} />}
          <TextInput
            ref={ref}
            placeholderTextColor={c.subtle}
            multiline={multiline}
            {...rest}
            onFocus={(e) => {
              setFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              rest.onBlur?.(e);
            }}
            style={[{ flex: 1, fontFamily: Fonts.bodySemi, fontSize: 15.5, color: c.ink, paddingVertical: multiline ? 0 : 14, minHeight: multiline ? 80 : undefined, textAlignVertical: multiline ? "top" : "center" }, style]}
          />
          {right}
        </View>
      </View>
    );
  }
);

/** Round checkbox used for terms and task lists. */
export function Checkbox({ checked, onPress, size = 24 }: { checked: boolean; onPress?: () => void; size?: number }) {
  const c = usePalette();
  return (
    <Tap
      hitSlop={8}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        borderWidth: checked ? 0 : 1.5,
        borderColor: c.subtle,
        backgroundColor: checked ? c.inkButton : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {checked && <Check size={size * 0.62} color={c.inkButtonText} strokeWidth={3} />}
    </Tap>
  );
}

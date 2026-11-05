import React, { ReactNode } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Check, LucideIcon } from "lucide-react-native";
import { Fonts, PastelName, usePalette } from "@/constants/palette";
import { Card, IconTile, PastelCard, Screen, T, TopBar } from "@/components/ds";

/** Layout for the "About the SAT" articles. */
export function Article({
  tone,
  label,
  title,
  subtitle,
  art,
  next,
  children,
}: {
  tone: PastelName;
  label: string;
  title: string;
  subtitle: string;
  art?: ReactNode;
  next?: { title: string; href: string };
  children: ReactNode;
}) {
  const router = useRouter();
  const c = usePalette();
  return (
    <Screen header={<TopBar />}>
      <PastelCard tone={tone} radius={30} style={{ padding: 20, gap: 6, minHeight: 170, justifyContent: "flex-end" }}>
        {art && (
          <View style={{ position: "absolute", right: 12, top: 12 }} pointerEvents="none">
            {art}
          </View>
        )}
        <T variant="smallStrong" onPastel style={{ opacity: 0.7 }}>
          {label}
        </T>
        <T style={{ fontFamily: Fonts.display, fontSize: 30, lineHeight: 33, letterSpacing: -0.6, maxWidth: art ? "70%" : undefined }} onPastel>
          {title}
        </T>
        <T variant="small" onPastel style={{ opacity: 0.75 }}>
          {subtitle}
        </T>
      </PastelCard>
      {children}
      {next && (
        <Card onPress={() => router.push(next.href as any)} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.inkButton, borderColor: c.inkButton }}>
          <View style={{ flex: 1 }}>
            <T variant="caption" color={c.inkButtonText} style={{ opacity: 0.7 }}>
              Next article
            </T>
            <T variant="bodyStrong" color={c.inkButtonText}>
              {next.title}
            </T>
          </View>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: c.lav, alignItems: "center", justifyContent: "center" }}>
            <ArrowRight size={19} color="#0B0A0F" />
          </View>
        </Card>
      )}
    </Screen>
  );
}

export function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <T variant="h2">{title}</T>
      {children}
    </View>
  );
}

export function Para({ children }: { children: ReactNode }) {
  const c = usePalette();
  return <Text style={{ fontFamily: Fonts.body, fontSize: 15, lineHeight: 23, color: c.ink }}>{children}</Text>;
}

/** 2-column grid of big numbers. */
export function Facts({ items }: { items: { icon: LucideIcon; value: string; label: string; tone: PastelName }[] }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }}>
      {items.map((f) => (
        <Card key={f.label} style={{ width: "48.5%", gap: 10, padding: 14 }}>
          <IconTile icon={f.icon} tone={f.tone} size={36} radius={12} />
          <View>
            <T style={{ fontFamily: Fonts.display, fontSize: 22, lineHeight: 26 }}>{f.value}</T>
            <T variant="caption">{f.label}</T>
          </View>
        </Card>
      ))}
    </View>
  );
}

/** Card with a checklist. `numbered` shows 1, 2, 3 instead of checks. */
export function Checklist({ items, numbered, tone = "mint" }: { items: string[]; numbered?: boolean; tone?: PastelName }) {
  const c = usePalette();
  return (
    <Card style={{ gap: 12 }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
          <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c[tone], alignItems: "center", justifyContent: "center", marginTop: -1 }}>
            {numbered ? (
              <Text style={{ fontFamily: Fonts.bodyHeavy, fontSize: 12, color: c.onPastel }}>{i + 1}</Text>
            ) : (
              <Check size={14} color={c.onPastel} strokeWidth={3} />
            )}
          </View>
          <Text style={{ flex: 1, fontFamily: Fonts.bodySemi, fontSize: 14.5, lineHeight: 21, color: c.ink }}>{it}</Text>
        </View>
      ))}
    </Card>
  );
}

/** Pastel note with a title. */
export function Callout({ tone = "butter", icon, title, children }: { tone?: PastelName; icon?: LucideIcon; title: string; children: ReactNode }) {
  return (
    <PastelCard tone={tone} radius={24} paper={false} style={{ padding: 16, gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {icon && <IconTile icon={icon} tone="white" size={32} radius={16} />}
        <T variant="h3" onPastel style={{ flex: 1 }}>
          {title}
        </T>
      </View>
      <T variant="small" onPastel style={{ fontSize: 14, lineHeight: 20, opacity: 0.85 }}>
        {children}
      </T>
    </PastelCard>
  );
}

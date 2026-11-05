import React, { ReactNode } from "react";
import { TextInput, View } from "react-native";
import { Lock, LucideIcon, Search, X } from "lucide-react-native";
import { Fonts, PASTEL_CYCLE, PastelName, usePalette } from "@/constants/palette";
import { EmptyState, ListRow, Screen, T, Tap, Thumb, TopBar } from "@/components/ds";

export interface TestListItem {
  id: string;
  title: string;
  subtitle?: string;
  /** 0..100, shown on the right */
  progress?: number;
  locked?: boolean;
  thumb?: string;
  tone?: PastelName;
  onPress: () => void;
}

/** Shared layout for the Tests sub-screens: title, search, optional action, list, empty state. */
export function TestList({
  title,
  subtitle,
  search,
  onSearch,
  searchPlaceholder = "Search",
  action,
  items,
  empty,
}: {
  title: string;
  subtitle?: string;
  search: string;
  onSearch: (s: string) => void;
  searchPlaceholder?: string;
  action?: ReactNode;
  items: TestListItem[];
  empty: { icon: LucideIcon; title: string; text?: string };
}) {
  const c = usePalette();
  return (
    <Screen header={<TopBar />}>
      <View style={{ gap: 6 }}>
        <T variant="title">{title}</T>
        {!!subtitle && <T variant="small" style={{ fontSize: 14, lineHeight: 20 }}>{subtitle}</T>}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface, borderRadius: 999, paddingHorizontal: 16, height: 50 }}>
        <Search size={19} color={c.muted} />
        <TextInput
          style={{ flex: 1, fontFamily: Fonts.bodySemi, fontSize: 15, color: c.ink, paddingVertical: 0 }}
          placeholder={searchPlaceholder}
          placeholderTextColor={c.subtle}
          value={search}
          onChangeText={onSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Tap hitSlop={10} onPress={() => onSearch("")} accessibilityLabel="Clear search">
            <X size={18} color={c.muted} />
          </Tap>
        )}
      </View>

      {action}

      {items.length === 0 ? (
        <EmptyState icon={search ? Search : empty.icon} title={search ? "Nothing found" : empty.title} text={search ? `Nothing matches "${search}".` : empty.text} />
      ) : (
        <View style={{ gap: 10 }}>
          {items.map((it, i) => (
            <ListRow
              key={it.id}
              onPress={it.onPress}
              left={<Thumb text={it.thumb ?? String(i + 1).padStart(2, "0")} tone={it.tone ?? ((it.progress ?? 0) >= 100 ? "mint" : PASTEL_CYCLE[i % PASTEL_CYCLE.length])} />}
              title={it.title}
              subtitle={it.subtitle}
              right={
                it.locked ? (
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center" }}>
                    <Lock size={16} color={c.muted} />
                  </View>
                ) : it.progress != null ? (
                  <T variant="smallStrong" color={it.progress >= 100 ? c.success : it.progress > 0 ? c.ink : c.subtle}>
                    {it.progress}%
                  </T>
                ) : undefined
              }
              chevron={!it.locked && it.progress == null}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

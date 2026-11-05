import React, { useRef, useState } from "react";
import { FlatList, useWindowDimensions, View, ViewToken } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import { Fonts, PastelName, usePalette } from "@/constants/palette";
import { GUTTER, LinkButton, PastelCard, PillButton, T, Tag } from "@/components/ds";
import { ParabolaArt, SlopeArt, StopwatchArt } from "@/components/art";

const SLIDES: { id: string; tone: PastelName; badge: string; title: string; text: string; art: React.ReactNode }[] = [
  {
    id: "1",
    tone: "butter",
    badge: "800+ practice questions",
    title: "Master SAT Math with confidence",
    text: "Short lessons, practice problems and full mock exams, all in one place, to help you reach your target score.",
    art: <SlopeArt width={220} height={206} />,
  },
  {
    id: "2",
    tone: "lav",
    badge: "Every SAT Math topic",
    title: "Learn and revise every topic",
    text: "From algebra to advanced math, follow the course step by step and check yourself with a quiz after each topic.",
    art: <ParabolaArt width={300} height={190} />,
  },
  {
    id: "3",
    tone: "mint",
    badge: "Real exam experience",
    title: "Practice like it's exam day",
    text: "Timed full-length exams with real 200 to 800 scoring. Review your mistakes and see what to work on next.",
    art: <StopwatchArt size={190} />,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const finish = () => router.replace("/auth" as any);
  const next = () => {
    if (index < SLIDES.length - 1) listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    else finish();
  };
  const last = index === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: GUTTER, height: 40, alignItems: "center" }}>
        {!last && <LinkButton title="Skip" onPress={finish} />}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: GUTTER, gap: 22 }}>
            <PastelCard tone={item.tone} radius={34} style={{ height: 330, alignItems: "center", justifyContent: "center" }}>
              {item.art}
              <View style={{ position: "absolute", left: 18, top: 18 }}>
                <Tag label={item.badge} style={{ backgroundColor: "#fff" }} />
              </View>
            </PastelCard>
            <View style={{ gap: 10 }}>
              <T style={{ fontFamily: Fonts.display, fontSize: 32, lineHeight: 35, letterSpacing: -0.7, color: c.ink }}>{item.title}</T>
              <T variant="small" style={{ fontSize: 15, lineHeight: 22 }}>
                {item.text}
              </T>
            </View>
          </View>
        )}
      />

      <View style={{ paddingHorizontal: GUTTER, paddingBottom: insets.bottom + 18, gap: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
          {SLIDES.map((s, i) => (
            <View key={s.id} style={{ height: 8, width: i === index ? 26 : 8, borderRadius: 4, backgroundColor: i === index ? c.ink : c.line }} />
          ))}
        </View>
        <PillButton title={last ? "Let's get started" : "Continue"} icon={ArrowRight} onPress={next} />
      </View>
    </View>
  );
}

import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { BarChart3, Bookmark, Lock, Play, RotateCcw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LucideIcon } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { LoginRequiredModal } from "@/components/modals/LoginRequiredModal";
import { Fonts, PastelName, usePalette } from "@/constants/palette";
import { GraphPaper, GUTTER, IconTile, ListRow, PastelCard, PillButton, T, TAB_BAR_SPACE, Tag, Tap } from "@/components/ds";
import { StopwatchArt } from "@/components/art";

type ModeId = "exam" | "wrong" | "saved" | "improve" | "learn_by_topics";

export default function TestsScreen() {
  const router = useRouter();
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleModeSelect = (mode: ModeId) => {
    if (mode === "exam") {
      router.push("/tests/exams" as any);
      return;
    }
    if (!token || !user) {
      setShowLoginModal(true);
      return;
    }
    if (mode === "learn_by_topics") {
      router.push("/tests/by-topic" as any);
      return;
    }
    if (!user.isPro) {
      router.push("/payment");
      return;
    }
    if (mode === "saved") router.push("/tests/saved" as any);
    else if (mode === "wrong") router.push("/tests/wrong" as any);
    else if (mode === "improve") router.push("/tests/improve" as any);
  };

  const modes: { id: ModeId; title: string; text: string; icon: LucideIcon; tone: PastelName; pro: boolean }[] = [
    { id: "wrong", title: "Wrong answers", text: "Redo the questions you missed", icon: RotateCcw, tone: "rose", pro: true },
    { id: "saved", title: "Saved", text: "Questions you bookmarked", icon: Bookmark, tone: "butter", pro: true },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.lav }}>
      <GraphPaper />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 12 }}
      >
        {/* Lavender header */}
        <View style={{ paddingHorizontal: GUTTER, paddingBottom: 26, gap: 6 }}>
          <T variant="label" onPastel style={{ opacity: 0.7 }}>
            Practice
          </T>
          <T variant="title" onPastel style={{ fontSize: 32, lineHeight: 35 }}>
            Test yourself{"\n"}like it's exam day
          </T>
        </View>

        {/* Sheet */}
        <View
          style={{
            flexGrow: 1,
            backgroundColor: c.bg,
            borderTopLeftRadius: 34,
            borderTopRightRadius: 34,
            paddingHorizontal: GUTTER,
            paddingTop: 24,
            paddingBottom: TAB_BAR_SPACE + insets.bottom,
            gap: 18,
          }}
        >
          {/* Full exam */}
          <PastelCard tone="butter" radius={30} style={{ padding: 20, gap: 10, minHeight: 220 }}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <Tag label="70 min" tone="ink" />
              <Tag label="44 questions" tone="ink" />
              {!user?.isPro && <Tag label="Free" tone="mint" style={{ backgroundColor: "#fff" }} />}
            </View>
            <T style={{ fontFamily: Fonts.display, fontSize: 30, lineHeight: 31, letterSpacing: -0.7, maxWidth: "62%" }} onPastel>
              Full SAT Math test
            </T>
            <T variant="small" onPastel style={{ maxWidth: "62%" }}>
              Real timing and question mix. Score report at the end.
            </T>
            <View style={{ position: "absolute", right: 12, top: 52 }} pointerEvents="none">
              <StopwatchArt size={104} />
            </View>
            <PillButton tone="white" title="Start full test" icon={Play} onPress={() => handleModeSelect("exam")} style={{ marginTop: "auto" }} />
          </PastelCard>

          <T variant="h2">Practice modes</T>

          <View style={{ flexDirection: "row", gap: 10, marginTop: -6 }}>
            {modes.map((m) => {
              const locked = m.pro && !user?.isPro;
              return (
                <Tap
                  key={m.id}
                  onPress={() => handleModeSelect(m.id)}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: c.surface,
                    borderColor: c.line,
                    borderWidth: 1,
                    borderRadius: 22,
                    padding: 14,
                    gap: 18,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <IconTile icon={m.icon} tone={m.tone} size={40} radius={13} />
                    {locked && <Tag label="PRO" tone="ink" icon={Lock} />}
                  </View>
                  <View style={{ gap: 3 }}>
                    <T variant="bodyStrong">{m.title}</T>
                    <T variant="caption">{m.text}</T>
                  </View>
                </Tap>
              );
            })}
          </View>

          <ListRow
            left={<IconTile icon={BarChart3} tone="mint" size={44} radius={14} />}
            title="Your results"
            subtitle="Every test is saved. See your scores in Profile."
            onPress={() => router.push("/(tabs)/profile")}
            chevron
          />
        </View>
      </ScrollView>

      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </View>
  );
}

import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react-native";
import { formatDateKey, getAllPlanDates, getTaskCount } from "@/lib/studyPlanStorage";
import { Fonts, usePalette } from "@/constants/palette";
import { Card, CircleButton, PastelCard, PillButton, Screen, T, Tap, TopBar } from "@/components/ds";
import { StopwatchArt } from "@/components/art";

const sameDay = (a: Date, b: Date) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Planner: SAT countdown and a month grid. Tap a day to plan it. */
export default function CalendarScreen() {
  const router = useRouter();
  const c = usePalette();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [satDate, setSatDate] = useState<string | null>(null);
  const [counts, setCounts] = useState<Map<string, { total: number; completed: number }>>(new Map());

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync("onboardingAnswers");
        if (stored) setSatDate(JSON.parse(stored).satDate || null);
      } catch (error) {
        console.error("Failed to load SAT date:", error);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const dates = await getAllPlanDates();
          const map = new Map<string, { total: number; completed: number }>();
          for (const key of dates) map.set(key, await getTaskCount(key));
          setCounts(map);
        } catch (error) {
          console.error("Failed to load plan dates:", error);
        }
      })();
    }, [])
  );

  const sat = satDate ? new Date(satDate) : null;
  const satValid = sat && !isNaN(sat.getTime()) ? sat : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = satValid ? Math.round((new Date(satValid.getFullYear(), satValid.getMonth(), satValid.getDate()).getTime() - today.getTime()) / 86400000) : null;

  const firstDay = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  while (cells.length % 7) cells.push(null);

  return (
    <Screen header={<TopBar title="Planner" />}>
      {/* SAT countdown */}
      {satValid && daysLeft != null && daysLeft >= 0 ? (
        <PastelCard tone="butter" radius={28} style={{ padding: 20, gap: 4, minHeight: 150 }}>
          <View style={{ position: "absolute", right: 14, top: 14 }} pointerEvents="none">
            <StopwatchArt size={96} />
          </View>
          <T variant="smallStrong" onPastel>
            Your SAT
          </T>
          <Text style={{ fontFamily: Fonts.display, fontSize: 44, lineHeight: 48, letterSpacing: -1, color: c.onPastel }}>
            {daysLeft === 0 ? "Today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
          </Text>
          <T variant="small" onPastel style={{ opacity: 0.75 }}>
            {satValid.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </T>
          <Tap onPress={() => router.push("/edit-profile" as any)} hitSlop={8} style={{ marginTop: 8, alignSelf: "flex-start" }}>
            <T variant="smallStrong" onPastel style={{ textDecorationLine: "underline" }}>
              Change date
            </T>
          </Tap>
        </PastelCard>
      ) : (
        <PastelCard tone="lav" radius={28} style={{ padding: 20, gap: 8 }}>
          <T variant="h2" onPastel>
            When is your SAT?
          </T>
          <T variant="small" onPastel style={{ opacity: 0.75 }}>
            Add the date to see a countdown here and on Home.
          </T>
          <PillButton title="Set the date" tone="white" icon={CalendarPlus} onPress={() => router.push("/edit-profile" as any)} style={{ marginTop: 6 }} />
        </PastelCard>
      )}

      {/* Month */}
      <Card style={{ padding: 14, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <CircleButton icon={ChevronLeft} size={40} label="Previous month" onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} />
          <T variant="h3">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</T>
          <CircleButton icon={ChevronRight} size={40} label="Next month" onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} />
        </View>
        <View style={{ flexDirection: "row" }}>
          {WEEKDAYS.map((d) => (
            <T key={d} variant="caption" style={{ flex: 1, textAlign: "center" }}>
              {d}
            </T>
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 6 }}>
          {cells.map((date, i) => {
            if (!date) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, height: 46 }} />;
            const key = formatDateKey(date);
            const isToday = sameDay(date, new Date());
            const isSat = !!satValid && sameDay(date, satValid);
            const count = counts.get(key);
            const allDone = !!count && count.total > 0 && count.completed === count.total;
            const bg = isToday ? c.inkButton : isSat ? c.butter : "transparent";
            const fg = isToday ? c.inkButtonText : isSat ? c.onPastel : c.ink;
            return (
              <View key={key} style={{ width: `${100 / 7}%`, alignItems: "center" }}>
                <Tap
                  onPress={() => router.push(`/calendar/day/${key}` as any)}
                  accessibilityLabel={date.toDateString()}
                  style={({ pressed }) => ({ width: 42, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: bg, opacity: pressed ? 0.7 : 1 })}
                >
                  <Text style={{ fontFamily: isToday || isSat ? Fonts.bodyHeavy : Fonts.bodySemi, fontSize: 15, color: fg }}>{date.getDate()}</Text>
                  {!!count && count.total > 0 && (
                    <View style={{ position: "absolute", bottom: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: allDone ? c.success : isToday ? c.lav : c.lav2 }} />
                  )}
                </Tap>
              </View>
            );
          })}
        </View>
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Legend color={c.lav2} label="Planned" />
        <Legend color={c.success} label="All done" />
        {satValid && <Legend color={c.butter} label="SAT day" square />}
      </View>
      <T variant="caption" style={{ textAlign: "center" }}>
        Tap any day to plan what you'll study.
      </T>
    </Screen>
  );
}

function Legend({ color, label, square }: { color: string; label: string; square?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: square ? 14 : 8, height: square ? 14 : 8, borderRadius: square ? 5 : 4, backgroundColor: color }} />
      <T variant="caption">{label}</T>
    </View>
  );
}

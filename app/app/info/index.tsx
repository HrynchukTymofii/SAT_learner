import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Calendar, Target } from "lucide-react-native";
import { IconTile, ListRow, Screen, T, TopBar } from "@/components/ds";

const ARTICLES = [
  { title: "What is the SAT?", text: "What's on the test, how long it takes, and why colleges use it", icon: BookOpen, tone: "lav" as const, route: "/info/articles/what-is-sat" },
  { title: "How the SAT is scored", text: "Score ranges, scaled scores and percentiles", icon: Target, tone: "mint" as const, route: "/info/articles/how-sat-scored" },
  { title: "Test dates and registration", text: "Upcoming dates, deadlines and what to bring", icon: Calendar, tone: "butter" as const, route: "/info/articles/test-dates" },
];

export default function ArticlesPage() {
  const router = useRouter();
  return (
    <Screen header={<TopBar />}>
      <View style={{ gap: 6 }}>
        <T variant="title">About the SAT</T>
        <T variant="small" style={{ fontSize: 14 }}>
          Short guides to the test itself.
        </T>
      </View>
      <View style={{ gap: 10 }}>
        {ARTICLES.map((a) => (
          <ListRow key={a.route} left={<IconTile icon={a.icon} tone={a.tone} size={50} radius={16} />} title={a.title} subtitle={a.text} chevron onPress={() => router.push(a.route as any)} />
        ))}
      </View>
    </Screen>
  );
}

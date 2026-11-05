import React from "react";
import { View } from "react-native";
import { Percent } from "lucide-react-native";
import { Article, Block, Callout, Checklist, Para } from "@/components/info/Article";
import { Card, T } from "@/components/ds";
import { usePalette } from "@/constants/palette";
import { CrownArt } from "@/components/art";

const RANGES = [
  { range: "1400–1600", label: "Excellent", text: "Competitive for top universities", tone: "mint" as const },
  { range: "1200–1390", label: "Good", text: "Strong for most colleges", tone: "lav" as const },
  { range: "1000–1190", label: "Average", text: "Accepted by many colleges", tone: "butter" as const },
  { range: "Below 1000", label: "Room to grow", text: "Practice can move this quickly", tone: "rose" as const },
];

export default function HowSATScoredPage() {
  const c = usePalette();
  return (
    <Article
      tone="mint"
      label="About the SAT"
      title="How the SAT is scored"
      subtitle="From right answers to your 400 to 1600 score"
      art={<CrownArt size={84} />}
      next={{ title: "Test dates and registration", href: "/info/articles/test-dates" }}
    >
      <Block title="The basics">
        <Para>
          Your total score runs from 400 to 1600. It is the sum of two equally weighted sections, Math and Reading and Writing, each scored from 200 to 800.
        </Para>
        <Checklist
          items={[
            "Each section is scored 200 to 800",
            "Your total is the two added together (400 to 1600)",
            "There is no penalty for wrong answers",
            "Your right answers are converted to a scaled score",
            "Score reports include percentile rankings",
          ]}
        />
      </Block>

      <Block title="What scores mean">
        <View style={{ gap: 10 }}>
          {RANGES.map((r) => (
            <Card key={r.range} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View style={{ backgroundColor: c[r.tone], borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8, minWidth: 104, alignItems: "center" }}>
                <T variant="smallStrong" onPastel>
                  {r.range}
                </T>
              </View>
              <View style={{ flex: 1 }}>
                <T variant="bodyStrong">{r.label}</T>
                <T variant="caption">{r.text}</T>
              </View>
            </Card>
          ))}
        </View>
      </Block>

      <Block title="How it's calculated">
        <Callout tone="lav" title="1. Right answers">
          Your raw score is the number of questions you got right. Wrong answers cost nothing, so it's always better to guess than skip.
        </Callout>
        <Callout tone="butter" title="2. Scaled score">
          Raw scores are turned into a 200 to 800 score per section, adjusted for the difficulty of the questions you were given.
        </Callout>
        <Callout tone="mint" title="3. Total score">
          Your SAT score (400 to 1600) is your Math score plus your Reading and Writing score.
        </Callout>
      </Block>

      <Callout tone="rose" icon={Percent} title="Percentiles">
        Your report also shows a percentile: the share of test takers you scored higher than. A 1300, for example, puts you in roughly the top 15%.
      </Callout>
    </Article>
  );
}

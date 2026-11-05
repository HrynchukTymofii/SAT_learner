import React from "react";
import { Linking, View } from "react-native";
import { AlertCircle, CalendarDays, Clock, DollarSign, ExternalLink } from "lucide-react-native";
import { Article, Block, Callout, Checklist, Para } from "@/components/info/Article";
import { Card, PillButton, T, Tag } from "@/components/ds";
import { StopwatchArt } from "@/components/art";

// Published SAT dates (same list as before the redesign). Check collegeboard.org before relying on them.
const DATES: { season: string; dates: { date: string; deadline: string }[] }[] = [
  {
    season: "Spring 2026",
    dates: [
      { date: "2026-03-14", deadline: "February 27 / March 3, 2026" },
      { date: "2026-05-02", deadline: "April 17 / April 21, 2026" },
      { date: "2026-06-06", deadline: "May 22 / May 26, 2026" },
    ],
  },
  {
    season: "Fall 2026",
    dates: [
      { date: "2026-08-15", deadline: "TBA" },
      { date: "2026-09-12", deadline: "TBA" },
      { date: "2026-10-03", deadline: "TBA" },
      { date: "2026-11-07", deadline: "TBA" },
      { date: "2026-12-05", deadline: "TBA" },
    ],
  },
  {
    season: "Spring 2027",
    dates: [
      { date: "2027-03-13", deadline: "TBA" },
      { date: "2027-05-01", deadline: "TBA" },
      { date: "2027-06-05", deadline: "TBA" },
    ],
  },
];

const parse = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export default function TestDatesPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <Article tone="butter" label="About the SAT" title="Test dates and registration" subtitle="Plan when you'll take the test" art={<StopwatchArt size={84} />}>
      {DATES.map((s) => (
        <Block key={s.season} title={s.season}>
          <View style={{ gap: 8 }}>
            {s.dates.map((d) => {
              const date = parse(d.date);
              const past = date < today;
              return (
                <Card key={d.date} style={{ flexDirection: "row", alignItems: "center", gap: 12, opacity: past ? 0.55 : 1 }}>
                  <View style={{ flex: 1 }}>
                    <T variant="bodyStrong">{date.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</T>
                    <T variant="caption">Registration deadline: {d.deadline}</T>
                  </View>
                  {past ? <Tag label="Passed" /> : <Tag label="Upcoming" tone="mint" icon={CalendarDays} />}
                </Card>
              );
            })}
          </View>
        </Block>
      ))}

      <Block title="How to register">
        <Para>Registration happens on the College Board website:</Para>
        <Checklist
          numbered
          tone="lav"
          items={[
            "Create a College Board account if you don't have one",
            "Pick your test date and test center",
            "Upload a photo that meets the requirements",
            "Pay the registration fee (fee waivers are available)",
            "Get your admission ticket by email",
          ]}
        />
      </Block>

      <Block title="Tips">
        <Callout tone="lav" icon={Clock} title="Register early">
          Test centers fill up fast. Register as soon as you can to get the location you want.
        </Callout>
        <Callout tone="mint" icon={DollarSign} title="Fee waivers">
          Students from low-income families may qualify for waivers that cover registration, score reports and more.
        </Callout>
        <Callout tone="rose" icon={AlertCircle} title="Late registration">
          You can usually still register for a short time after the deadline, for an extra fee.
        </Callout>
      </Block>

      <Block title="What to bring on test day">
        <Checklist
          items={[
            "Your admission ticket (printed or on your phone)",
            "An accepted photo ID",
            "A charged laptop or tablet with the Bluebook app installed",
            "A pencil or pen for scratch work",
            "An approved calculator (optional, Desmos is built in)",
          ]}
        />
      </Block>

      <PillButton title="Register at collegeboard.org" icon={ExternalLink} onPress={() => Linking.openURL("https://satsuite.collegeboard.org/sat/registration")} />
    </Article>
  );
}

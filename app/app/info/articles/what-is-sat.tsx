import React from "react";
import { BookOpen, Calculator, Clock, Laptop, Target } from "lucide-react-native";
import { Article, Block, Callout, Checklist, Facts, Para } from "@/components/info/Article";
import { TargetArt } from "@/components/art";

export default function WhatIsSATPage() {
  return (
    <Article
      tone="lav"
      label="About the SAT"
      title="What is the SAT?"
      subtitle="The test, how it's built, and why colleges use it"
      art={<TargetArt size={88} />}
      next={{ title: "How the SAT is scored", href: "/info/articles/how-sat-scored" }}
    >
      <Facts
        items={[
          { icon: Clock, value: "2 h 14 min", label: "Testing time", tone: "lav" },
          { icon: Target, value: "1600", label: "Top score", tone: "mint" },
          { icon: BookOpen, value: "2 sections", label: "Reading & Writing, Math", tone: "butter" },
          { icon: Laptop, value: "Digital", label: "Taken in the Bluebook app", tone: "rose" },
        ]}
      />

      <Block title="Introduction">
        <Para>
          The SAT is a standardized test used for college admissions in the United States. It is made and run by the College Board and checks how ready
          you are for college-level reading, writing and math.
        </Para>
        <Callout title="Why colleges use it" icon={Target}>
          It gives colleges one common measure to compare applicants from different schools, courses and grading systems.
        </Callout>
      </Block>

      <Block title="How the test is built">
        <Para>Since 2024 the SAT is digital and adaptive: each section has two modules, and how you do on the first sets the difficulty of the second.</Para>
        <Callout tone="lav" title="Reading and Writing">
          54 questions in 64 minutes, two modules of 32 minutes. Scored 200 to 800.
        </Callout>
        <Callout tone="mint" title="Math" icon={Calculator}>
          44 questions in 70 minutes, two modules of 35 minutes. A calculator is allowed for the whole section, and Desmos is built into the app. Scored 200 to 800.
        </Callout>
      </Block>

      <Block title="Good to know">
        <Checklist
          items={[
            "There is no penalty for wrong answers, so never leave a question blank",
            "The optional essay was discontinued in 2021",
            "You get a reference sheet with common formulas in the Math section",
            "Scores usually come out within a couple of weeks",
          ]}
        />
      </Block>
    </Article>
  );
}

import React from "react";
import { Composition } from "remotion";
import { timelineMetadata, VideoProps } from "./timeline";
import { ProblemTickets } from "./videos/problem-tickets/ProblemTickets";
import problemTickets from "./videos/problem-tickets/script.json";
import { LessonScatterplots } from "./videos/lesson-scatterplots/LessonScatterplots";
import lessonScatterplots from "./videos/lesson-scatterplots/script.json";
import { LessonSystems } from "./videos/lesson-systems/LessonSystems";
import lessonSystems from "./videos/lesson-systems/script.json";
import { LessonTriangles } from "./videos/lesson-triangles/LessonTriangles";
import lessonTriangles from "./videos/lesson-triangles/script.json";
import { LessonTrianglesAva } from "./videos/lesson-triangles-ava/LessonTrianglesAva";
import lessonTrianglesAva from "./videos/lesson-triangles-ava/script.json";
import { LessonQuadratics } from "./videos/lesson-quadratics/LessonQuadratics";
import lessonQuadratics from "./videos/lesson-quadratics/script.json";
import { PromoSatScroll } from "./videos/promo-sat-scroll/PromoSatScroll";
import promoSatScroll from "./videos/promo-sat-scroll/script.json";
import { ReelRightTriangles } from "./videos/reel-right-triangles/ReelRightTriangles";
import reelRightTriangles from "./videos/reel-right-triangles/script.json";
import { RemakeRip } from "./videos/remake-rip/RemakeRip";

// One composition per video. Each takes its length from its voiceover (public/voice/<id>/timing.json).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="problem-tickets"
      component={ProblemTickets}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={30 * 60}
      defaultProps={{} as VideoProps}
      calculateMetadata={timelineMetadata("problem-tickets", problemTickets)}
    />
    <Composition
      id="lesson-scatterplots"
      component={LessonScatterplots}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={30 * 60}
      defaultProps={{} as VideoProps}
      calculateMetadata={timelineMetadata("lesson-scatterplots", lessonScatterplots)}
    />
    <Composition
      id="lesson-systems"
      component={LessonSystems}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={30 * 60}
      defaultProps={{} as VideoProps}
      calculateMetadata={timelineMetadata("lesson-systems", lessonSystems)}
    />
    <Composition
      id="lesson-triangles"
      component={LessonTriangles}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={30 * 60}
      defaultProps={{} as VideoProps}
      calculateMetadata={timelineMetadata("lesson-triangles", lessonTriangles)}
    />
    <Composition
      id="lesson-triangles-ava"
      component={LessonTrianglesAva}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={30 * 60}
      defaultProps={{} as VideoProps}
      calculateMetadata={timelineMetadata("lesson-triangles-ava", lessonTrianglesAva)}
    />
    <Composition
      id="lesson-quadratics"
      component={LessonQuadratics}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={30 * 60}
      defaultProps={{} as VideoProps}
      calculateMetadata={timelineMetadata("lesson-quadratics", lessonQuadratics)}
    />
    <Composition
      id="promo-sat-scroll"
      component={PromoSatScroll}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={30 * 40}
      defaultProps={{} as VideoProps}
      calculateMetadata={timelineMetadata("promo-sat-scroll", promoSatScroll)}
    />
    <Composition
      id="reel-right-triangles"
      component={ReelRightTriangles}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={30 * 45}
      defaultProps={{} as VideoProps}
      calculateMetadata={timelineMetadata("reel-right-triangles", reelRightTriangles)}
    />
    <Composition id="remake-rip" component={RemakeRip} width={1080} height={1920} fps={30} durationInFrames={1345} />
  </>
);

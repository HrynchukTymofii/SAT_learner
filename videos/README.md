# SAT videos (Remotion)

Promo shorts and lesson videos for SAT Math Learner, drawn in code with [Remotion](https://remotion.dev),
in the 2026 lavender / butter / ink brand (`src/brand.ts`). Math is typeset with KaTeX (`Tex` in `src/ui.tsx`).

## Videos
| id | size | what |
| --- | --- | --- |
| `problem-tickets` | 1080 × 1920 | Short: one SAT problem (Scatterplots practice #1, $360 ticket budget). The graph draws itself, the problem is solved on screen (adult and student ticket price), "your turn" with a 3 s countdown, and only then the equation is built. The answer comes last, because viewers leave once they have it. End card. Readable content stays in x 60..960, y 170..1470 (TikTok / Reels / Shorts UI covers the rest). |
| `reel-right-triangles` | 1080 × 1920 | 43 s fast explainer: right angle, hypotenuse, a²+b²=c² with squares on the sides, triples, 45-45-90 and 30-60-90 (the triangle morphs), SOH CAH TOA, a quick test. A cut every 2-4 s, camera punches on key words, dark/light flips. `"tight": true` in its script.json cuts the silence after each voiced line. |
| `promo-sat-scroll` | 1080 × 1920 | 36 s promo for the planned SAT Scroll feed (theory → SAT problem → short video, adaptive). Motion style of SaaS promo reels: tilted 3D grid floor, popping cards, 2.5D phone, kinetic captions with highlight boxes, odometers, "comment SCROLL" ending. UI sounds and the beat are synthesised by `python scripts/sfx.py` (swap `public/music/beat.wav` for a real track). |
| `lesson-scatterplots` | 1920 × 1080 | One-minute lesson from "Lesson: Scatterplots": a dot = (x, y), the four checks (direction, form, strength, unusual points), line of best fit, ŷ = a + bx. |

## How a video is built
- `src/videos/<id>/script.json`: the narration, one line per beat (`{id, text, gap}`, or `{id, silence}` for a pause such as the countdown).
- `python scripts/voice.py <id>` voices each line with Edge TTS into `public/voice/<id>/<line>.mp3` and writes `timing.json`, which holds each line's length and per-word timings. Only changed lines are voiced again. To use a real voice, drop `<line>.wav` / `.m4a` / `.flac` in that folder and rerun; it wins over TTS.
- `src/timeline.tsx` lays the lines end to end, so the video's length and every scene time come from the voice. Scenes key their animation to `at.<line>`, or to `cue(tl, line, word)`, the moment a word is spoken, so a highlight lands on its word.

## Reel kit
`src/reel.tsx` holds what the 9:16 reels share: `Captions` (one chunk at a time, `*word*` gets a highlight box, `~` is a spoken word shown as nothing), `Background` (graph paper + tilted grid floor, light/dark), `Scene` (zoom/blur cuts; `fast` for snappy ones), `Chip`, `Odometer`, `kick` (camera punch) and `Sfxs`.

## Mascot
`src/mascot/Unit1600.tsx`: Unit-1600, a tired, sarcastic robot that has graded ten million SAT tests. A video directs it with keyframes (`{t, expr, arms, gaze}`; expressions neutral / bored / smug / wide / happy / wink, arms down / point / cheer / wave), usually cued to words with `cue()`. Its mouth follows the voice's loudness (`env` in timing.json), it blinks and bobs, and its antenna lights up while it talks.

## Commands
- `npm run dev`: Remotion Studio, to scrub through and tweak.
- `npx tsx scripts/review.ts <id> 2,10,20`: a contact sheet of those seconds → `out/review/<id>.png`.
- `npx remotion render <id> out/<id>.mp4`: the final video with its voice.

## New video
Copy a folder in `src/videos/`, write its `script.json`, run `scripts/voice.py`, add a `<Composition>` in `src/Root.tsx`.
Problems and lessons come from `app/assets/databases/satprep.db` (tables `quiz_questions`, `lessons`).

"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin"
import { platformCourseIds } from "@/lib/course-progress"

/**
 * Course editing for the admin panel. Every action checks the admin first.
 * Errors come back as { error } (Next hides thrown messages in production).
 */
type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    await requireAdmin()
    const data = await fn()
    // Student pages read the database directly; the outline on the home page is cached
    revalidateTag("course-outline")
    revalidatePath("/learn", "layout")
    return { ok: true, data }
  } catch (e) {
    console.error("[admin]", e)
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" }
  }
}

const text = (v: unknown, max = 300) => {
  const s = typeof v === "string" ? v.trim() : ""
  if (s.length > max) throw new Error(`Text is too long (max ${max} characters)`)
  return s
}
const required = (v: unknown, name: string, max = 300) => {
  const s = text(v, max)
  if (!s) throw new Error(`${name} is required`)
  return s
}
const optUrl = (v: unknown) => {
  const s = text(v, 2000)
  if (s && !/^https:\/\//.test(s)) throw new Error("Links must start with https://")
  return s || null
}

async function assertCourse(courseId: string) {
  if (!platformCourseIds().includes(courseId)) throw new Error("Unknown course")
}

/** Next free position in a chapter. Lessons and quizzes share one order. */
async function nextItemPosition(chapterId: string) {
  const [l, q] = await Promise.all([
    db.lesson.aggregate({ where: { chapterId }, _max: { position: true } }),
    db.quiz.aggregate({ where: { chapterId }, _max: { position: true } }),
  ])
  return Math.max(l._max.position ?? -1, q._max.position ?? -1) + 1
}

/** totalQuestions and maxScore are stored on the quiz; recount them after any question change. */
async function recountQuiz(quizId: string) {
  const agg = await db.quizQuestion.aggregate({ where: { quizId }, _count: true, _sum: { points: true } })
  await db.quiz.update({ where: { id: quizId }, data: { totalQuestions: agg._count, maxScore: agg._sum.points ?? 0 } })
}

// ---------- Chapters ----------

export async function createChapter(courseId: string, title: string) {
  return run(async () => {
    await assertCourse(courseId)
    const last = await db.chapter.aggregate({ where: { courseId }, _max: { position: true } })
    const ch = await db.chapter.create({
      data: { courseId, title: required(title, "Title", 200), position: (last._max.position ?? -1) + 1 },
    })
    return ch.id
  })
}

export async function updateChapter(id: string, data: { title?: string; description?: string; isFree?: boolean; isPublished?: boolean }) {
  return run(async () => {
    await db.chapter.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: required(data.title, "Title", 200) }),
        ...(data.description !== undefined && { description: text(data.description, 2000) || null }),
        ...(data.isFree !== undefined && { isFree: !!data.isFree }),
        ...(data.isPublished !== undefined && { isPublished: !!data.isPublished }),
      },
    })
  })
}

export async function deleteChapter(id: string) {
  // Cascades to its lessons, quizzes, questions and the students' results for them.
  // Students' saved questions (UserQuizQuestion) don't cascade in the database, so remove them first.
  return run(async () => {
    await db.$transaction([
      db.userQuizQuestion.deleteMany({ where: { question: { quiz: { chapterId: id } } } }),
      db.chapter.delete({ where: { id } }),
    ])
  })
}

export async function reorderChapters(courseId: string, ids: string[]) {
  return run(async () => {
    await assertCourse(courseId)
    await db.$transaction(ids.map((id, position) => db.chapter.update({ where: { id, courseId }, data: { position } })))
  })
}

// ---------- Lessons and quizzes inside a chapter ----------

export async function createLesson(chapterId: string, title: string) {
  return run(async () => {
    const lesson = await db.lesson.create({
      data: { chapterId, title: required(title, "Title", 200), position: await nextItemPosition(chapterId) },
    })
    return lesson.id
  })
}

export async function createQuiz(chapterId: string, title: string) {
  return run(async () => {
    const quiz = await db.quiz.create({
      data: { chapterId, title: required(title, "Title", 200), position: await nextItemPosition(chapterId) },
    })
    return quiz.id
  })
}

export async function reorderChapterItems(chapterId: string, items: { id: string; type: "lesson" | "quiz" }[]) {
  return run(async () => {
    await db.$transaction(
      items.map((it, position) =>
        it.type === "lesson"
          ? db.lesson.update({ where: { id: it.id, chapterId }, data: { position } })
          : db.quiz.update({ where: { id: it.id, chapterId }, data: { position } }),
      ),
    )
  })
}

// ---------- Lessons ----------

export async function updateLesson(
  id: string,
  data: {
    title?: string
    description?: string
    content?: string
    videoUrl?: string
    youTubeVideoUrl?: string
    points?: number
    isFree?: boolean
    isPublished?: boolean
  },
) {
  return run(async () => {
    if (data.content !== undefined && data.content.length > 2_000_000) throw new Error("The lesson is too big to save")
    await db.lesson.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: required(data.title, "Title", 200) }),
        ...(data.description !== undefined && { description: text(data.description, 1000) || null }),
        ...(data.content !== undefined && { content: data.content || null }),
        ...(data.videoUrl !== undefined && { videoUrl: optUrl(data.videoUrl) }),
        ...(data.youTubeVideoUrl !== undefined && { youTubeVideoUrl: optUrl(data.youTubeVideoUrl) }),
        ...(data.points !== undefined && { points: Math.max(0, Math.min(1000, Math.round(Number(data.points) || 0))) }),
        ...(data.isFree !== undefined && { isFree: !!data.isFree }),
        ...(data.isPublished !== undefined && { isPublished: !!data.isPublished }),
      },
    })
  })
}

export async function deleteLesson(id: string) {
  return run(async () => {
    await db.lesson.delete({ where: { id } })
  })
}

// ---------- Quizzes ----------

export async function updateQuiz(id: string, data: { title?: string; description?: string; isFree?: boolean; isPublished?: boolean }) {
  return run(async () => {
    await db.quiz.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: required(data.title, "Title", 200) }),
        ...(data.description !== undefined && { description: text(data.description, 2000) || null }),
        ...(data.isFree !== undefined && { isFree: !!data.isFree }),
        ...(data.isPublished !== undefined && { isPublished: !!data.isPublished }),
      },
    })
  })
}

export async function deleteQuiz(id: string) {
  return run(async () => {
    await db.$transaction([
      db.userQuizQuestion.deleteMany({ where: { question: { quizId: id } } }),
      db.quiz.delete({ where: { id } }),
    ])
  })
}

// ---------- Questions ----------

const QUESTION_TYPES = ["single_choice", "multiple_choice", "true_false", "open_ended"] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

export type QuestionInput = {
  question: string
  questionType: QuestionType
  options: string[]
  answers: string[]
  hint: string
  note: string
  questionImageUrl: string
  hintImageUrl: string
  imageHeight: number
  points: number
}

/** Normalises options/answers per type, the way the quiz pages and the app read them. */
function cleanQuestion(q: QuestionInput) {
  const type = QUESTION_TYPES.includes(q.questionType) ? q.questionType : "single_choice"
  let options: string[] = []
  let answers = (q.answers || []).map((a) => String(a).trim()).filter(Boolean)

  if (type === "true_false") {
    options = ["True", "False"]
    answers = answers.filter((a) => options.includes(a)).slice(0, 1)
    if (!answers.length) throw new Error("Pick True or False as the correct answer")
  } else if (type === "open_ended") {
    if (!answers.length) throw new Error("Add at least one accepted answer")
  } else {
    options = (q.options || []).map((o) => String(o).trim()).filter(Boolean)
    if (options.length < 2) throw new Error("Add at least 2 options")
    if (new Set(options).size !== options.length) throw new Error("Two options have the same text")
    answers = answers.filter((a) => options.includes(a))
    if (!answers.length) throw new Error("Mark the correct option")
    if (type === "single_choice" && answers.length > 1) throw new Error("Single choice can have only one correct option")
  }

  return {
    question: q.question || "",
    questionType: type,
    options,
    answers,
    openEndedAnswer: type === "open_ended" ? answers[0] : null,
    hint: q.hint || null,
    note: q.note || null,
    questionImageUrl: optUrl(q.questionImageUrl),
    hintImageUrl: optUrl(q.hintImageUrl),
    imageHeight: Math.max(50, Math.min(800, Math.round(Number(q.imageHeight) || 200))),
    points: Math.max(1, Math.min(100, Math.round(Number(q.points) || 1))),
  }
}

export async function createQuestion(quizId: string) {
  return run(async () => {
    const last = await db.quizQuestion.aggregate({ where: { quizId }, _max: { position: true } })
    const q = await db.quizQuestion.create({
      data: {
        quizId,
        question: "",
        questionType: "single_choice",
        options: ["", "", "", ""],
        answers: [],
        points: 1,
        position: (last._max.position ?? -1) + 1,
      },
    })
    await recountQuiz(quizId)
    return q.id
  })
}

export async function updateQuestion(id: string, input: QuestionInput) {
  return run(async () => {
    const data = cleanQuestion(input)
    const q = await db.quizQuestion.update({ where: { id }, data })
    await recountQuiz(q.quizId)
  })
}

export async function duplicateQuestion(id: string) {
  return run(async () => {
    const src = await db.quizQuestion.findUniqueOrThrow({ where: { id } })
    await db.quizQuestion.updateMany({ where: { quizId: src.quizId, position: { gt: src.position } }, data: { position: { increment: 1 } } })
    const copy = await db.quizQuestion.create({
      data: {
        quizId: src.quizId,
        question: src.question,
        questionType: src.questionType,
        options: src.options ?? [],
        answers: src.answers ?? [],
        openEndedAnswer: src.openEndedAnswer,
        hint: src.hint,
        note: src.note,
        questionImageUrl: src.questionImageUrl,
        hintImageUrl: src.hintImageUrl,
        imageHeight: src.imageHeight,
        points: src.points,
        position: src.position + 1,
      },
    })
    await recountQuiz(src.quizId)
    return copy.id
  })
}

export async function deleteQuestion(id: string) {
  return run(async () => {
    const [, q] = await db.$transaction([
      db.userQuizQuestion.deleteMany({ where: { questionId: id } }),
      db.quizQuestion.delete({ where: { id } }),
    ])
    await recountQuiz(q.quizId)
  })
}

export async function reorderQuestions(quizId: string, ids: string[]) {
  return run(async () => {
    await db.$transaction(ids.map((id, position) => db.quizQuestion.update({ where: { id, quizId }, data: { position } })))
  })
}

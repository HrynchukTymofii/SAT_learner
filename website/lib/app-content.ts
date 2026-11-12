import "server-only";
import { createHash } from "crypto";
import { db } from "@/lib/db";

/**
 * Course content for the mobile app, in the column format of the app's local SQLite tables
 * (see app/lib/db/contentSync.ts). The app keeps a local copy and refreshes it from here,
 * so edits in /admin reach the app without a new release.
 *
 * Question, hint and explanation are TipTap JSON in the database; the app expects HTML with
 * math as <span class="math-inline">$…$</span>. The converter below matches what
 * app/scripts/build-offline-db.ts produced for the bundled database, so nothing looks different.
 */

type Node = { type?: string; text?: string; attrs?: Record<string, any>; marks?: { type: string; attrs?: Record<string, any> }[]; content?: Node[] };

function escapeHtml(text: string) {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;", $: "&#36;" };
  return String(text).replace(/[&<>"'$]/g, (m) => map[m]);
}

function renderText(node: Node) {
  let text = escapeHtml(node.text || "");
  for (const mark of node.marks || []) {
    const a = mark.attrs || {};
    if (mark.type === "bold") text = `<strong>${text}</strong>`;
    else if (mark.type === "italic") text = `<em>${text}</em>`;
    else if (mark.type === "underline") text = `<u>${text}</u>`;
    else if (mark.type === "strike") text = `<s>${text}</s>`;
    else if (mark.type === "code") text = `<code>${text}</code>`;
    else if (mark.type === "superscript") text = `<sup>${text}</sup>`;
    else if (mark.type === "subscript") text = `<sub>${text}</sub>`;
    else if (mark.type === "link") text = `<a href="${escapeHtml(a.href || "#")}">${text}</a>`;
    else if (mark.type === "highlight") text = `<mark style="background-color: ${escapeHtml(a.color || "#fef08a")}">${text}</mark>`;
    else if (mark.type === "textStyle") {
      const styles = [a.color && `color: ${escapeHtml(a.color)}`, a.fontSize && `font-size: ${escapeHtml(a.fontSize)}`].filter(Boolean)
      if (styles.length) text = `<span style="${styles.join("; ")}">${text}</span>`;
    }
  }
  return text;
}

function renderNode(node: Node): string {
  const inner = () => (node.content || []).map(renderNode).join("");
  switch (node.type) {
    case "paragraph": return `<p>${inner()}</p>`;
    case "heading": return `<h${node.attrs?.level || 1}>${inner()}</h${node.attrs?.level || 1}>`;
    case "text": return renderText(node);
    case "bulletList": return `<ul>${inner()}</ul>`;
    case "orderedList": return `<ol>${inner()}</ol>`;
    case "listItem": return `<li>${inner()}</li>`;
    case "blockquote": return `<blockquote>${inner()}</blockquote>`;
    case "codeBlock": return `<pre><code>${escapeHtml((node.content || []).map((n) => n.text || "").join(""))}</code></pre>`;
    case "inlineMath": return `<span class="math-inline">$${escapeHtml(node.attrs?.latex || "")}$</span>`;
    case "blockMath": return `<div class="math-display">$$${escapeHtml(node.attrs?.latex || "")}$$</div>`;
    case "image": return `<img src="${escapeHtml(node.attrs?.src || "")}" alt="${escapeHtml(node.attrs?.alt || "")}" />`;
    case "hardBreak": return "<br>";
    case "horizontalRule": return "<hr>";
    default: return "";
  }
}

/** TipTap JSON (string or object) → HTML. Plain text and old HTML pass through unchanged. */
export function tiptapToAppHtml(value: unknown): string {
  if (value == null || value === "") return "";
  let doc: unknown = value;
  if (typeof value === "string") {
    try {
      doc = JSON.parse(value);
    } catch {
      return value;
    }
  }
  const content = (doc as Node)?.content;
  return Array.isArray(content) ? content.map(renderNode).join("") : typeof value === "string" ? value : "";
}

const iso = (d: Date) => d.toISOString();

export async function getAppContent() {
  const courseId = process.env.COURSE_ID || "";
  const chapters = await db.chapter.findMany({
    where: { courseId, isPublished: true },
    orderBy: { position: "asc" },
    select: {
      id: true, title: true, description: true, videoUrl: true, youTubeVideoUrl: true, position: true, isFree: true,
      lessons: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: { id: true, title: true, videoUrl: true, youTubeVideoUrl: true, description: true, position: true, isFree: true, points: true },
      },
      quizzes: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: {
          id: true, title: true, description: true, totalQuestions: true, position: true, isFree: true, maxScore: true, updatedAt: true,
          questions: {
            orderBy: { position: "asc" },
            select: {
              id: true, question: true, questionType: true, questionImageUrl: true, imageHeight: true, options: true, answers: true,
              hint: true, points: true, position: true, hintImageUrl: true, note: true, likes: true, dislikes: true, updatedAt: true,
            },
          },
        },
      },
    },
  });

  const content = {
    chapters: chapters.map((c) => ({
      id: c.id, title: c.title, description: c.description, videoUrl: c.videoUrl, youTubeVideoUrl: c.youTubeVideoUrl,
      position: c.position, isFree: c.isFree ? 1 : 0,
    })),
    lessons: chapters.flatMap((c) =>
      c.lessons.map((l) => ({
        id: l.id, title: l.title, videoUrl: l.videoUrl, youTubeVideoUrl: l.youTubeVideoUrl, description: l.description,
        position: l.position, isFree: l.isFree ? 1 : 0, points: l.points, chapterId: c.id,
      })),
    ),
    quizzes: chapters.flatMap((c) =>
      c.quizzes.map((q) => ({
        id: q.id, title: q.title, description: q.description, totalQuestions: q.totalQuestions, position: q.position,
        isFree: q.isFree ? 1 : 0, maxScore: q.maxScore, chapterId: c.id, updatedAt: iso(q.updatedAt),
      })),
    ),
    questions: chapters.flatMap((c) =>
      c.quizzes.flatMap((q) =>
        q.questions.map((qq) => ({
          id: qq.id,
          question: tiptapToAppHtml(qq.question),
          questionType: qq.questionType || "",
          questionImageUrl: qq.questionImageUrl || "",
          imageHeight: qq.imageHeight || 200,
          options: JSON.stringify(qq.options ?? []),
          answers: JSON.stringify(qq.answers ?? []),
          hint: tiptapToAppHtml(qq.hint),
          points: qq.points || 1,
          position: qq.position || 0,
          hintImageUrl: qq.hintImageUrl || "",
          note: tiptapToAppHtml(qq.note),
          likes: qq.likes || 0,
          dislikes: qq.dislikes || 0,
          quizId: q.id,
          updatedAt: iso(qq.updatedAt),
        })),
      ),
    ),
  };

  // Changes whenever anything the app shows changes (edits, new or deleted items, order)
  const version = createHash("sha256").update(JSON.stringify(content)).digest("hex").slice(0, 16);
  return { version, ...content };
}

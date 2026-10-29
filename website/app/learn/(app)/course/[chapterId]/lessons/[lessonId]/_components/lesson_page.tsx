"use client"

import LessonYouTubeVideo from "@/components/lightYouTubeVideo";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, ChevronLeft, ChevronRight, ListChecks, Loader2, Play } from "lucide-react";
import axios from "axios";
import { Lesson } from "@prisma/client";
import { ReadOnlyEditor } from "@/components/tiptap-templates/simple/readonly-editor";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import { LessonComments } from "./lesson-comments";

interface NavItem {
    id: string;
    title: string;
    type: "lesson" | "quiz";
    position: number;
}

interface LessonProps {
    lesson: Lesson & { chapter?: { id: string; title: string } | null };
    lessonId: string;
    chapterId: string;
    courseId: string;
    chapterTitle: string;
    currentIndex: number;
    totalItems: number;
    prevItem: NavItem | null;
    nextItem: NavItem | null;
}

const LessonContent = ({
    lesson,
    lessonId,
    chapterId,
    courseId,
    chapterTitle,
    currentIndex,
    totalItems,
    prevItem,
    nextItem
}: LessonProps) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const user = useAuth()
    const userId = user.userId

    if (!userId) return null

    const handleMarkComplete = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/user/course/lesson', {
                userId,
                lessonId,
            });

            if (response.status === 200) {
                toast.success("Lesson completed!");

                if (nextItem) {
                    const url = nextItem.type === "lesson"
                        ? `/course/${chapterId}/lessons/${nextItem.id}`
                        : `/course/${chapterId}/quizzes/${nextItem.id}`;
                    router.push(url);
                    router.refresh();
                } else {
                    // Check for next chapter content
                    const { data: nextChapterItem } = await axios.post("/api/user/course/next-page", {
                        userId,
                        courseId,
                        currentChapterId: chapterId,
                        currentItemId: lessonId
                    });

                    if (nextChapterItem) {
                        const url = nextChapterItem.type === "lesson"
                            ? `/course/${nextChapterItem.chapterId}/lessons/${nextChapterItem.id}`
                            : `/course/${nextChapterItem.chapterId}/quizzes/${nextChapterItem.id}`;
                        router.push(url);
                        router.refresh();
                    } else {
                        toast.success("You have completed the course!");
                        router.push(`/courses/${courseId}`);
                    }
                }
            } else {
                toast.error("Failed to update progress.");
            }
        } catch (error) {
            console.error("Error in handleMarkComplete:", error);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const href = (item: NavItem) =>
        item.type === "lesson" ? `/course/${chapterId}/lessons/${item.id}` : `/course/${chapterId}/quizzes/${item.id}`;

    return (
        <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-10">
            <header className="grid gap-2">
                <p className="text-sm font-bold text-muted-foreground">
                    <Link href={`/courses/${courseId}`} className="hover:text-foreground">{chapterTitle}</Link>
                    {currentIndex >= 0 && <> · {currentIndex + 1} of {totalItems}</>}
                </p>
                <h1 className="text-[30px] font-semibold leading-tight sm:text-[40px]">{lesson.title}</h1>
            </header>

            {lesson.youTubeVideoUrl && (
                <div className="overflow-hidden rounded-[28px] border bg-card">
                    <LessonYouTubeVideo youTubeVideoUrl={lesson.youTubeVideoUrl} />
                </div>
            )}

            {lesson.content && (
                <div className="prose max-w-none dark:prose-invert">
                    <ReadOnlyEditor initialContent={lesson.content} />
                </div>
            )}

            <footer className="mt-4 grid gap-3 rounded-[28px] border bg-card p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                {prevItem ? <NavLink item={prevItem} href={href(prevItem)} dir="prev" /> : <span className="hidden sm:block" />}
                <button
                    type="button"
                    onClick={handleMarkComplete}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-foreground py-1.5 pl-5 pr-1.5 font-bold text-background transition-opacity disabled:opacity-60 sm:order-none order-first"
                >
                    {loading ? "Saving…" : nextItem ? "Done, next" : "Done, next chapter"}
                    <span className="grid size-9 place-items-center rounded-full bg-lav text-on-pastel">
                        {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                    </span>
                </button>
                {nextItem ? <NavLink item={nextItem} href={href(nextItem)} dir="next" /> : <span className="hidden sm:block" />}
            </footer>

            <LessonComments lessonId={lessonId} userId={userId} />
        </article>
    );
};

// Previous / next link with the item's title, for skipping without marking the lesson done
function NavLink({ item, href, dir }: { item: NavItem; href: string; dir: "prev" | "next" }) {
    const Icon = item.type === "quiz" ? ListChecks : Play;
    return (
        <Link
            href={href}
            className={cn(
                "flex min-w-0 items-center gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-accent",
                dir === "next" && "flex-row-reverse text-right"
            )}
        >
            {dir === "prev" ? <ChevronLeft className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
            <span className="grid min-w-0">
                <span className="text-xs font-bold text-muted-foreground">{dir === "prev" ? "Previous" : "Next"}</span>
                <span className={cn("flex min-w-0 items-center gap-1.5 text-sm font-bold", dir === "next" && "justify-end")}>
                    <Icon className="size-3 shrink-0" />
                    <span className="truncate">{item.title}</span>
                </span>
            </span>
        </Link>
    );
}

export default LessonContent;

"use client"

import LessonYouTubeVideo from "@/components/lightYouTubeVideo";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, ClipboardList, Home } from "lucide-react";
import axios from "axios";
import { Lesson } from "@prisma/client";
import { ReadOnlyEditor } from "@/components/tiptap-templates/simple/readonly-editor";
import { useState } from "react";
import { Loader } from "@/components/loader";
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
                        router.push(`/course`);
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

    const navigateTo = (item: NavItem) => {
        const url = item.type === "lesson"
            ? `/course/${chapterId}/lessons/${item.id}`
            : `/course/${chapterId}/quizzes/${item.id}`;
        router.push(url);
    };

    if (loading) {
        return (
            <div className="w-full h-[400px] flex justify-center items-center">
                <Loader text="Loading next content..." />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-6 my-8 mx-2 lg:w-[768px] w-full">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/course" className="hover:text-foreground flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    Course
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-medium">{chapterTitle}</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">{lesson.title}</span>
            </nav>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">Lesson</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {currentIndex + 1} / {totalItems}
                    </span>
                </div>
            </div>

            {/* Lesson Title */}
            <div className="flex flex-col gap-y-2">
                <h1 className="text-3xl font-bold">{lesson.title}</h1>
            </div>

            {/* Video Content */}
            {lesson.youTubeVideoUrl ? (
                <div className="relative w-full rounded-lg overflow-hidden border border-border">
                    <LessonYouTubeVideo youTubeVideoUrl={lesson.youTubeVideoUrl} />
                </div>
            ) : lesson.videoUrl ? (
                <div className="h-96 relative aspect-video rounded-lg overflow-hidden border border-border bg-muted" />
            ) : null}

            {/* Lesson Content */}
            <div className="prose dark:prose-invert max-w-none">
                {lesson.content && (
                    <ReadOnlyEditor initialContent={lesson.content} />
                )}
            </div>

            {/* Navigation Footer */}
            <div className="flex flex-col gap-4 pt-6 border-t">
                {/* Previous/Next Navigation */}
                <div className="flex items-center justify-between gap-4">
                    {prevItem ? (
                        <Button
                            variant="outline"
                            onClick={() => navigateTo(prevItem)}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <div className="flex flex-col items-start">
                                <span className="text-xs text-muted-foreground">Previous</span>
                                <span className="text-sm font-medium flex items-center gap-1">
                                    {prevItem.type === "quiz" ? (
                                        <ClipboardList className="w-3 h-3" />
                                    ) : (
                                        <BookOpen className="w-3 h-3" />
                                    )}
                                    {prevItem.title.length > 20 ? prevItem.title.slice(0, 20) + "..." : prevItem.title}
                                </span>
                            </div>
                        </Button>
                    ) : (
                        <div />
                    )}

                    <Button
                        onClick={handleMarkComplete}
                        className="bg-green-600 hover:bg-green-700 text-white px-6"
                    >
                        Mark Complete & Continue
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>

                    {nextItem ? (
                        <Button
                            variant="outline"
                            onClick={() => navigateTo(nextItem)}
                            className="flex items-center gap-2"
                        >
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground">Next</span>
                                <span className="text-sm font-medium flex items-center gap-1">
                                    {nextItem.title.length > 20 ? nextItem.title.slice(0, 20) + "..." : nextItem.title}
                                    {nextItem.type === "quiz" ? (
                                        <ClipboardList className="w-3 h-3" />
                                    ) : (
                                        <BookOpen className="w-3 h-3" />
                                    )}
                                </span>
                            </div>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <div />
                    )}
                </div>

                {/* Back to Course Link */}
                <div className="flex justify-center">
                    <Link
                        href="/course"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← Back to Course Overview
                    </Link>
                </div>
            </div>

            {/* Comments Section */}
            <LessonComments lessonId={lessonId} userId={userId} />
        </div>
    );
};

export default LessonContent;

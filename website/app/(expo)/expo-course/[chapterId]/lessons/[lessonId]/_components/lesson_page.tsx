"use client"

import LessonYouTubeVideo from "@/components/lightYouTubeVideo";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import { Lesson, MuxData } from "@prisma/client";
import { ReadOnlyEditor } from "@/components/tiptap-templates/simple/readonly-editor";
import { useState } from "react";
import { Loader } from "@/components/loader";

type LessonWithMuxData = Lesson & {
    muxData: MuxData | null;
};

interface LessonProps {
    lesson: LessonWithMuxData;
}

const LessonContent = ({ lesson }: LessonProps) => {

    return (
        <div className="flex flex-col gap-y-8 p-2 lg:w-[768px] w-full mx-auto flex-1 bg-white dark:bg-stone-900">

            {lesson.youTubeVideoUrl ? (
                <div className="relative w-full rounded-lg overflow-hidden border-2 border-slate-600">
                    <LessonYouTubeVideo youTubeVideoUrl={lesson.youTubeVideoUrl} />
                </div>
            ) : lesson.videoUrl ? (
                <div className="h-96 relative aspect-video rounded-lg overflow-hidden border-2 border-slate-600" />
            ) : null}

            <div>
                {lesson.content && (
                    <ReadOnlyEditor initialContent={lesson.content} />
                )}
            </div>
        </div>
    );
};

export default LessonContent;

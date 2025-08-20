//import Navbar from './_components/navbar'
//import Sidebar from './_components/sidebar'

import { db } from "@/lib/db";
import ChapterSidebar from "./_components/chapterSidebar"
//import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";


const CourseLayout = async ({ children }: { children: React.ReactNode;}) => {
  const courseId = process.env.COURSE_ID || "";
  //const { userId } = await auth();
  const userId = "user";

  if(!userId){
      return redirect("/courses");
  }

  const course = await db.course.findUnique({
    where: {
        id: courseId
    },
    include: {
        chapters:{
            where: {
                isPublished: true
            },
            orderBy:{
                position: "asc",
            },
            include: {
              lessons: {
                where: { isPublished: true },
                orderBy: { position: "asc" },
                include: { progress: { where: { userId } } },
              },
              quizzes: {
                where: { isPublished: true },
                orderBy: { position: "asc" },
                include: { results: { where: { userId } } },
              },
            },
        },
    }
  });

  if(!course){
    toast.error("Something went wrong!")
    return redirect(`/courses`);
  }

  return <div className="flex flex-row w-full max-w-7xl justify-between gap-6">
    {children}
    </div>
}

export default CourseLayout

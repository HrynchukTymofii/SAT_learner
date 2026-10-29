import { redirect } from "next/navigation";

// The course list lives on the platform home; each course has /courses/[courseId]
export default function CourseIndexPage() {
  redirect("/");
}

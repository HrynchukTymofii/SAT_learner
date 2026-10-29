import { getCourseOutline } from "@/lib/course-outline"
import { Hero } from "@/components/home/hero"
import { AboutSat, Devices, Faq, Path, Plans, Stats, Syllabus } from "@/components/home/sections"

// Static page, rebuilt hourly. Logged-in students never see it: middleware sends them to the platform
export const revalidate = 3600

export default async function HomePage() {
  const outline = await getCourseOutline()

  return (
    <>
      <Hero lessonCount={outline?.lessonCount ?? 0} />
      <Stats outline={outline} />
      <Path />
      <Syllabus outline={outline} />
      <Devices />
      <Plans />
      <AboutSat />
      <Faq />
    </>
  )
}

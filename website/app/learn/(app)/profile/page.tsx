import { redirect } from "next/navigation"
import { auth } from "@/lib/getAuth"
import { db } from "@/lib/db"
import UserProfile from "./_components/user-profile"

export default async function ProfilePage() {
  const { userId, user, isPro } = await auth()
  if (!userId || !user) redirect("/login")

  const [account, lessonsDone, quizzesDone, saved] = await Promise.all([
    db.user.findUnique({ where: { userId }, select: { createdAt: true, points: true } }),
    db.lessonProgress.count({ where: { userId, completed: true } }),
    db.quizResult.count({ where: { userId, completed: true } }),
    db.userQuizQuestion.count({ where: { userId, saved: true } }),
  ])

  return (
    <UserProfile
      name={user.name ?? null}
      email={user.email ?? null}
      image={user.image ?? null}
      isPro={!!isPro}
      joinedAt={account?.createdAt.toISOString() ?? null}
      stats={{ points: account?.points ?? 0, lessonsDone, quizzesDone, saved }}
    />
  )
}

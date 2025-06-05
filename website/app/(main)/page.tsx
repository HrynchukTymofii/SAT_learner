export default function Home() {
  return (
    <main className="flex-1 container py-8 mx-auto">
      <h1 className="text-4xl font-bold mb-6">Welcome to SAT Tutor</h1>
      <p className="text-lg mb-4">Your comprehensive resource for SAT preparation and practice.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-2">Practice Tests</h2>
          <p>Take full-length practice tests or focus on specific sections.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-2">Online Courses</h2>
          <p>Learn strategies and techniques from expert tutors.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-2">SAT Resources</h2>
          <p>Access comprehensive guides and information about the SAT.</p>
        </div>
      </div>
      <div className="h-screen"></div>
    </main>
  )
}

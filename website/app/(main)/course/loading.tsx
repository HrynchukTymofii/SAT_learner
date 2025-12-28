import { Card, CardContent } from "@/components/ui/card"

export default function CourseLoading() {
  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto relative">
      {/* Floating gradient orbs background */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl -z-10" />

      <div className="px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Section */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden border-0 bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl gap-0">
                <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
                <div className="aspect-video bg-foreground/10 animate-pulse" />
              </Card>
            </div>

            {/* Enrollment Card */}
            <Card className="border-0 bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden gap-0">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-600" />
              <CardContent className="p-6 space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <div className="h-7 bg-foreground/10 rounded-lg animate-pulse w-4/5" />
                  <div className="h-6 bg-foreground/10 rounded-full animate-pulse w-24" />
                </div>

                {/* Price */}
                <div className="h-8 bg-foreground/10 rounded-lg animate-pulse w-20" />

                {/* Stats */}
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-foreground/10 rounded-lg animate-pulse" />
                      <div className="h-4 bg-foreground/10 rounded animate-pulse w-28" />
                    </div>
                  ))}
                </div>

                {/* Button */}
                <div className="h-14 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-2xl animate-pulse" />

                {/* Features */}
                <div className="space-y-3 pt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-foreground/5">
                      <div className="w-5 h-5 bg-foreground/10 rounded-full animate-pulse" />
                      <div className="h-4 bg-foreground/10 rounded animate-pulse flex-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content Section */}
        <Card className="border-0 bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-foreground/10 rounded-xl animate-pulse" />
              <div className="h-6 bg-foreground/10 rounded-lg animate-pulse w-40" />
            </div>

            {/* Chapter skeletons */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-border rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-foreground/10 rounded animate-pulse w-2/3" />
                    <div className="h-3 bg-foreground/10 rounded animate-pulse w-1/3" />
                  </div>
                  <div className="w-5 h-5 bg-foreground/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

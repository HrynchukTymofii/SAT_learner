import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LessonLoading() {
  return (
    <div className="flex-1 min-h-screen relative overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/5 dark:to-blue-500/5 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl -z-10" />

      <div className="w-full px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-10 bg-foreground/10 rounded-xl animate-pulse w-32" />
          <div className="flex items-center gap-2">
            <div className="h-6 bg-foreground/10 rounded animate-pulse w-24" />
            <div className="h-6 bg-foreground/10 rounded animate-pulse w-20" />
          </div>
        </div>

        {/* Lesson Card */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-foreground/10 rounded-xl w-10 h-10 animate-pulse" />
              <div className="h-6 bg-foreground/10 rounded-lg animate-pulse w-32" />
            </div>
            <div className="h-8 bg-foreground/10 rounded-lg animate-pulse w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Player */}
            <div className="aspect-video bg-foreground/10 rounded-2xl animate-pulse" />

            {/* Lesson Content */}
            <div className="space-y-4">
              <div className="h-6 bg-foreground/10 rounded-lg animate-pulse w-1/3" />
              <div className="space-y-2">
                <div className="h-4 bg-foreground/10 rounded animate-pulse" />
                <div className="h-4 bg-foreground/10 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-foreground/10 rounded animate-pulse w-4/6" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-foreground/10 rounded animate-pulse" />
                <div className="h-4 bg-foreground/10 rounded animate-pulse w-3/4" />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="h-12 bg-foreground/10 rounded-2xl animate-pulse w-36" />
              <div className="h-12 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-2xl animate-pulse w-36" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

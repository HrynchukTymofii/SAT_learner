import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function QuizLoading() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-10 bg-foreground/10 rounded-xl animate-pulse w-32" />
          <div className="flex items-center gap-4">
            <div className="h-8 bg-foreground/10 rounded-lg animate-pulse w-20" />
            <div className="h-8 bg-foreground/10 rounded-lg animate-pulse w-24" />
          </div>
        </div>

        {/* Quiz Card */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-foreground/10 rounded-xl w-10 h-10 animate-pulse" />
                <div className="h-6 bg-foreground/10 rounded-lg animate-pulse w-32" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 bg-foreground/10 rounded-lg animate-pulse w-16" />
                <div className="h-8 bg-foreground/10 rounded-lg animate-pulse w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-foreground/10 rounded animate-pulse w-24" />
                <div className="h-4 bg-foreground/10 rounded animate-pulse w-16" />
              </div>
              <div className="h-2 bg-foreground/10 rounded-full animate-pulse" />
            </div>

            {/* Question */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-foreground/10 rounded animate-pulse" />
                  <div className="h-5 bg-foreground/10 rounded animate-pulse w-4/5" />
                </div>
              </div>

              {/* Question Image */}
              <div className="h-48 bg-foreground/10 rounded-2xl animate-pulse" />

              {/* Answer Options */}
              <div className="space-y-3 mt-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 border border-border rounded-2xl bg-foreground/5 flex items-center gap-4">
                    <div className="w-8 h-8 bg-foreground/10 rounded-lg animate-pulse flex-shrink-0" />
                    <div className="h-5 bg-foreground/10 rounded animate-pulse flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 bg-foreground/10 rounded-xl animate-pulse w-24" />
                <div className="h-10 bg-foreground/10 rounded-xl animate-pulse w-24" />
              </div>
              <div className="h-12 bg-gradient-to-r from-amber-500/30 to-orange-600/30 rounded-2xl animate-pulse w-36" />
            </div>
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <div className="mt-6">
          <Card className="bg-card/80 backdrop-blur-xl border-0 rounded-2xl shadow-lg overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 bg-foreground/10 rounded animate-pulse w-32" />
                <div className="h-5 bg-foreground/10 rounded animate-pulse w-24" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="w-10 h-10 bg-foreground/10 rounded-lg animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

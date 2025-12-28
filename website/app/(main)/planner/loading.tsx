import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PlannerLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/5 dark:to-blue-500/5 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-9 bg-foreground/10 rounded-lg animate-pulse w-48" />
            <div className="h-5 bg-foreground/10 rounded animate-pulse w-64" />
          </div>
          <div className="h-12 bg-foreground/10 rounded-2xl animate-pulse w-40" />
        </div>

        {/* SAT Countdown Card */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-foreground/10 rounded-2xl w-14 h-14 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 bg-foreground/10 rounded animate-pulse w-32" />
                  <div className="h-4 bg-foreground/10 rounded animate-pulse w-48" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-10 bg-foreground/10 rounded-lg animate-pulse w-14 mb-1" />
                    <div className="h-4 bg-foreground/10 rounded animate-pulse w-12" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Column */}
          <div className="lg:col-span-1">
            <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-foreground/10 rounded-xl w-10 h-10 animate-pulse" />
                  <div className="h-6 bg-foreground/10 rounded-lg animate-pulse w-24" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Week days */}
                <div className="grid grid-cols-7 gap-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((_, i) => (
                    <div key={i} className="text-center py-2">
                      <div className="h-4 bg-foreground/10 rounded animate-pulse w-4 mx-auto" />
                    </div>
                  ))}
                </div>
                {/* Calendar grid */}
                {[1, 2, 3, 4, 5].map((week) => (
                  <div key={week} className="grid grid-cols-7 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <div key={day} className="aspect-square bg-foreground/10 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Tasks Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Tasks */}
            <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-foreground/10 rounded-xl w-10 h-10 animate-pulse" />
                    <div className="h-6 bg-foreground/10 rounded-lg animate-pulse w-32" />
                  </div>
                  <div className="h-10 bg-foreground/10 rounded-xl animate-pulse w-24" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-border rounded-2xl bg-foreground/5 flex items-center gap-4">
                    <div className="w-6 h-6 bg-foreground/10 rounded-full animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-foreground/10 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-foreground/10 rounded animate-pulse w-1/2" />
                    </div>
                    <div className="h-8 bg-foreground/10 rounded-lg animate-pulse w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Suggested Tasks */}
            <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-foreground/10 rounded-xl w-10 h-10 animate-pulse" />
                  <div className="h-6 bg-foreground/10 rounded-lg animate-pulse w-40" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-border rounded-2xl bg-foreground/5 flex items-center gap-4">
                    <div className="p-2 bg-foreground/10 rounded-xl w-10 h-10 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-foreground/10 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-foreground/10 rounded animate-pulse w-1/3" />
                    </div>
                    <div className="h-10 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-xl animate-pulse w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

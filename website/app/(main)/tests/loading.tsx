import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function TestsLoading() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/5 dark:to-blue-500/5 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="h-10 bg-foreground/10 rounded-lg animate-pulse w-64 mx-auto mb-4" />
          <div className="h-5 bg-foreground/10 rounded animate-pulse w-96 mx-auto" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card/80 backdrop-blur-xl border-0 rounded-2xl shadow-lg overflow-hidden">
              <CardContent className="p-4 text-center">
                <div className="h-8 w-8 bg-foreground/10 rounded-lg mx-auto mb-2 animate-pulse" />
                <div className="h-7 bg-foreground/10 rounded-lg animate-pulse w-12 mx-auto mb-1" />
                <div className="h-4 bg-foreground/10 rounded animate-pulse w-20 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/80 backdrop-blur-xl border-0 rounded-3xl shadow-xl overflow-hidden h-full">
              <div className="h-1 bg-gradient-to-r from-purple-500/50 to-pink-500/50" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-foreground/10 rounded-xl w-12 h-12 animate-pulse" />
                  <div className="h-6 bg-foreground/10 rounded-lg animate-pulse w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 bg-foreground/10 rounded animate-pulse w-full" />
                <div className="h-4 bg-foreground/10 rounded animate-pulse w-4/5" />
                <div className="h-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chapter Practice */}
        <Card className="bg-card/80 backdrop-blur-xl border-0 rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-foreground/10 rounded-xl w-10 h-10 animate-pulse" />
              <div className="h-7 bg-foreground/10 rounded-lg animate-pulse w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border border-border rounded-2xl bg-foreground/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl animate-pulse" />
                      <div className="h-5 bg-foreground/10 rounded animate-pulse w-32" />
                    </div>
                    <div className="h-6 bg-foreground/10 rounded-full animate-pulse w-16" />
                  </div>
                  <div className="h-2 bg-foreground/10 rounded-full animate-pulse mb-2" />
                  <div className="h-3 bg-foreground/10 rounded animate-pulse w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-card/80 backdrop-blur-xl border-0 rounded-2xl shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-foreground/10 rounded-xl w-14 h-14 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-foreground/10 rounded animate-pulse w-32" />
                    <div className="h-4 bg-foreground/10 rounded animate-pulse w-48" />
                  </div>
                  <div className="h-10 bg-foreground/10 rounded-xl animate-pulse w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

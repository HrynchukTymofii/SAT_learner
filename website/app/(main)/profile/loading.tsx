import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header Section */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="h-28 w-28 md:h-36 md:w-36 rounded-full bg-foreground/10 animate-pulse" />
                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-gradient-to-r from-purple-500/50 to-pink-600/50 animate-pulse" />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left space-y-3 w-full">
                <div className="h-9 bg-foreground/10 rounded-lg animate-pulse w-48 mx-auto md:mx-0" />
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="h-4 w-4 bg-foreground/10 rounded animate-pulse" />
                  <div className="h-4 bg-foreground/10 rounded animate-pulse w-40" />
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                  <div className="h-8 bg-gradient-to-r from-purple-500/30 to-pink-600/30 rounded-full animate-pulse w-20" />
                  <div className="h-8 bg-foreground/10 rounded-full animate-pulse w-32" />
                </div>
              </div>

              {/* Edit Button */}
              <div className="h-10 bg-gradient-to-r from-purple-500/50 to-pink-600/50 rounded-2xl animate-pulse w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-xl w-10 h-10 animate-pulse" />
              <div className="h-7 bg-foreground/10 rounded-lg animate-pulse w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center p-5 bg-foreground/5 rounded-2xl border border-border">
                  <div className="h-10 w-10 mx-auto mb-3 bg-foreground/10 rounded-lg animate-pulse" />
                  <div className="h-8 bg-foreground/10 rounded-lg animate-pulse w-16 mx-auto mb-2" />
                  <div className="h-4 bg-foreground/10 rounded animate-pulse w-20 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-xl w-10 h-10 animate-pulse" />
              <div className="h-7 bg-foreground/10 rounded-lg animate-pulse w-36" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-5 rounded-2xl border border-border bg-foreground/5">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-xl bg-foreground/10 w-14 h-14 animate-pulse" />
                    <div className="h-4 bg-foreground/10 rounded animate-pulse w-20" />
                    <div className="h-3 bg-foreground/10 rounded animate-pulse w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-gray-500 to-gray-700" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-gray-500/30 to-gray-700/30 rounded-xl w-10 h-10 animate-pulse" />
              <div className="h-7 bg-foreground/10 rounded-lg animate-pulse w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-foreground/5 border border-border rounded-2xl animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

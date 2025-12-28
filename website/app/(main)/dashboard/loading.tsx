"use client"

import { motion } from "framer-motion"
import { Target, MessageCircle, AlertCircle, Bookmark } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Progress Skeleton Component
const ProgressSkeleton = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center space-y-2">
          <div className="h-24 w-24 rounded-full bg-foreground/10 animate-pulse" />
          <div className="h-4 w-20 bg-foreground/10 rounded animate-pulse" />
          <div className="h-3 w-16 bg-foreground/10 rounded animate-pulse" />
        </div>
      ))}
    </div>
    <div className="border-t border-border pt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 bg-foreground/10 rounded animate-pulse" />
        <div className="h-6 w-40 bg-foreground/10 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-foreground/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-foreground/10 rounded animate-pulse" />
              <div className="h-4 w-4 bg-foreground/10 rounded animate-pulse" />
            </div>
            <div className="h-5 w-32 bg-foreground/10 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 bg-foreground/10 rounded animate-pulse" />
              <div className="h-3 w-20 bg-foreground/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Table Skeleton Component
const TableSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="border border-border rounded-xl p-3 space-y-2 bg-foreground/5">
        <div className="flex items-start justify-between">
          <div className="h-4 w-3/4 bg-foreground/10 rounded animate-pulse" />
          <div className="h-6 w-16 bg-foreground/10 rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-1/3 bg-foreground/10 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 bg-foreground/10 rounded animate-pulse" />
            <div className="h-3 w-16 bg-foreground/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Chat Skeleton Component
const ChatSkeleton = () => (
  <div className="space-y-4">
    <div className="h-64 overflow-y-auto space-y-3 p-3 bg-foreground/5 rounded-xl">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
          <div className="max-w-[80%] p-3 rounded-xl bg-card border border-border">
            <div className="h-4 w-32 bg-foreground/10 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
    <div className="flex gap-2">
      <div className="h-10 flex-1 bg-foreground/10 rounded-xl animate-pulse" />
      <div className="h-10 w-10 bg-foreground/10 rounded-xl animate-pulse" />
    </div>
  </div>
)

// Saved Items Skeleton Component
const SavedItemsSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-1 bg-foreground/5 rounded-xl p-1">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-8 bg-foreground/10 rounded-lg animate-pulse" />
      ))}
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 border border-border rounded-xl bg-foreground/5">
          <div className="space-y-1">
            <div className="h-4 w-32 bg-foreground/10 rounded animate-pulse" />
            <div className="h-3 w-16 bg-foreground/10 rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-foreground/10 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
  </div>
)

export default function DashboardLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="h-9 w-64 bg-foreground/10 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-96 bg-foreground/10 rounded animate-pulse" />
        </motion.div>

        {/* Main Grid Layout */}
        <div className="space-y-6">
          {/* Top Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Your Progress & Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressSkeleton />
              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Ask a Tutor */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      Ask a Tutor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChatSkeleton />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Mistakes Review */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      Recent Mistakes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TableSkeleton />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Saved Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden h-fit">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                      <Bookmark className="h-5 w-5 text-white" />
                    </div>
                    Saved Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SavedItemsSkeleton />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

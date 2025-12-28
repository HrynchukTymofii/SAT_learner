"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfWeek, differenceInDays, isSameDay } from "date-fns"
import {
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  FileQuestion,
  RotateCcw,
  Target,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface StudyTask {
  id: string
  title: string
  type: string
  targetId?: string | null
  completed: boolean
  position: number
}

interface StudyPlan {
  id: string
  date: string
  tasks: StudyTask[]
}

interface Props {
  initialPlan: StudyPlan | null
  initialWeekPlans: StudyPlan[]
  satDate: string | null
  suggestedTasks: { title: string; type: string; targetId: string }[]
}

export function StudyPlannerClient({
  initialPlan,
  initialWeekPlans,
  satDate: initialSatDate,
  suggestedTasks,
}: Props) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()))
  const [tasks, setTasks] = useState<StudyTask[]>(initialPlan?.tasks || [])
  const [weekPlans, setWeekPlans] = useState(initialWeekPlans)
  const [satDate, setSatDate] = useState(initialSatDate)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isSettingSatDate, setIsSettingSatDate] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskType, setNewTaskType] = useState("custom")
  const [loading, setLoading] = useState(false)

  // Calculate days until SAT
  const daysUntilSat = satDate
    ? differenceInDays(new Date(satDate), new Date())
    : null

  // Get week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Load plan for selected date
  useEffect(() => {
    loadPlanForDate(selectedDate)
  }, [selectedDate])

  async function loadPlanForDate(date: Date) {
    try {
      const res = await fetch(
        `/api/user/study-plan?date=${format(date, "yyyy-MM-dd")}`
      )
      const plan = await res.json()
      setTasks(plan?.tasks || [])
    } catch (error) {
      console.error("Error loading plan:", error)
    }
  }

  async function toggleTask(taskId: string, completed: boolean) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed } : t))
    )

    try {
      await fetch("/api/user/study-plan/task", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed }),
      })
    } catch (error) {
      console.error("Error toggling task:", error)
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !completed } : t))
      )
    }
  }

  async function addTask() {
    if (!newTaskTitle.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/user/study-plan/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(selectedDate, "yyyy-MM-dd"),
          title: newTaskTitle,
          type: newTaskType,
        }),
      })
      const task = await res.json()
      setTasks((prev) => [...prev, task])
      setNewTaskTitle("")
      setNewTaskType("custom")
      setIsAddingTask(false)
    } catch (error) {
      console.error("Error adding task:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addSuggestedTask(suggestion: {
    title: string
    type: string
    targetId: string
  }) {
    setLoading(true)
    try {
      const res = await fetch("/api/user/study-plan/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(selectedDate, "yyyy-MM-dd"),
          title: suggestion.title,
          type: suggestion.type,
          targetId: suggestion.targetId,
        }),
      })
      const task = await res.json()
      setTasks((prev) => [...prev, task])
    } catch (error) {
      console.error("Error adding suggested task:", error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteTask(taskId: string) {
    const prevTasks = tasks
    setTasks((prev) => prev.filter((t) => t.id !== taskId))

    try {
      await fetch(`/api/user/study-plan/task?taskId=${taskId}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      setTasks(prevTasks)
    }
  }

  async function saveSatDate(date: string) {
    try {
      await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ satDate: date }),
      })
      setSatDate(date)
      setIsSettingSatDate(false)
    } catch (error) {
      console.error("Error saving SAT date:", error)
    }
  }

  function getTaskIcon(type: string) {
    switch (type) {
      case "lesson":
        return <BookOpen className="h-4 w-4" />
      case "quiz":
        return <FileQuestion className="h-4 w-4" />
      case "review":
        return <RotateCcw className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  function getTaskCountForDate(date: Date) {
    const plan = weekPlans.find((p) => isSameDay(new Date(p.date), date))
    return plan?.tasks.length || 0
  }

  function getCompletedCountForDate(date: Date) {
    const plan = weekPlans.find((p) => isSameDay(new Date(p.date), date))
    return plan?.tasks.filter((t) => t.completed).length || 0
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with SAT Countdown */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Study Planner</h1>
            <p className="text-muted-foreground">
              Plan your daily SAT prep tasks
            </p>
          </div>

          {/* SAT Countdown */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              {daysUntilSat !== null && daysUntilSat >= 0 ? (
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {daysUntilSat}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    days until SAT
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(satDate!), "MMM d, yyyy")}
                  </div>
                </div>
              ) : (
                <Dialog open={isSettingSatDate} onOpenChange={setIsSettingSatDate}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      Set SAT Date
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>When is your SAT?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        type="date"
                        min={format(new Date(), "yyyy-MM-dd")}
                        onChange={(e) => saveSatDate(e.target.value)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Week Calendar */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">This Week</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekStart(addDays(weekStart, -7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setWeekStart(startOfWeek(new Date()))
                  setSelectedDate(new Date())
                }}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekStart(addDays(weekStart, 7))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())
              const taskCount = getTaskCountForDate(day)
              const completedCount = getCompletedCountForDate(day)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                    isToday && !isSelected && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <span className="text-xs font-medium">
                    {format(day, "EEE")}
                  </span>
                  <span className="text-lg font-bold">{format(day, "d")}</span>
                  {taskCount > 0 && (
                    <div
                      className={cn(
                        "text-xs mt-1 px-1.5 py-0.5 rounded-full",
                        isSelected
                          ? "bg-primary-foreground/20"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {completedCount}/{taskCount}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Tasks */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{format(selectedDate, "EEEE, MMMM d")}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {totalCount === 0
                      ? "No tasks planned"
                      : `${completedCount} of ${totalCount} completed`}
                  </p>
                </div>
                <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Study Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Task Title</Label>
                        <Input
                          placeholder="e.g., Complete Algebra lesson"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={newTaskType} onValueChange={setNewTaskType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lesson">Lesson</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        className="w-full"
                        onClick={addTask}
                        disabled={loading || !newTaskTitle.trim()}
                      >
                        Add Task
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {/* Progress bar */}
              {totalCount > 0 && (
                <div className="mt-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks for this day</p>
                  <p className="text-sm">Add tasks or pick from suggestions</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all group",
                        task.completed
                          ? "bg-muted/50 border-transparent"
                          : "hover:border-primary/50"
                      )}
                    >
                      <button
                        onClick={() => toggleTask(task.id, !task.completed)}
                        className="flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>
                      <div
                        className={cn(
                          "flex items-center gap-2 flex-1 min-w-0",
                          task.completed && "opacity-60"
                        )}
                      >
                        <span className="text-muted-foreground">
                          {getTaskIcon(task.type)}
                        </span>
                        <span
                          className={cn(
                            "truncate",
                            task.completed && "line-through"
                          )}
                        >
                          {task.title}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Suggestions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Great job! You&apos;ve completed all available content.
                </p>
              ) : (
                <div className="space-y-2">
                  {suggestedTasks.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => addSuggestedTask(suggestion)}
                      disabled={loading}
                      className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm truncate">{suggestion.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

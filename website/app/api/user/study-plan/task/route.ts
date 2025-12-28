import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// PATCH toggle task completion or update task
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { taskId, completed, title, type } = body

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    // Verify the task belongs to the user
    const task = await db.studyTask.findUnique({
      where: { id: taskId },
      include: { plan: true },
    })

    if (!task || task.plan.userId !== session.user.userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Update the task
    const updatedTask = await db.studyTask.update({
      where: { id: taskId },
      data: {
        ...(completed !== undefined && { completed }),
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// DELETE a task
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    // Verify the task belongs to the user
    const task = await db.studyTask.findUnique({
      where: { id: taskId },
      include: { plan: true },
    })

    if (!task || task.plan.userId !== session.user.userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await db.studyTask.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}

// POST add a new task to an existing plan
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { date, title, type, targetId } = body

    if (!date || !title || !type) {
      return NextResponse.json({ error: "Date, title, and type are required" }, { status: 400 })
    }

    // Get or create the plan for this date
    let plan = await db.studyPlan.findUnique({
      where: {
        userId_date: {
          userId: session.user.userId,
          date: new Date(date),
        },
      },
      include: { tasks: true },
    })

    if (!plan) {
      plan = await db.studyPlan.create({
        data: {
          userId: session.user.userId,
          date: new Date(date),
        },
        include: { tasks: true },
      })
    }

    // Get the next position
    const maxPosition = plan.tasks.length > 0
      ? Math.max(...plan.tasks.map(t => t.position))
      : -1

    // Create the new task
    const task = await db.studyTask.create({
      data: {
        planId: plan.id,
        title,
        type,
        targetId,
        position: maxPosition + 1,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error adding task:", error)
    return NextResponse.json({ error: "Failed to add task" }, { status: 500 })
  }
}

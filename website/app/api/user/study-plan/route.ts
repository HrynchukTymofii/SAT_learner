import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET study plans for a date range
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const date = searchParams.get("date")

    // If single date requested
    if (date) {
      const plan = await db.studyPlan.findUnique({
        where: {
          userId_date: {
            userId: session.user.userId,
            date: new Date(date),
          },
        },
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
      })
      return NextResponse.json(plan)
    }

    // If date range requested
    if (startDate && endDate) {
      const plans = await db.studyPlan.findMany({
        where: {
          userId: session.user.userId,
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
      })
      return NextResponse.json(plans)
    }

    return NextResponse.json({ error: "Missing date parameters" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching study plans:", error)
    return NextResponse.json({ error: "Failed to fetch study plans" }, { status: 500 })
  }
}

// POST create or update study plan for a date
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { date, tasks } = body

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    // Upsert the plan
    const plan = await db.studyPlan.upsert({
      where: {
        userId_date: {
          userId: session.user.userId,
          date: new Date(date),
        },
      },
      create: {
        userId: session.user.userId,
        date: new Date(date),
        tasks: {
          create: tasks?.map((task: any, index: number) => ({
            title: task.title,
            type: task.type,
            targetId: task.targetId,
            completed: task.completed || false,
            position: index,
          })) || [],
        },
      },
      update: {
        // Delete existing tasks and recreate
        tasks: {
          deleteMany: {},
          create: tasks?.map((task: any, index: number) => ({
            title: task.title,
            type: task.type,
            targetId: task.targetId,
            completed: task.completed || false,
            position: index,
          })) || [],
        },
      },
      include: {
        tasks: {
          orderBy: { position: "asc" },
        },
      },
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error creating study plan:", error)
    return NextResponse.json({ error: "Failed to create study plan" }, { status: 500 })
  }
}

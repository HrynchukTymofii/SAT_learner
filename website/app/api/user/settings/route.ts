import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET user settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await db.userSettings.findUnique({
      where: { userId: session.user.userId },
    })

    return NextResponse.json(settings || { satDate: null, reminderTime: null })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// POST/PATCH update user settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { satDate, reminderTime } = body

    const settings = await db.userSettings.upsert({
      where: { userId: session.user.userId },
      create: {
        userId: session.user.userId,
        satDate: satDate ? new Date(satDate) : null,
        reminderTime,
      },
      update: {
        ...(satDate !== undefined && { satDate: satDate ? new Date(satDate) : null }),
        ...(reminderTime !== undefined && { reminderTime }),
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

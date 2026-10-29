import { NextRequest, NextResponse } from "next/server"

import { deleteUserAccount, getUserData } from "@/app/actions/user-actions"
import { requireAuth } from "@/lib/expo-auth"
import { getRefreshedToken } from "@/lib/jwt"

export async function GET(req: NextRequest) {
  // Invalid or expired token → 401 "Unauthorized", which the app treats as logged out
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  try {
    const result = await getUserData(userId)

    if (!result.success || !result.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const token = getRefreshedToken(req, result.user)
    return NextResponse.json(token ? { ...result.user, token } : result.user)
  } catch (error) {
    console.error("❌ Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}


export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  try {
    const result = await deleteUserAccount(userId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ Error deleting account:", err)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}

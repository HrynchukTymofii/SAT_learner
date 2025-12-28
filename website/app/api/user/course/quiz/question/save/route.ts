import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toggleSave } from "@/app/actions/questions";
import { requireAuth } from "@/lib/expo-auth";

export async function POST(req: NextRequest) {
  let userId: string | undefined;

  // Try NextAuth session first (for web)
  const session = await getServerSession(authOptions);
  if (session?.user?.userId) {
    userId = session.user.userId;
  } else {
    // Fall back to JWT auth (for mobile)
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    userId = auth.userId;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { questionId, saved } = await req.json();

  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }

  try {
    // If saved is explicitly provided, use setSave, otherwise toggle
    const result = await toggleSave(userId, questionId);
    return NextResponse.json({ saved: result });
  } catch (error) {
    console.error("Error toggling save:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

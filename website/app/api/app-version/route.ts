import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/app-version
 *
 * Returns the required app version info for the mobile app
 * The app compares this with its current version to show update prompts
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch the SAT Math Learner app config
    const app = await db.apps.findFirst({
      where: { name: "SAT Math Learner" },
      select: {
        version: true,
      },
    });

    if (!app || !app.version) {
      // If no version configured, return a default that won't trigger updates
      return NextResponse.json({
        version: "0.0.0",
        forceUpdate: false,
      });
    }

    return NextResponse.json({
      version: app.version,
      forceUpdate: false,
      updateMessage: "A new version of SAT Math Learner is available with bug fixes and new features!",
    });
  } catch (error) {
    console.error("Failed to fetch app version:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

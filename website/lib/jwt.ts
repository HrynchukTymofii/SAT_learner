import { User } from "@prisma/client";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Tokens older than this get replaced on the next /api/user call
const REFRESH_AFTER_SECONDS = 24 * 60 * 60;

export function createJwtToken(user: Pick<User, "userId" | "email">) {
  return jwt.sign(
    { id: user.userId, email: user.email },
    JWT_SECRET,
    { expiresIn: "60d" }
  );
}

// New token when the request's token is older than a day, so active users never hit the 60-day expiry.
// Only call after requireAuth, which has already verified the token.
export function getRefreshedToken(req: NextRequest, user: Pick<User, "userId" | "email">): string | null {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;

  const decoded = jwt.decode(token) as { iat?: number } | null;
  if (!decoded?.iat) return null;

  const ageSeconds = Date.now() / 1000 - decoded.iat;
  return ageSeconds > REFRESH_AFTER_SECONDS ? createJwtToken(user) : null;
}

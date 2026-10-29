import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose"; 
import { db } from "@/lib/db"; 
import { createJwtToken } from "@/lib/jwt";

// Fetch Apple public keys once and cache them
let appleJWKS: jose.JWTVerifyGetKey;

async function getAppleJWKS() {
  if (!appleJWKS) {
    const JWKS = jose.createRemoteJWKSet(
      new URL("https://appleid.apple.com/auth/keys")
    );
    appleJWKS = JWKS;
  }
  return appleJWKS;
}

export async function POST(req: NextRequest) {
  try {
    // The app also sends `email`, but it's ignored: only the verified token decides the account
    const { id_token, name: frontendName } = await req.json();
    if (!id_token) {
      return NextResponse.json({ error: "Missing id_token" }, { status: 400 });
    }

    // 🔐 Verify Apple ID token
    const JWKS = await getAppleJWKS();
    const { payload } = await jose.jwtVerify(id_token, JWKS, {
      issuer: "https://appleid.apple.com",
      audience: process.env.APPLE_CLIENT_ID,
    });

    // Email from the verified token only. Trusting the email sent by the app let any valid
    // Apple token log in as any account. Apple puts the email (or private relay address)
    // in the token on every sign-in when the EMAIL scope is requested
    const email = payload.email as string | undefined;
    const name = frontendName || "Student";

    if (!email) {
      return NextResponse.json({ error: "No email from Apple" }, { status: 400 });
    }

    // 🧠 Check or create user in DB
    let user = await db.user.findFirst({
      where: { email, platform: "SATecosystem" },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name,
          platform: "SATecosystem",
        },
      });
    }

    // 🎫 Create your own JWT
    const token = createJwtToken(user);

    return NextResponse.json({ token });
  } catch (err) {
    console.error("[APPLE CALLBACK ERROR]", err);
    return NextResponse.json({ error: "Failed to verify Apple token" }, { status: 500 });
  }
}

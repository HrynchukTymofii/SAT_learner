const RC_SUBSCRIBERS_URL = "https://api.revenuecat.com/v1/subscribers";
const PRO_ENTITLEMENTS = ["PRO Yearly", "PRO Monthly"];

/**
 * Asks RevenueCat whether the user has an active PRO entitlement.
 * The RevenueCat app user id is our DB userId (the app calls Purchases.logIn(userId)).
 *
 * @returns true/false from RevenueCat, or null if RevenueCat could not be reached
 */
export async function hasActiveProEntitlement(userId: string): Promise<boolean | null> {
  const apiKey = process.env.REVENUECAT_SECRET_KEY;
  if (!apiKey) {
    console.warn("REVENUECAT_SECRET_KEY is not set; skipping PRO check");
    return null;
  }

  try {
    const res = await fetch(`${RC_SUBSCRIBERS_URL}/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("RevenueCat PRO check failed:", res.status);
      return null;
    }

    const data = await res.json();
    const entitlements = data?.subscriber?.entitlements ?? {};
    const now = Date.now();

    return PRO_ENTITLEMENTS.some((name) => {
      const entitlement = entitlements[name];
      if (!entitlement) return false;
      // Lifetime entitlements have no expiry date
      return entitlement.expires_date === null || new Date(entitlement.expires_date).getTime() > now;
    });
  } catch (err) {
    console.warn("RevenueCat PRO check failed:", err);
    return null;
  }
}

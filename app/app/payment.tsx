import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, Text, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import Toast from "react-native-toast-message";
import { ArrowRight, Check, Crown, X } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { upgradeToPro } from "@/lib/api/user";
import { Fonts, usePalette } from "@/constants/palette";
import { CircleButton, GUTTER, LinkButton, PillButton, Screen, T, Tag, Tap } from "@/components/ds";
import { GeometryAnimation } from "@/components/art/GeometryAnimation";

const FEATURES = ["Every lesson", "800+ practice questions", "Full exams with real scoring", "Hints and explanations"];
const STORE = Platform.OS === "ios" ? "App Store" : "Google Play";

/** PRO paywall (RevenueCat). Purchase and restore logic unchanged from before the redesign. */
export default function PaywallScreen() {
  const router = useRouter();
  const c = usePalette();
  const { token, user, setUser } = useAuth();

  const [packages, setPackages] = useState<{ monthly: PurchasesPackage | null; yearly: PurchasesPackage | null }>({ monthly: null, yearly: null });
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        let allPackages = offerings.current?.availablePackages || [];
        // Combine packages from all offerings if needed
        if (allPackages.length < 2) {
          Object.values(offerings.all).forEach((offering: any) => {
            if (offering.availablePackages) allPackages = [...allPackages, ...offering.availablePackages];
          });
        }
        const id = (p: PurchasesPackage) => p.identifier.toLowerCase();
        const monthly = allPackages.find((p) => id(p).includes("monthly") || id(p).includes("month")) || null;
        const yearly = allPackages.find((p) => id(p).includes("yearly") || id(p).includes("annual") || id(p).includes("year")) || null;
        setPackages({ monthly, yearly });
        if (!yearly && monthly) setSelectedPlan("monthly");
      } catch (e) {
        console.error("Error fetching offerings:", e);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchOfferings();
  }, []);

  const showLoginToActivate = () => {
    Toast.show({ type: "success", text1: "Purchase found", text2: "Log in to activate PRO on your account", visibilityTime: 3000 });
    router.replace({ pathname: "/login", params: { returnUrl: "/" } });
  };

  const handleSubscribe = async () => {
    const pkg = selectedPlan === "monthly" ? packages.monthly : packages.yearly;
    if (!pkg) return;
    try {
      setLoading(true);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active["PRO Yearly"] || customerInfo.entitlements.active["PRO Monthly"]) {
        // Guest purchase: RevenueCat moves it to the account on login, and the background sync in _layout then grants PRO
        if (!token) {
          showLoginToActivate();
          return;
        }
        const planName = customerInfo.entitlements.active["PRO Yearly"] ? "PRO Yearly" : "PRO Monthly";
        const result = await upgradeToPro(token, planName);
        if (result.success) {
          if (user) setUser({ ...user, isPro: true });
          Toast.show({ type: "success", text1: "Welcome to PRO", text2: "Everything is unlocked", visibilityTime: 3000 });
          router.push("/");
        } else {
          Toast.show({ type: "error", text1: result.error, visibilityTime: 3000 });
        }
      }
    } catch (e: any) {
      console.error("Purchase error:", e);
      if (!e.userCancelled) Toast.show({ type: "error", text1: "Purchase failed", text2: "Please try again", visibilityTime: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      const customerInfo = await Purchases.restorePurchases();
      const hasPro = customerInfo.entitlements.active["PRO Yearly"] || customerInfo.entitlements.active["PRO Monthly"];
      if (!hasPro) {
        Toast.show({ type: "info", text1: "No purchases found", text2: "No previous subscriptions were detected" });
        return;
      }
      if (!token) {
        showLoginToActivate();
        return;
      }
      const planName = customerInfo.entitlements.active["PRO Yearly"] ? "PRO Yearly" : "PRO Monthly";
      const result = await upgradeToPro(token, planName);
      if (!result.success) {
        Toast.show({ type: "error", text1: result.error });
      } else {
        if (user) setUser({ ...user, isPro: true });
        Toast.show({ type: "success", text1: "Purchases restored", text2: "Your PRO access is back" });
        router.replace("/");
      }
    } catch (e) {
      console.error("Restore error:", e);
      Toast.show({ type: "error", text1: "Restore failed", text2: "Please try again later" });
    } finally {
      setLoading(false);
    }
  };

  const { monthly, yearly } = packages;
  const money = (n: number, currency: string) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  const yearlyPrice = yearly ? (yearly.product.introPrice?.price ?? yearly.product.price) : 0;
  const savePct = monthly && yearly && monthly.product.price > 0 ? Math.round((1 - yearlyPrice / 12 / monthly.product.price) * 100) : 0;
  const selected = selectedPlan === "monthly" ? monthly : yearly;
  const ctaNote = selected
    ? selectedPlan === "yearly"
      ? `${yearly!.product.introPrice?.priceString || yearly!.product.priceString} for the first year, then renews yearly`
      : `${monthly!.product.priceString} a month, cancel any time`
    : "";

  return (
    <Screen
      bg={c.lav}
      footer={
        <View style={{ gap: 8 }}>
          <PillButton tone="black" title={selected ? "Continue" : "Plans unavailable"} icon={ArrowRight} loading={loading} disabled={!selected || loading} onPress={handleSubscribe} />
          {!!ctaNote && (
            <T variant="caption" onPastel style={{ textAlign: "center", opacity: 0.7 }}>
              {ctaNote}
            </T>
          )}
        </View>
      }
    >
      {/* Top: close + animated geometry */}
      <PastelHeader onClose={() => (router.canGoBack() ? router.back() : router.replace("/"))} />

      <View style={{ gap: 12 }}>
        <Tag label="SAT Learner PRO" tone="ink" icon={Crown} />
        <T variant="hero" onPastel style={{ fontSize: 34, lineHeight: 37 }}>
          Hit 800 on the SAT
        </T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {FEATURES.map((f) => (
            <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.75)", borderRadius: 999, paddingVertical: 7, paddingLeft: 8, paddingRight: 12 }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#0B0A0F", alignItems: "center", justifyContent: "center" }}>
                <Check size={11} color="#fff" strokeWidth={3.2} />
              </View>
              <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 13, color: "#0B0A0F" }}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Plans */}
      <View style={{ gap: 10 }}>
        {loadingPlans ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator color="#0B0A0F" />
          </View>
        ) : !monthly && !yearly ? (
          <View style={{ backgroundColor: "#fff", borderRadius: 22, padding: 18, gap: 4 }}>
            <T variant="bodyStrong" onPastel>
              Plans aren't available right now
            </T>
            <T variant="small" onPastel style={{ opacity: 0.7 }}>
              Check your internet connection and open this screen again.
            </T>
          </View>
        ) : (
          <>
            {yearly && (
              <PlanCard
                selected={selectedPlan === "yearly"}
                onPress={() => setSelectedPlan("yearly")}
                title="Yearly"
                badge={savePct > 0 ? `Save ${savePct}%` : "Best value"}
                price={yearly.product.introPrice?.priceString || yearly.product.priceString}
                oldPrice={yearly.product.introPrice ? yearly.product.priceString : undefined}
                per="/ year"
                note={`${money(yearlyPrice / 12, yearly.product.currencyCode)} a month`}
              />
            )}
            {monthly && (
              <PlanCard
                selected={selectedPlan === "monthly"}
                onPress={() => setSelectedPlan("monthly")}
                title="Monthly"
                price={monthly.product.priceString}
                per="/ month"
                note="Cancel any time"
              />
            )}
          </>
        )}
      </View>

      {/* Small print */}
      <View style={{ alignItems: "center", gap: 10, paddingBottom: 4 }}>
        <LinkButton title="Restore purchases" onPastel onPress={handleRestorePurchases} />
        <View style={{ flexDirection: "row", gap: 18 }}>
          <LinkButton title="Terms of Service" onPastel onPress={() => Linking.openURL("https://www.satlearner.com/terms-of-service")} />
          <LinkButton title="Privacy Policy" onPastel onPress={() => Linking.openURL("https://www.satlearner.com/privacy-policy")} />
        </View>
        <T variant="caption" onPastel style={{ textAlign: "center", opacity: 0.55, fontSize: 10.5, lineHeight: 14 }}>
          Renews automatically until cancelled in your {STORE} settings.
        </T>
      </View>
    </Screen>
  );
}

function PastelHeader({ onClose }: { onClose: () => void }) {
  const { width } = useWindowDimensions();
  return (
    <View style={{ height: 190, marginHorizontal: -GUTTER, marginTop: -12 }}>
      <GeometryAnimation width={width} height={190} />
      <View style={{ position: "absolute", left: GUTTER, top: 8 }}>
        <CircleButton icon={X} label="Close" onPastel filled onPress={onClose} />
      </View>
    </View>
  );
}

function PlanCard({
  selected,
  onPress,
  title,
  badge,
  price,
  oldPrice,
  per,
  note,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  badge?: string;
  price: string;
  oldPrice?: string;
  per: string;
  note: string;
}) {
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: selected ? "#FEE7A6" : "#fff",
        borderRadius: 24,
        borderWidth: 2,
        borderColor: selected ? "#0B0A0F" : "transparent",
        padding: 16,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          borderWidth: selected ? 0 : 1.5,
          borderColor: "rgba(11,10,15,0.25)",
          backgroundColor: selected ? "#0B0A0F" : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && <Check size={15} color="#fff" strokeWidth={3} />}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <T variant="h3" onPastel>
            {title}
          </T>
          {!!badge && <Tag label={badge} tone="ink" />}
        </View>
        <T variant="caption" onPastel style={{ opacity: 0.7 }}>
          {note}
        </T>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        {!!oldPrice && (
          <T variant="caption" onPastel style={{ textDecorationLine: "line-through", opacity: 0.5 }}>
            {oldPrice}
          </T>
        )}
        <Text style={{ fontFamily: Fonts.display, fontSize: 20, color: "#0B0A0F" }}>{price}</Text>
        <T variant="caption" onPastel style={{ opacity: 0.6 }}>
          {per}
        </T>
      </View>
    </Tap>
  );
}

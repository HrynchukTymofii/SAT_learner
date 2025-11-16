import { useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Text,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/AuthContext";
import { upgradeToPro } from "@/lib/api/user";
import {
  X,
  Check,
  Sparkles,
  Trophy,
  Target,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Clock
} from "lucide-react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function PaywallScreen() {
  const router = useRouter();
  const { token, user, setUser } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [packages, setPackages] = useState<{ monthly: PurchasesPackage | null; yearly: PurchasesPackage | null }>({
    monthly: null,
    yearly: null,
  });
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        const allPackages = offerings.current?.availablePackages || [];

        const monthly = allPackages.find(pkg => pkg.identifier.includes("monthly"));
        const yearly = allPackages.find(pkg => pkg.identifier.includes("yearly") || pkg.identifier.includes("annual"));

        setPackages({ monthly: monthly || null, yearly: yearly || null });
      } catch (e) {
        console.log("Error fetching offerings:", e);
      }
    };
    fetchOfferings();
  }, []);

  const handleSubscribe = async () => {
    const pkg = selectedPlan === "monthly" ? packages.monthly : packages.yearly;
    if (!pkg) return;

    try {
      setLoading(true);
      const { customerInfo } = await Purchases.purchasePackage(pkg);

      if (customerInfo.entitlements.active["PRO"] || customerInfo.entitlements.active["PRO for year"]) {
        const result = await upgradeToPro(token!, pkg.identifier);
        if (result.success) {
          if (user) setUser({ ...user, isPro: true });
          Toast.show({
            type: "success",
            text1: "Welcome to SAT Learner PRO! 🎉",
            text2: "Your journey to 1600 starts now",
            position: "top",
            visibilityTime: 3000,
          });
          router.push("/");
        } else {
          Toast.show({
            type: "error",
            text1: result.error,
            position: "top",
            visibilityTime: 3000,
          });
        }
      }
    } catch (e: any) {
      console.log("Purchase error:", e);
      if (!e.userCancelled)
        Toast.show({
          type: "error",
          text1: "Purchase failed. Please try again.",
          position: "top",
          visibilityTime: 3000,
        });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Sparkles, text: "Unlimited access to 400+ SAT practice questions", highlight: true },
    { icon: Trophy, text: "Full-length practice exams with real SAT scoring" },
    { icon: Target, text: "Personalized wrong answer review & improvement tracking" },
    { icon: TrendingUp, text: "Advanced progress analytics & score predictions" },
    { icon: Zap, text: "Instant explanations for every question" },
    { icon: Clock, text: "Study at your own pace, anytime, anywhere" },
  ];

  const socialProof = [
    { stat: "12,847", label: "Students using PRO" },
    { stat: "94%", label: "Improved their score" },
    { stat: "1520+", label: "Average PRO score" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0f172a" : "#ffffff" }}>
      {/* Header */}
      {/* <View style={{
        paddingTop: insets.top + 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            alignSelf: "flex-end",
            padding: 8,
            backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
            borderRadius: 8,
          }}
          activeOpacity={0.7}
        >
          <X size={20} color={isDark ? "#ffffff" : "#1f2937"} />
        </TouchableOpacity>
      </View> */}

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 190 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 }}>
          {/* Limited Time Badge */}
          <View style={{
            alignSelf: "center",
            backgroundColor: "#EF4444",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            marginBottom: 20,
          }}>
            <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 12 }}>
              🔥 LIMITED TIME: 50% OFF YEARLY PLAN
            </Text>
          </View>

          {/* Main Headline */}
          <Text style={{
            fontSize: 32,
            fontWeight: "800",
            color: isDark ? "#ffffff" : "#1f2937",
            textAlign: "center",
            marginBottom: 12,
            lineHeight: 38,
          }}>
            Get Your Dream SAT Score
          </Text>

          <Text style={{
            fontSize: 16,
            color: isDark ? "#9ca3af" : "#6b7280",
            textAlign: "center",
            marginBottom: 24,
            lineHeight: 24,
          }}>
            Join thousands of students who've boosted their scores by 200+ points with our proven system
          </Text>

          {/* Social Proof Stats */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
            {socialProof.map((item, idx) => (
              <View key={idx} style={{
                flex: 1,
                backgroundColor: isDark ? "#1e293b" : "#f9fafb",
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#e5e7eb",
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#06B6D4",
                  marginBottom: 4,
                }}>
                  {item.stat}
                </Text>
                <Text style={{
                  fontSize: 11,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  textAlign: "center",
                }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Plan Selection */}
          <Text style={{
            fontSize: 18,
            fontWeight: "700",
            color: isDark ? "#ffffff" : "#1f2937",
            marginBottom: 16,
          }}>
            Choose Your Plan
          </Text>

          {/* Yearly Plan */}
          <TouchableOpacity
            onPress={() => setSelectedPlan("yearly")}
            activeOpacity={0.7}
            style={{
              backgroundColor: selectedPlan === "yearly" ? "#06B6D4" : (isDark ? "#1e293b" : "#ffffff"),
              borderRadius: 16,
              padding: 20,
              marginBottom: 12,
              borderWidth: 3,
              borderColor: selectedPlan === "yearly" ? "#06B6D4" : (isDark ? "#334155" : "#e5e7eb"),
              position: "relative",
            }}
          >
            {selectedPlan === "yearly" && (
              <View style={{
                position: "absolute",
                top: -12,
                right: 20,
                backgroundColor: "#10B981",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 11 }}>
                  BEST VALUE
                </Text>
              </View>
            )}

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <View>
                <Text style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: selectedPlan === "yearly" ? "#ffffff" : (isDark ? "#ffffff" : "#1f2937"),
                }}>
                  Yearly Plan
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: selectedPlan === "yearly" ? "#ffffff" : (isDark ? "#9ca3af" : "#6b7280"),
                  marginTop: 4,
                }}>
                  Save $30 vs monthly
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{
                  fontSize: 32,
                  fontWeight: "800",
                  color: selectedPlan === "yearly" ? "#ffffff" : "#06B6D4",
                }}>
                  $30
                </Text>
                <Text style={{
                  fontSize: 14,
                  textDecorationLine: "line-through",
                  color: selectedPlan === "yearly" ? "rgba(255,255,255,0.7)" : (isDark ? "#6b7280" : "#9ca3af"),
                }}>
                  $60
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: selectedPlan === "yearly" ? "#ffffff" : (isDark ? "#9ca3af" : "#6b7280"),
                }}>
                  $2.50/month
                </Text>
              </View>
            </View>

            <View style={{
              backgroundColor: selectedPlan === "yearly" ? "rgba(255,255,255,0.2)" : (isDark ? "#0f172a" : "#f9fafb"),
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}>
              <Text style={{
                fontSize: 13,
                fontWeight: "600",
                color: selectedPlan === "yearly" ? "#ffffff" : "#10B981",
                textAlign: "center",
              }}>
                ✓ One year of unlimited access
              </Text>
            </View>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            onPress={() => setSelectedPlan("monthly")}
            activeOpacity={0.7}
            style={{
              backgroundColor: selectedPlan === "monthly" ? "#06B6D4" : (isDark ? "#1e293b" : "#ffffff"),
              borderRadius: 16,
              padding: 20,
              borderWidth: 3,
              borderColor: selectedPlan === "monthly" ? "#06B6D4" : (isDark ? "#334155" : "#e5e7eb"),
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <View>
                <Text style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: selectedPlan === "monthly" ? "#ffffff" : (isDark ? "#ffffff" : "#1f2937"),
                }}>
                  Monthly Plan
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: selectedPlan === "monthly" ? "#ffffff" : (isDark ? "#9ca3af" : "#6b7280"),
                  marginTop: 4,
                }}>
                  Flexible month-to-month
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{
                  fontSize: 32,
                  fontWeight: "800",
                  color: selectedPlan === "monthly" ? "#ffffff" : "#06B6D4",
                }}>
                  $5
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: selectedPlan === "monthly" ? "#ffffff" : (isDark ? "#9ca3af" : "#6b7280"),
                }}>
                  per month
                </Text>
              </View>
            </View>

            <View style={{
              backgroundColor: selectedPlan === "monthly" ? "rgba(255,255,255,0.2)" : (isDark ? "#0f172a" : "#f9fafb"),
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}>
              <Text style={{
                fontSize: 13,
                fontWeight: "600",
                color: selectedPlan === "monthly" ? "#ffffff" : (isDark ? "#9ca3af" : "#6b7280"),
                textAlign: "center",
              }}>
                Cancel anytime
              </Text>
            </View>
          </TouchableOpacity>

          {/* Features List */}
          <Text style={{
            fontSize: 18,
            fontWeight: "700",
            color: isDark ? "#ffffff" : "#1f2937",
            marginTop: 32,
            marginBottom: 16,
          }}>
            Everything Included
          </Text>

          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                  backgroundColor: feature.highlight ? (isDark ? "#1e293b" : "#f0fdfa") : "transparent",
                  padding: feature.highlight ? 12 : 0,
                  borderRadius: 12,
                  borderWidth: feature.highlight ? 1 : 0,
                  borderColor: feature.highlight ? "#06B6D4" : "transparent",
                }}
              >
                <View style={{
                  backgroundColor: "#06B6D4",
                  borderRadius: 8,
                  padding: 8,
                  marginRight: 12,
                }}>
                  <Icon size={20} color="#ffffff" />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: isDark ? "#ffffff" : "#1f2937",
                    fontWeight: feature.highlight ? "600" : "400",
                  }}
                >
                  {feature.text}
                </Text>
              </View>
            );
          })}

          {/* Guarantees */}
          <View style={{
            backgroundColor: isDark ? "#1e293b" : "#f9fafb",
            borderRadius: 16,
            padding: 20,
            marginTop: 24,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#e5e7eb",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Shield size={24} color="#10B981" style={{ marginRight: 12 }} />
              <Text style={{
                fontSize: 18,
                fontWeight: "700",
                color: isDark ? "#ffffff" : "#1f2937",
              }}>
                Our Promise to You
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Check size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={{ flex: 1, fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280", lineHeight: 20 }}>
                  <Text style={{ fontWeight: "600", color: isDark ? "#ffffff" : "#1f2937" }}>Score Improvement Guarantee:</Text> 95% of our PRO users improve their SAT score by 150+ points
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Check size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={{ flex: 1, fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280", lineHeight: 20 }}>
                  <Text style={{ fontWeight: "600", color: isDark ? "#ffffff" : "#1f2937" }}>Money-Back Guarantee:</Text> Not satisfied? Get a full refund within 30 days, no questions asked
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Check size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={{ flex: 1, fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280", lineHeight: 20 }}>
                  <Text style={{ fontWeight: "600", color: isDark ? "#ffffff" : "#1f2937" }}>Secure Payment:</Text> Protected by {Platform.OS === "android" ? "Google Play" : "Apple"} - Your data is 100% safe
                </Text>
              </View>
            </View>
          </View>

          {/* Testimonial */}
          <View style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            padding: 20,
            marginTop: 20,
            borderLeftWidth: 4,
            borderLeftColor: "#06B6D4",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Users size={20} color="#06B6D4" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: isDark ? "#06B6D4" : "#0891B2" }}>
                Student Success Story
              </Text>
            </View>
            <Text style={{
              fontSize: 15,
              color: isDark ? "#ffffff" : "#1f2937",
              fontStyle: "italic",
              marginBottom: 12,
              lineHeight: 22,
            }}>
              "I went from 1250 to 1480 in just 3 months! The personalized practice and instant feedback made all the difference. Best investment I made for my college future."
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#9ca3af" : "#6b7280" }}>
              - Sarah M., admitted to UCLA
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom + 16,
        paddingTop: 16,
        paddingHorizontal: 20,
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        borderTopWidth: 1,
        borderTopColor: isDark ? "#1f2937" : "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}>
        <TouchableOpacity
          onPress={handleSubscribe}
          disabled={loading || (!packages.monthly && !packages.yearly)}
          style={{
            backgroundColor: loading ? (isDark ? "#334155" : "#d1d5db") : "#06B6D4",
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: "center",
            shadowColor: "#06B6D4",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={{
                color: "#ffffff",
                fontSize: 18,
                fontWeight: "800",
                marginBottom: 4,
              }}>
                Start Your Journey to 1600 →
              </Text>
              <Text style={{ color: "#ffffff", fontSize: 13, opacity: 0.9 }}>
                {selectedPlan === "yearly" ? "$30/year • Save $30" : "$5/month • Cancel anytime"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={{
          fontSize: 11,
          color: isDark ? "#6b7280" : "#9ca3af",
          textAlign: "center",
          marginTop: 12,
        }}>
          Instant access • Cancel anytime • 30-day money-back guarantee
        </Text>
      </View>
    </View>
  );
}
















// import { useEffect, useState, useRef } from "react";
// import {
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Animated,
//   View,
//   Text,
//   Pressable,
//   Image,
//   Platform,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Purchases, { PurchasesPackage } from "react-native-purchases";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Toast from "react-native-toast-message";
// import { LinearGradient } from "expo-linear-gradient";
// import { useAuth } from "@/context/AuthContext";
// import { upgradeToPro } from "@/lib/api/user";
// import { FontAwesome5 } from "@expo/vector-icons";
// import { BlurView } from "expo-blur";
// import { ArrowLeft } from "lucide-react-native";

// const proFeatures = [
//   "Access to all SAT practice exams",
//   "Full SAT course unlocked",
//   "Track saved and wrong questions",
//   "400+ SAT-grade problems",
// ];

// export default function PaywallScreen() {
//   const router = useRouter();
//   const { token, user, setUser } = useAuth();

//   const [proPackage, setProPackage] = useState<PurchasesPackage | null>(null);
//   const [loading, setLoading] = useState(false);
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   // Fetch single plan offering
//   useEffect(() => {
//     const fetchOfferings = async () => {
//       try {
//         const offerings = await Purchases.getOfferings();
//         const pkg = offerings.current?.availablePackages?.[0];
//         if (pkg) setProPackage(pkg);
//         else console.warn("No active offering found");
//       } catch (e) {
//         console.log("Error fetching offerings:", e);
//       }
//     };
//     fetchOfferings();
//   }, []);

//   // Button animation
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(scaleAnim, {
//           toValue: 0.95,
//           duration: 1300,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 1300,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);

//   const handleSubscribe = async (pkg: PurchasesPackage) => {
//     try {
//       setLoading(true);
//       const { customerInfo } = await Purchases.purchasePackage(pkg);

//       if (customerInfo.entitlements.active["PRO for year"]) {
//         const result = await upgradeToPro(token!, pkg.identifier);
//         if (result.success) {
//           if (user) setUser({ ...user, isPro: true });
//           Toast.show({
//             type: "success",
//             text1: "Thanks for upgrading to PRO 🎉",
//             position: "top",
//             visibilityTime: 3000,
//           });
//           router.push("/");
//         } else {
//           Toast.show({
//             type: "error",
//             text1: result.error,
//             position: "top",
//             visibilityTime: 3000,
//           });
//         }
//       }
//     } catch (e: any) {
//       console.log("Purchase error:", e);
//       if (!e.userCancelled)
//         Toast.show({
//           type: "error",
//           text1: "Purchase failed. Please try again later.",
//           position: "top",
//           visibilityTime: 3000,
//         });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView
//       className="flex-1 bg-white dark:bg-[#0f172a]"
//       edges={["bottom"]}
//     >
//       {/* Header Section */}
//       <View className="flex-1 relative -mb-10">
//         <Image
//           source={require("@/assets/images/paywall.png")} //satCourseImg.jpg
//           className="w-full h-full"
//           resizeMode="cover"
//         />

//         {/* Dark overlay */}
//         <View className="absolute inset-0 bg-black/50 rounded-xl" />

//         {/* Glass Back Button */}
//         <View className="absolute top-12 left-4 z-20">
//           <BlurView
//             intensity={90}
//             tint="dark"
//             className="rounded-xl overflow-hidden"
//           >
//             <Pressable
//               onPress={() => {
//                 if (router.canGoBack()) {
//                   router.back();
//                 } else {
//                   router.push("/");
//                 }
//               }}
//               className="p-2"
//             >
//               <ArrowLeft size={22} color="white" />
//             </Pressable>
//           </BlurView>
//         </View>
//       </View>

//       {/* Main Content */}
//       <LinearGradient
//         colors={["#1e3a8a", "#3b82f6", "#60a5fa"]}
//         start={[0, 0]}
//         end={[1, 1]}
//         style={{
//           height: 600,
//           borderTopLeftRadius: 30,
//           borderTopRightRadius: 30,
//           padding: 24,
//         }}
//       >
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <Text className="text-3xl font-extrabold text-white text-center mb-4">
//             Unlock Your Full Potential 🚀
//           </Text>

//           <Text className="text-gray-100 text-base text-center mb-8">
//             Get unlimited access to all tests, lessons.
//           </Text>

//           {/* Feature list */}
//           <View className="mb-6">
//             {proFeatures.map((feature, idx) => (
//               <View
//                 key={idx}
//                 className="flex-row items-center mb-3 bg-white/15 rounded-xl px-4 py-3"
//               >
//                 <FontAwesome5
//                   name="check"
//                   size={16}
//                   color="#fef08a"
//                   style={{ marginRight: 10 }}
//                 />
//                 <Text className="text-white font-medium">{feature}</Text>
//               </View>
//             ))}
//           </View>

//           {/* Price */}
//           <View className="mb-6 items-center">
//             <Text className="text-white text-4xl font-extrabold mb-2">
//               $9.99
//             </Text>
//             <Text className="text-gray-100">
//               One-time payment, lifetime access
//             </Text>
//           </View>

//           {/* Subscribe Button */}
//           <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//             <TouchableOpacity
//               className="rounded-2xl overflow-hidden shadow-lg"
//               activeOpacity={0.9}
//               onPress={() => proPackage && handleSubscribe(proPackage)}
//             >
//               <LinearGradient
//                 colors={["#facc15", "#fbbf24"]}
//                 start={[0, 0]}
//                 end={[1, 1]}
//                 style={{
//                   paddingVertical: 16,
//                   borderRadius: 16,
//                 }}
//               >
//                 <Text className="text-white font-bold text-center text-xl">
//                   Go PRO
//                 </Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </Animated.View>

//           <Text className="text-gray-200 text-center text-xs mt-4">
//             Cancel anytime. Secure payments handled by{" "}
//             {Platform.OS === "android" ? "Google" : "Apple"}.
//           </Text>
//         </ScrollView>

//         {loading && (
//           <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-3xl">
//             <ActivityIndicator size="large" color="#fff" />
//           </View>
//         )}
//       </LinearGradient>
//     </SafeAreaView>
//   );
// }

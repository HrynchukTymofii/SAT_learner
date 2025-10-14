import { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  View,
  Text,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthContext";
import { upgradeToPro } from "@/lib/api/user";
import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { ArrowLeft } from "lucide-react-native";

const proFeatures = [
  "Access to all SAT practice exams",
  "Full SAT course unlocked",
  "Track saved and wrong questions",
  "Official-style test simulations",
  "Offline study support",
];

export default function PaywallScreen() {
  const router = useRouter();
  const { token, user, setUser } = useAuth();

  const [proPackage, setProPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Fetch single plan offering
  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        const pkg = offerings.current?.availablePackages?.[0];
        if (pkg) setProPackage(pkg);
        else console.warn("No active offering found");
      } catch (e) {
        console.log("Error fetching offerings:", e);
      }
    };
    fetchOfferings();
  }, []);

  // Button animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSubscribe = async (pkg: PurchasesPackage) => {
    try {
      setLoading(true);
      const { customerInfo } = await Purchases.purchasePackage(pkg);

      if (customerInfo.entitlements.active["pro_access"]) {
        const result = await upgradeToPro(token!, pkg.identifier);
        if (result.success) {
          if (user) setUser({ ...user, isPro: true });
          Toast.show({
            type: "success",
            text1: "Thanks for upgrading to PRO 🎉",
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
          text1: "Purchase failed. Please try again later.",
          position: "top",
          visibilityTime: 3000,
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0f172a]" edges={["bottom"]}>
      {/* Header Section */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.push("/");
          }}
          className="p-2 rounded-xl bg-gray-200/30 dark:bg-white/10"
        >
          <ArrowLeft size={22} color="#0f172a" />
        </Pressable>

        <Text className="text-xl font-bold text-gray-800 dark:text-white">
          Upgrade to PRO
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Content */}
      <LinearGradient
        colors={["#10B981", "#14B8A6"]}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          flex: 1,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          padding: 24,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-3xl font-extrabold text-white text-center mb-4">
            Unlock Your Full Potential 🚀
          </Text>

          <Text className="text-gray-100 text-base text-center mb-8">
            Get unlimited access to all tests, lessons, and performance insights.
          </Text>

          {/* Feature list */}
          <View className="mb-6">
            {proFeatures.map((feature, idx) => (
              <View
                key={idx}
                className="flex-row items-center mb-3 bg-white/15 rounded-xl px-4 py-3"
              >
                <FontAwesome5
                  name="check"
                  size={16}
                  color="#fef08a"
                  style={{ marginRight: 10 }}
                />
                <Text className="text-white font-medium">{feature}</Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <View className="mb-6 items-center">
            <Text className="text-white text-4xl font-extrabold mb-2">
              $9.99
            </Text>
            <Text className="text-gray-100">One-time payment, lifetime access</Text>
          </View>

          {/* Subscribe Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              className="rounded-2xl overflow-hidden shadow-lg"
              activeOpacity={0.9}
              onPress={() => proPackage && handleSubscribe(proPackage)}
            >
              <LinearGradient
                colors={["#facc15", "#fbbf24"]}
                start={[0, 0]}
                end={[1, 1]}
                className="py-4 rounded-2xl"
              >
                <Text className="text-white font-bold text-center text-xl">
                  Go PRO
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Text className="text-gray-200 text-center text-xs mt-4">
            Cancel anytime. Secure payments handled by Apple / Google.
          </Text>
        </ScrollView>

        {loading && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-3xl">
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}


// import { useEffect, useState, useRef } from "react";
// import { ScrollView, TouchableOpacity, ActivityIndicator, Animated, View, Text, Image, Pressable } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import Purchases, { PurchasesPackage } from "react-native-purchases";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Toast from "react-native-toast-message";
// import { LinearGradient } from "expo-linear-gradient";
// import { useAuth } from "@/context/AuthContext";
// import { upgradeToPro } from "@/lib/api/user";
// import { FontAwesome5 } from "@expo/vector-icons";
// import { BlurView } from "expo-blur";
// import { ArrowLeft } from "lucide-react-native";

// const proFeatures: Record<string, string[]> = {
//   month: [
//     "Повний доступ на місяць",
//     "85% складають іспит з першого разу",
//     "Всі офіційні тести",
//     "Курс для сомопідготовки іспиту з теорії",
//     "Збережені та питання з помилками",
//   ],
//   forever:[
//     "Повний доступ назавжди",
//     "90% складають іспит з першого разу",
//     "Всі офіційні тести",
//     "Курс для сомопідготовки іспиту з теорії",
//     "Збережені та питання з помилками",
//   ],
// };

// const basePrices: Record<string, number> = {
//   month: 199,
//   forever: 399,
// };

// export default function PaywallScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams<{ plan?: string }>();
//   const preferredPlan = params.plan?.toLowerCase();
//   const { token, user, setUser } = useAuth();

//   const [preferredPackage, setPreferredPackage] =
//     useState<PurchasesPackage | null>(null);
//   const [loading, setLoading] = useState(false);
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     const fetchOfferings = async () => {
//       try {
//         const offerings = await Purchases.getOfferings();

//         let match: PurchasesPackage | undefined;
//         if (preferredPlan === "forever") {
//           match = offerings.all?.Forever?.availablePackages?.[0];
//         } else if (preferredPlan === "month" || preferredPlan === "monthly") {
//           match = offerings.all?.Monthly?.availablePackages?.[0];
//         }

//         if (match) setPreferredPackage(match);
//         else console.warn("Preferred plan not found:", preferredPlan);
//       } catch (e) {
//         console.log("Error fetching offerings:", e);
//       }
//     };

//     fetchOfferings();
//   }, [preferredPlan]);

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(scaleAnim, {
//           toValue: 1.05,
//           duration: 1400,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 1400,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);

//   const handleSubscribe = async (pkg: PurchasesPackage) => {
//     try {
//       setLoading(true);
//       const { customerInfo } = await Purchases.purchasePackage(pkg);

//       if (
//         customerInfo.entitlements.active["PRO forever"] ||
//         customerInfo.entitlements.active["PRO for month"]
//       ) {
//         const result = await upgradeToPro(token!, pkg.identifier);
//         if (result.success) {
//           if (user) setUser({ ...user, isPro: true });
//           Toast.show({
//             type: "success",
//             text1: "Дякуємо! Ви стали PRO користувачем 🎉",
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
//           text1: "Не вдалося здійснити покупку. Спробуйте пізніше.",
//           position: "top",
//           visibilityTime: 3000,
//         });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getPriceWithTax = (plan: "month" | "forever") => {
//     const base = basePrices[plan];
//     return `${base}₴ + ПДВ = ${preferredPackage?.product.priceString}`;
//   };

//   const getDurationText = (plan: "month" | "forever") => {
//     if (plan === "month") {
//       const expiry = new Date();
//       expiry.setMonth(expiry.getMonth() + 1);
//       return `Доступ до ${expiry.toLocaleDateString("uk-UA")}`;
//     }
//     return "Доступ назавжди";
//   };

//   const planFeatures =
//     proFeatures[preferredPlan === "forever" ? "forever" : "month"];

//   return (
//     <SafeAreaView className="flex-1" edges={["bottom"]}>
//       {/* Top Image */}
//       <View className="flex-1 relative -mb-10">
//         {/* <Image
//           source={require("@/assets/images/payment-banner.webp")}
//           className="w-full h-full"
//           resizeMode="cover"
//         /> */}

//         {/* Dark overlay */}
//         <View className="absolute inset-0 bg-black/50 rounded-xl" />

//         {/* Glass Back Button */}
//         <View className="absolute top-12 left-4 z-20">
//           <BlurView intensity={90} tint="dark" className="rounded-xl overflow-hidden">
//             <Pressable
//               onPress={() => {
//                 if (router.canGoBack()) {
//                   router.back();
//                 } else {
//                   router.push("/");
//                 }}}
//               className="p-2"
//             >
//               <ArrowLeft size={22} color="white" />
//             </Pressable>
//           </BlurView>
//         </View>
//       </View>

//       {/* Bottom Gradient Panel */}
//       <LinearGradient
//         colors={["#10B981", "#14B8A6"]} // vibrant green → teal
//         style={{
//           height: 560,
//           shadowColor: "#000",
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.25,
//           shadowRadius: 4,
//           elevation: 5, // Android shadow
//           borderTopLeftRadius: 30,
//           borderTopRightRadius: 30,
//           overflow: "hidden",
//           padding: 24,
//         }}
//       >
//         <Text className="text-3xl font-bold text-center text-white mb-6">
//           🔥 Оновлення до PRO
//         </Text>

//         {preferredPackage && (
//           <View>
//             {/* Features */}
//             <View className="mb-4">
//               {planFeatures.map((feature, idx) => (
//                 <View
//                   key={idx}
//                   className="flex-row items-center mb-2 bg-green-100 dark:bg-stone-700 rounded-md px-4 py-3 shadow-sm"
//                 >
//                   <FontAwesome5
//                     name="check"
//                     size={16}
//                     color="#059669" // darker green checkmark
//                     style={{ marginRight: 10 }}
//                   />
//                   <Text className="text-gray-900 dark:text-gray-200 font-medium">
//                     {feature}
//                   </Text>
//                 </View>
//               ))}
//             </View>

//             {/* Duration & Price */}
//             <View className="mb-6">
//               <Text className="text-white text-lg mb-1">
//                 {getDurationText(
//                   preferredPlan === "forever" ? "forever" : "month"
//                 )}
//               </Text>
//               <Text className="text-white text-2xl font-bold mb-1">
//                 {getPriceWithTax(
//                   preferredPlan === "forever" ? "forever" : "month"
//                 )}
//               </Text>
//               <Text className="text-gray-200 text-sm">
//                 Ви отримаєте повний доступ до всіх матеріалів.
//               </Text>
//             </View>

//             {/* Subscribe Button */}
//             <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//               <TouchableOpacity
//                 className="bg-white/30 py-4 rounded-2xl items-center"
//                 onPress={() => handleSubscribe(preferredPackage)}
//               >
//                 <Text className="text-white font-bold text-2xl">
//                   Купити зараз
//                 </Text>
//               </TouchableOpacity>
//             </Animated.View>
//           </View>
//         )}

//         {/* Loading Overlay */}
//         {loading && (
//           <View className="absolute inset-0 bg-black/50 items-center justify-center">
//             <ActivityIndicator size="large" color="#fff" />
//           </View>
//         )}
//       </LinearGradient>
//     </SafeAreaView>
//   );
// }
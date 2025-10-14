import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  User,
  Key,
  Sun,
  Moon,
  LucideIcon,
  ArrowLeft,
} from "lucide-react-native";
import TopBlur from "@/components/ui/TobBlur";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { updateUser, deleteUserAccount } from "@/lib/api/user";
import Toast from "react-native-toast-message";
import { Button } from "@/~/components/ui/button";
import { useSearchParams } from "expo-router/build/hooks";
import { LinearGradient } from "expo-linear-gradient";

export default function SettingsScreen() {
  const params = useSearchParams();
  const paramName = params.get("name") || undefined;
  const router = useRouter();
  const { token, setToken, user, setUser } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [password, setPassword] = useState("");
  const { colorScheme, setColorScheme } = useColorScheme() as {
    colorScheme: "light" | "dark";
    setColorScheme: (color: "light" | "dark" | null) => void;
  };
  const [preferredScheme, setPreferredScheme] = useState<
    "light" | "dark" | "system"
  >("system");

  useEffect(() => {
    if (preferredScheme === "system") setColorScheme(null);
    else setColorScheme(preferredScheme);
  }, [preferredScheme]);

  const themeOptions: {
    label: string;
    value: "light" | "dark" | "system";
    icon: LucideIcon;
  }[] = [
    { label: "System Default", value: "system", icon: Sun },
    { label: "Light", value: "light", icon: Sun },
    { label: "Dark", value: "dark", icon: Moon },
  ];

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    router.replace("/");
    Toast.show({
      type: "success",
      text1: "Account deleted",
      position: "top",
      visibilityTime: 700,
    });
  };

  const handleSave = async () => {
    if (!token) return alert("User not authorized");
    const result = await updateUser(token, { password });
    if (result.success) {
      if (user) setUser({ ...user });
      router.back();
      Toast.show({
        type: "success",
        text1: "Profile updated",
        position: "top",
        visibilityTime: 700,
      });
    } else alert(result.error);
  };

  const inputBg = colorScheme === "dark" ? "#1e293b" : "#f1f5f9";
  const inputText = colorScheme === "dark" ? "#f1f5f9" : "#1f2937";
  const placeholderText = colorScheme === "dark" ? "#9ca3af" : "#6b7280";
  const sectionTitle = colorScheme === "dark" ? "#f1f5f9" : "#1f2937";

  return (
    <SafeAreaView className="flex-1 p-4 pt-0 bg-[#f8fafc] dark:bg-[#0f172a] gap-y-4">
      {colorScheme !== "dark" && <TopBlur />}
      <LinearGradient
        colors={["#3b82f6", "#2563eb"]}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
          alignSelf: "flex-start",
          marginLeft: 8,
          marginTop: 12
        }}
      >
       
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
         
          <ArrowLeft size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
           
            Back
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={{  marginHorizontal: 8 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: colorScheme === "dark" ? "#60a5fa" : "#2563eb",
          }}
        >
          Settings
        </Text>
      </View>

      {/* Password Section */}
      <View>
        <View className="flex-row items-center mb-2">
          <Key size={20} color={sectionTitle} />
          <Text
            className="text-lg font-semibold ml-2"
            style={{ color: sectionTitle }}
          >
            Change Password
          </Text>
        </View>
        <TextInput
          className="rounded-xl px-3 py-2 text-base"
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
          secureTextEntry
          style={{
            backgroundColor: inputBg,
            color: inputText,
            borderColor: colorScheme === "dark" ? "#334155" : "#e2e8f0",
            borderWidth: 1,
          }}
          placeholderTextColor={placeholderText}
        />
      </View>

      {/* Theme Section */}
      <View className="mb-2">
        <View className="flex-row items-center mb-2">
          <Sun size={20} color={sectionTitle} />
          <Text
            className="text-lg font-semibold ml-2"
            style={{ color: sectionTitle }}
          >
            App Theme
          </Text>
        </View>
        <View
          style={{ backgroundColor: inputBg, padding: 16, borderRadius: 24 }}
        >
          {themeOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setPreferredScheme(option.value)}
              className="flex-row items-center gap-x-3 py-2"
            >
              <View
                className={`w-5 h-5 rounded-full border items-center justify-center`}
                style={{
                  borderColor:
                    preferredScheme === option.value ? "#3b82f6" : "#9ca3af",
                }}
              >
                {preferredScheme === option.value && (
                  <View
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "#3b82f6" }}
                  />
                )}
              </View>
              <Text style={{ color: sectionTitle, fontSize: 16 }}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Save Changes Button */}
      <LinearGradient
        colors={["#3b82f6", "#2563eb"]} // Gradient colors like ModeCard
        start={[0, 0]}
        end={[1, 1]}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
          marginBottom: 16,
          alignSelf: "stretch", // Full width
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
          }}
          activeOpacity={0.9}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <View className="flex-1" />

      {/* Danger Zone */}
      <View className="border-t border-gray-300 dark:border-gray-700 pt-6">
        <Text className="text-lg font-semibold text-red-600 mb-3">
          Danger Zone
        </Text>
        <Pressable
          onPress={() => setShowDeleteModal(true)}
          className="border border-red-600 dark:bg-slate-800 rounded-xl py-3 px-4 items-center"
        >
          <Text className="text-red-600 font-semibold">Delete Account</Text>
        </Pressable>
      </View>

      {/* Delete Modal */}
      <Modal visible={showDeleteModal} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View
            className="rounded-2xl p-6 w-full max-w-md"
            style={{ backgroundColor: inputBg }}
          >
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: "#ef4444" }}
            >
              Confirm Deletion
            </Text>
            <Text className="text-base mb-3" style={{ color: sectionTitle }}>
              This action is irreversible. To confirm, type{" "}
              <Text className="font-bold">Delete</Text> below:
            </Text>

            <TextInput
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="Type Delete"
              className="rounded-xl px-3 py-2 text-base border mb-4"
              style={{
                backgroundColor: inputBg,
                color: inputText,
                borderColor: colorScheme === "dark" ? "#334155" : "#e2e8f0",
              }}
              placeholderTextColor={placeholderText}
            />

            <View className="flex-row justify-between mt-2">
              <Pressable
                onPress={() => {
                  setShowDeleteModal(false);
                  setConfirmText("");
                }}
                className="px-4 py-2 rounded-xl"
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#334155" : "#d1d5db",
                }}
              >
                <Text style={{ color: sectionTitle }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  if (confirmText !== "Delete") {
                    Alert.alert("Error", "Type 'Delete' to confirm.");
                    return;
                  }
                  if (!token) return alert("User not authorized");

                  setIsDeleting(true);
                  const result = await deleteUserAccount(token);
                  setIsDeleting(false);

                  if (result.success) {
                    setShowDeleteModal(false);
                    handleLogout();
                  } else {
                    alert(result.error || "Failed to delete account");
                  }
                }}
                className="px-4 py-2 rounded-xl"
                style={{ backgroundColor: "#ef4444" }}
              >
                <Text className="text-white">
                  {isDeleting ? "Deleting..." : "Confirm"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// import { View, Text, TextInput, Pressable, Alert, Modal, ScrollView, Animated } from "react-native";
// import { useColorScheme } from "nativewind";
// import { useState, useEffect } from "react";
// import { Button } from "@/~/components/ui/button";
// import TopBlur from "@/components/ui/TobBlur";
// import { useRouter, useSearchParams } from "expo-router/build/hooks";
// import { ChevronLeft, Key, Sun, User } from "lucide-react-native";
// import { useAuth } from "@/context/AuthContext";
// import { updateUser } from "@/lib/api/user";
// import { deleteUserAccount } from "@/lib/api/user";
// import Toast from "react-native-toast-message";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { LinearGradient } from "expo-linear-gradient";

// export default function SettingsScreen() {
//   const params = useSearchParams();
//   const paramName = params.get("name") || undefined;
//   const router = useRouter();
//   const { token, setToken, user, setUser } = useAuth();
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [confirmText, setConfirmText] = useState("");
//   const [isDeleting, setIsDeleting] = useState(false);

//   const [name, setName] = useState(paramName || "Ім’я користувача");

//   // If you want to update state when param changes (optional)
//   useEffect(() => {
//     if (paramName) setName(paramName);
//   }, [paramName]);

//   const [password, setPassword] = useState("");

//   const { colorScheme, setColorScheme } = useColorScheme() as {
//     colorScheme: "light" | "dark";
//     setColorScheme: (color: "light" | "dark" | null) => void;
//   };

//   const [preferredScheme, setPreferredScheme] = useState<"light" | "dark" | "system">("system");

//   useEffect(() => {
//     if (preferredScheme === "system") {
//       setColorScheme(null);
//     } else {
//       setColorScheme(preferredScheme);
//     }
//   }, [preferredScheme]);

//   const themeOptions: { label: string; value: "light" | "dark" | "system" }[] = [
//     { label: "За замовчуванням", value: "system" },
//     { label: "Світла", value: "light" },
//     { label: "Темна", value: "dark" },
//   ];

//   const handleLogout = () => {
//       setToken(null);
//       setUser(null)
//       router.replace("/");
//       Toast.show({
//         type: "success",
//         text1: "Aкаунт видалено",
//         position: "top",
//         visibilityTime: 700
//       });
//     };

//   const handleSave = async () => {
//     if (!token) return alert("Користувач не авторизований");

//     const result = await updateUser(token, { name, password });

//     if (result.success) {
//       //alert("Профіль оновлено успішно");
//       if (user) setUser({...user, name});
//       router.back();
//     } else {
//       alert(result.error);
//     }
//   };

//   const GradientCard = ({ children, icon, title, colors }: any) => {
//     const [scale] = useState(new Animated.Value(1));
//     const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
//     const handlePressOut = () => Animated.spring(scale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();

//     return (
//       <Animated.View style={{ transform: [{ scale }], marginVertical: 6 }}>
//         <LinearGradient
//           colors={colors}
//           start={[0, 0]}
//           end={[1, 1]}
//           style={{ borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 }}
//         >
//           <View className="flex-row items-center mb-3">
//             {icon && <View className="mr-2">{icon}</View>}
//             <Text className="text-white font-extrabold text-lg">{title}</Text>
//           </View>
//           {children}
//         </LinearGradient>
//       </Animated.View>
//     );
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-[#f8fafc] dark:bg-[#0f172a]">
//       <TopBlur />
//       <View className="flex-row items-center px-4 mt-4 mb-2">
//         <Pressable onPress={() => router.back()} className="mr-3 p-1">
//           <ChevronLeft size={28} color={colorScheme === "dark" ? "white" : "black"} />
//         </Pressable>
//         <Text className="text-2xl font-bold dark:text-white">Profile Settings</Text>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 200 }}>
//         {/* Change Name */}
//         <GradientCard
//           title="Change Name"
//           icon={<User size={24} color="#fff" />}
//           colors={["#3b82f6", "#2563eb"]}
//         >
//           <TextInput
//             value={name}
//             onChangeText={setName}
//             placeholder="Your name"
//             placeholderTextColor={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
//             className="bg-white/20 rounded-xl px-3 py-2 text-white mb-4"
//           />
//         </GradientCard>

//         {/* Change Password */}
//         <GradientCard
//           title="Change Password"
//           icon={<Key size={24} color="#fff" />}
//           colors={["#16a34a", "#15803d"]}
//         >
//           <TextInput
//             value={password}
//             onChangeText={setPassword}
//             placeholder="New password"
//             secureTextEntry
//             placeholderTextColor={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
//             className="bg-white/20 rounded-xl px-3 py-2 text-white mb-4"
//           />
//           <Pressable onPress={handleSave} className="bg-white/90 py-2 rounded-xl">
//             <Text className="text-black text-center font-semibold">Save Changes</Text>
//           </Pressable>
//         </GradientCard>

//         {/* Theme Selection */}
//         <GradientCard
//           title="App Theme"
//           icon={<Sun size={24} color="#fff" />}
//           colors={["#f59e0b", "#d97706"]}
//         >
//           {themeOptions.map((option) => (
//             <Pressable key={option.value} onPress={() => setPreferredScheme(option.value)} className="flex-row items-center gap-x-3 py-2">
//               <View className={`w-5 h-5 rounded-full border ${preferredScheme === option.value ? "border-white" : "border-gray-400"} items-center justify-center`}>
//                 {preferredScheme === option.value && <View className="w-2.5 h-2.5 bg-white rounded-full" />}
//               </View>
//               <Text className="text-white text-base">{option.label}</Text>
//             </Pressable>
//           ))}
//         </GradientCard>

//         {/* Danger Zone */}
//         <GradientCard
//           title="Danger Zone"
//           icon={<Key size={24} color="#fff" />}
//           colors={["#dc2626", "#b91c1c"]}
//         >
//           <Pressable onPress={() => setShowDeleteModal(true)} className="bg-white/90 py-2 rounded-xl">
//             <Text className="text-red-600 text-center font-semibold">Delete Account</Text>
//           </Pressable>
//         </GradientCard>
//       </ScrollView>

//       {/* Delete Modal */}
//       <Modal visible={showDeleteModal} animationType="slide" transparent>
//         <View className="flex-1 justify-center items-center bg-black/50 px-6">
//           <View className="bg-white dark:bg-stone-900 rounded-2xl p-6 w-full max-w-md">
//             <Text className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</Text>
//             <Text className="text-base text-gray-800 dark:text-gray-100 mb-3">
//               This action is irreversible. To confirm, type <Text className="font-bold">Delete</Text> below:
//             </Text>

//             <TextInput
//               value={confirmText}
//               onChangeText={setConfirmText}
//               placeholder="Type Delete"
//               className="bg-white dark:bg-stone-800 rounded-xl px-3 py-2 text-base border mb-4 dark:text-white"
//               placeholderTextColor={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
//             />

//             <View className="flex-row justify-between mt-2">
//               <Pressable
//                 onPress={() => { setShowDeleteModal(false); setConfirmText(""); }}
//                 className="px-4 py-2 bg-gray-300 dark:bg-stone-700 rounded-xl"
//               >
//                 <Text className="text-black dark:text-white">Cancel</Text>
//               </Pressable>

//               <Pressable
//                 onPress={async () => {
//                   if (confirmText !== "Delete") { Alert.alert("Error", "Type 'Delete' to confirm."); return; }
//                   if (!token) return alert("User not authorized");

//                   setIsDeleting(true);
//                   const result = await deleteUserAccount(token);
//                   setIsDeleting(false);

//                   if (result.success) { setShowDeleteModal(false); handleLogout(); }
//                   else { alert(result.error || "Failed to delete account"); }
//                 }}
//                 className={`px-4 py-2 rounded-xl bg-red-600`}
//               >
//                 <Text className="text-white">{isDeleting ? "Deleting..." : "Confirm"}</Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

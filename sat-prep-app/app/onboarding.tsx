import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";

type OnboardingStep = {
  type: "welcome" | "text" | "avatar" | "select" | "loginRedirect";
  title: string;
  description?: string;
  key: string; 
  placeholder?: string;
  options?: string[];
};

// Define questions
const onboardingQuestions: OnboardingStep[] = [
  { type: "welcome", title: "Welcome to SAT Prep", description: "Enhance your journey by answering a few questions.", key: "welcome" },
  { type: "text", title: "What's your name?", placeholder: "Enter your name", key: "name" },
  { type: "avatar", title: "Pick an avatar", key: "avatar" },
  { type: "select", title: "Have you tried SAT before?", options: ["Never", "Once", "Multiple times"], key: "satExperience" },
  { type: "select", title: "Most difficult part for you?", options: ["Math", "Reading", "Writing", "Time management"], key: "difficulty" },
  { type: "text", title: "What is your passion?", placeholder: "Your passion", key: "passion" },
  { type: "loginRedirect", title: "All set!", description: "Next step: login to your account", key: "gotoLogin" },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  // Animate step transitions
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  // Check if onboarding was already completed
  useEffect(() => {
    const checkOnboarding = async () => {
      const done = await SecureStore.getItemAsync("onboardingCompleted");
      if (done) router.replace("/login");
    };
    checkOnboarding();
  }, []);

  const step = onboardingQuestions[currentStep];
  const totalSteps = onboardingQuestions.length;

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      fadeAnim.setValue(0); // reset animation
    } else {
      await SecureStore.setItemAsync("onboardingCompleted", "true");
      // Optionally save answers to backend here
      router.replace("/login");
    }
  };

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  // Progress percentage
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient
        colors={["#7C3AED", "#EC4899", "#FBBF24"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      <View className="flex-1 justify-center items-center p-6">
        {/* Progress Bar */}
        <View className="w-full h-2 bg-gray-300 rounded-full mb-6">
          <View style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: "#FBBF24", borderRadius: 4 }} />
        </View>

        {/* Animated Step */}
        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          <Text className="text-2xl font-bold text-center mb-4 text-white">{step.title}</Text>
          {step.description && <Text className="text-center text-white mb-6">{step.description}</Text>}

          {/* Text Input */}
          {step.type === "text" && step.key && (
            <TextInput
              className="w-full p-4 border border-gray-300 rounded-lg mb-6 bg-white text-black"
              placeholder={step.placeholder}
              value={answers[step.key] || ""}
              onChangeText={(text) => handleAnswer(step.key!, text)}
            />
          )}

          {/* Select Options */}
          {step.type === "select" && step.key && step.options?.map((opt) => (
            <TouchableOpacity
              key={opt}
              className={`w-full p-4 mb-3 rounded-lg border ${answers[step.key] === opt ? "border-blue-600 bg-blue-100" : "border-gray-300"}`}
              onPress={() => handleAnswer(step.key!, opt)}
            >
              <Text className="text-gray-800">{opt}</Text>
            </TouchableOpacity>
          ))}

          {/* Avatar Step */}
          {step.type === "avatar" && step.key && (
            <View className="flex-row justify-around mb-6">
              {["👩‍🎓","🧑‍🎓","🧑‍💻"].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  className={`p-4 border rounded-full ${answers[step.key] === emoji ? "border-yellow-400" : "border-gray-300"}`}
                  onPress={() => handleAnswer(step.key!, emoji)}
                >
                  <Text style={{ fontSize: 32 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Login Redirect */}
          {step.type === "loginRedirect" && (
            <Text className="text-center text-white mb-6">{step.description}</Text>
          )}

          {/* Next Button */}
          <TouchableOpacity
            className="bg-white px-6 py-3 rounded-lg mt-4"
            onPress={handleNext}
          >
            <Text className="text-center font-semibold">{currentStep === totalSteps - 1 ? "Go to Login" : "Next"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}


// import React, { useState, useEffect } from "react";
// import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated, Image } from "react-native";
// import { useRouter } from "expo-router";
// import * as SecureStore from "expo-secure-store";
// import { LinearGradient } from "expo-linear-gradient";

// type OnboardingStep = {
//   type: "welcome" | "text" | "avatar" | "select" | "loginRedirect";
//   title: string;
//   description?: string;
//   key?: string; // optional
//   placeholder?: string;
//   options?: string[];
// };

// // Define questions
// const onboardingQuestions: OnboardingStep = [
//   { type: "welcome", title: "Welcome to SAT Prep", description: "Enhance your journey by answering a few questions." },
//   { type: "text", title: "What's your name?", placeholder: "Enter your name", key: "name" },
//   { type: "avatar", title: "Pick an avatar", key: "avatar" }, // optional
//   { type: "select", title: "Have you tried SAT before?", options: ["Never", "Once", "Multiple times"], key: "satExperience" },
//   { type: "select", title: "Most difficult part for you?", options: ["Math", "Reading", "Writing", "Time management"], key: "difficulty" },
//   { type: "text", title: "What is your passion?", placeholder: "Your passion", key: "passion" },
//   { type: "loginRedirect", title: "All set!", description: "Next step: login to your account" },
// ];

// export default function Onboarding() {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [answers, setAnswers] = useState<Record<string, string>>({});
//   const [fadeAnim] = useState(new Animated.Value(0));
//   const router = useRouter();

//   // Animate step transitions
//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 400,
//       useNativeDriver: true,
//     }).start();
//   }, [currentStep]);

//   // Check if onboarding was already completed
//   useEffect(() => {
//     const checkOnboarding = async () => {
//       const done = await SecureStore.getItemAsync("onboardingCompleted");
//       if (done) router.replace("/login");
//     };
//     checkOnboarding();
//   }, []);

//   const step = onboardingQuestions[currentStep];
//   const totalSteps = onboardingQuestions.length;

//   const handleNext = async () => {
//     if (currentStep < totalSteps - 1) {
//       setCurrentStep(currentStep + 1);
//       fadeAnim.setValue(0); // reset animation
//     } else {
//       await SecureStore.setItemAsync("onboardingCompleted", "true");
//       // Here you can also save answers to your backend
//       router.replace("/login");
//     }
//   };

//   const handleAnswer = (key: string, value: string) => {
//     setAnswers((prev) => ({ ...prev, [key]: value }));
//   };

//   // Progress percentage
//   const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

//   return (
//     <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
//       <LinearGradient
//         colors={["#7C3AED", "#EC4899", "#FBBF24"]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         className="absolute inset-0"
//       />

//       <View className="flex-1 justify-center items-center p-6">
//         {/* Progress Bar */}
//         <View className="w-full h-2 bg-gray-300 rounded-full mb-6">
//           <View style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: "#FBBF24", borderRadius: 4 }} />
//         </View>

//         {/* Animated Step */}
//         <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
//           <Text className="text-2xl font-bold text-center mb-4 text-white">{step.title}</Text>
//           {step.description && <Text className="text-center text-white mb-6">{step.description}</Text>}

//           {/* Text Input */}
//           {step.type === "text" && (
//             <TextInput
//               className="w-full p-4 border border-gray-300 rounded-lg mb-6 bg-white text-black"
//               placeholder={step.placeholder}
//               value={answers[step.key] || ""}
//               onChangeText={(text) => handleAnswer(step.key, text)}
//             />
//           )}

//           {/* Select Options */}
//           {step.type === "select" &&
//             step.options.map((opt) => (
//               <TouchableOpacity
//                 key={opt}
//                 className={`w-full p-4 mb-3 rounded-lg border ${
//                   answers[step.key] === opt ? "border-blue-600 bg-blue-100" : "border-gray-300"
//                 }`}
//                 onPress={() => handleAnswer(step.key, opt)}
//               >
//                 <Text className="text-gray-800">{opt}</Text>
//               </TouchableOpacity>
//             ))}

//           {/* Avatar Step */}
//           {step.type === "avatar" && (
//             <View className="flex-row justify-around mb-6">
//               {["👩‍🎓","🧑‍🎓","🧑‍💻"].map((emoji) => (
//                 <TouchableOpacity
//                   key={emoji}
//                   className={`p-4 border rounded-full ${answers[step.key] === emoji ? "border-yellow-400" : "border-gray-300"}`}
//                   onPress={() => handleAnswer(step.key, emoji)}
//                 >
//                   <Text style={{ fontSize: 32 }}>{emoji}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           )}

//           {/* Login Redirect */}
//           {step.type === "loginRedirect" && (
//             <Text className="text-center text-white mb-6">{step.description}</Text>
//           )}

//           {/* Next Button */}
//           <TouchableOpacity
//             className="bg-white px-6 py-3 rounded-lg mt-4"
//             onPress={handleNext}
//           >
//             <Text className="text-center font-semibold">{currentStep === totalSteps - 1 ? "Go to Login" : "Next"}</Text>
//           </TouchableOpacity>
//         </Animated.View>
//       </View>
//     </ScrollView>
//   );
// }

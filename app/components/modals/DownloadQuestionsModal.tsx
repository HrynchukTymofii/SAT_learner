// import { Modal, View, Text, TouchableOpacity } from "react-native";
// import { useState } from "react";
// import { fetchAndStoreAllContent } from "@/lib/db/fetchDb";
// import Toast from "react-native-toast-message";
// import { setHasDownloadedQuestions } from "@/lib/db/initAppDb";

// export default function DownloadQuestionsModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
//   const [downloading, setDownloading] = useState(false);
//   const [progress, setProgress] = useState({ step: "", completed: 0, total: 0 });

//   const handleDownload = async () => {
//     setDownloading(true);
//     try {
//       const res = await fetchAndStoreAllContent((step, completed, total) => {
//         setProgress({ step, completed, total });
//       });

//       if (!res.success) throw new Error(res.error);
//       await setHasDownloadedQuestions();
//       onClose();
//       Toast.show({ type: "success", text1: "Питання успішно завантажено!" });
//     } catch (err) {
//       Toast.show({ type: "error", text1: "Помилка завантаження", text2: String(err) });
//     } finally {
//       setDownloading(false);
//     }
//   };

//   return (
//     <Modal visible={visible} transparent animationType="fade">
//           <View className="flex-1 items-center justify-center bg-black/60 px-6">
//             <View className="bg-white dark:bg-stone-900 p-6 rounded-2xl w-full max-w-md border border-gray-200 dark:border-stone-700">

//               {!downloading &&
//                 <Text className="text-3xl font-bold mb-3 text-center text-black dark:text-white">
//                   👋 Вітаємо!
//                 </Text>
//               }
              
//               {/* Заголовок */}
//               {downloading &&
//                 <Text className="text-2xl font-bold mb-3 text-center text-black dark:text-white">
//                   {progress.step === "preparing" && "🛠️ Підготовка..."}
//                   {progress.step === "quizzes" && "📚 Збираємо теми..."}
//                   {progress.step === "questions" && "📄 Завантажуємо питання"}
//                   {progress.step === "finishing" && "✅ Фінальні кроки..."}
//                 </Text>
//               }

//               {/* Пояснення */}
//               {!downloading && (
//                 <>
//                   <Text className=" font-bold mb-3 text-center text-black dark:text-white">
//                     Для роботи додатку потрібно завантажити питання
//                   </Text>
//                   <Text className=" text-center mb-4 text-gray-700 dark:text-gray-300">
//                     Це займе декілька хвилин.
//                   </Text>
//                 </>
//               )}

//               {!downloading && (
//                 <Text className="text-sm text-center mb-4 text-red-600 dark:text-red-400 font-medium">
//                   ⚠️ Перед початком переконайтеся, що маєте стабільне підключення до Інтернету.
//                 </Text>
//               )}

//               {/* Кроки завантаження */}
//               {downloading && (
//                 <View className="mb-3">
//                   {/* Лічильник тільки для питань */}
//                   {progress.step === "questions" && (
//                     <Text className="text-center text-black dark:text-white mb-2">
//                       Завантажено {progress.completed} з {progress.total} питань
//                     </Text>
//                   )}

//                   {/* Прогресбар */}
//                   {progress.step !== "preparing" &&
//                     <View className="w-full bg-gray-200 dark:bg-stone-700 h-3 rounded-full overflow-hidden mb-2">
//                       <View
//                         className="bg-green-500 h-3"
//                         style={{
//                           width:
//                             progress.total > 0
//                               ? `${(progress.completed / progress.total) * 100}%`
//                               : "0%",
//                         }}
//                       />
//                     </View>
//                   }
//                 </View>
//               )}

//               {/* Кнопка завантаження */}
//               {!downloading && (
//                 <TouchableOpacity
//                   onPress={handleDownload}
//                   className="bg-green-600 dark:bg-green-500 p-4 rounded-xl"
//                 >
//                   <Text className="text-white text-center font-bold text-lg">
//                     Завантажити зараз
//                   </Text>
//                 </TouchableOpacity>
//               )}

//               {/* Поради / підпис під прогресбаром */}
//               {downloading && (
//                 <Text className="text-center text-gray-600 dark:text-gray-400 text-sm">
//                   {progress.step === "preparing" && "🔧 Готуємо середовище..."}
//                   {progress.step === "quizzes" && "📘 Завантажуємо теми та матеріали..."}
//                   {progress.step === "questions" && "📚 Це може зайняти кілька хвилин..."}
//                   {progress.step === "finishing" && "✨ Завершуємо встановлення!"}
//                 </Text>
//               )}
//             </View>
//           </View>
//         </Modal>
//   );
// }

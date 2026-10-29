import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  BookOpen,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getStudyPlan, saveStudyPlan, Task } from "@/lib/studyPlanStorage";
import Toast from "react-native-toast-message";

export default function DayPlanningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const dateParam = params.date as string;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [goals, setGoals] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskType, setNewTaskType] = useState<"lesson" | "quiz" | "review" | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dateParam) {
      const date = new Date(dateParam);
      setSelectedDate(date);
      loadPlan(dateParam);
    }
  }, [dateParam]);

  const loadPlan = async (date: string) => {
    try {
      const plan = await getStudyPlan(date);
      if (plan) {
        setGoals(plan.goals || "");
        setTasks(plan.tasks || []);
      }
    } catch (error) {
      console.error("Failed to load plan:", error);
    }
  };

  const savePlan = async () => {
    try {
      setIsSaving(true);
      const success = await saveStudyPlan(dateParam, {
        goals,
        tasks,
      });

      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your study plan has been saved!',
          position: 'top',
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to save your study plan. Please try again.',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to save plan:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save your study plan. Please try again.',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTask = () => {
    const taskText = newTaskText.trim();
    if (taskText) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        type: newTaskType,
      };
      setTasks([...tasks, newTask]);
      setNewTaskText("");
      setNewTaskType(null);
    }
  };

  const handleTypeSelect = (type: "lesson" | "quiz" | "review") => {
    setNewTaskType(type);

    const suggestions = {
      lesson: "Complete 1 lesson",
      quiz: "Complete 1 quiz",
      review: "Review previous topics"
    };

    const currentText = newTaskText.trim();

    // Auto-fill if input is empty OR if it's one of the default suggestions
    const isDefaultSuggestion = Object.values(suggestions).includes(currentText);

    if (!currentText || isDefaultSuggestion) {
      setNewTaskText(suggestions[type]);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#17151C" : "#E5DFEE",
        }}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isDark ? "#17151C" : "#EFEAF7",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#C9AAFB" : "#7A4BDB"} />
          <Text
            style={{
              color: isDark ? "#C9AAFB" : "#7A4BDB",
              fontWeight: "600",
              marginLeft: 6,
              fontSize: 14,
            }}
          >
            Back to Calendar
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: isDark ? "#F4F1F8" : "#0B0A0F",
            marginBottom: 4,
          }}
        >
          Study Plan
        </Text>
        <Text style={{ fontSize: 14, color: isDark ? "#9C95A8" : "#6B6577" }}>
          {formatDate(selectedDate)}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        {totalTasks > 0 && (
          <View
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: "#8A5CE6",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: isDark ? "#F4F1F8" : "#0B0A0F",
                }}
              >
                Daily Progress
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#8A5CE6",
                }}
              >
                {completedTasks}/{totalTasks}
              </Text>
            </View>
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: isDark ? "#0B0A0F" : "#EFEAF7",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${progressPercentage}%`,
                  backgroundColor: "#8A5CE6",
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        )}

        {/* Goals Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              marginBottom: 12,
            }}
          >
            Goals & Notes
          </Text>
          <TextInput
            value={goals}
            onChangeText={setGoals}
            placeholder="Set your SAT prep goals for today... e.g., 'Focus on Math concepts' or 'Review Reading strategies'"
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              borderWidth: 1,
              borderColor: isDark ? "#2B2733" : "#E5DFEE",
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              textAlignVertical: "top",
              minHeight: 100,
            }}
            placeholderTextColor={isDark ? "#7E7889" : "#9C95A8"}
          />
        </View>

        {/* Tasks Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              marginBottom: 12,
            }}
          >
            Task Checklist
          </Text>

          {/* Task Type Selector */}
          <View style={{ flexDirection: "row", marginBottom: 12, gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleTypeSelect("lesson")}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: newTaskType === "lesson" ? "#8A5CE6" : isDark ? "#17151C" : "#ffffff",
                borderWidth: 1,
                borderColor: newTaskType === "lesson" ? "#8A5CE6" : isDark ? "#2B2733" : "#E5DFEE",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16, marginRight: 6 }}>📚</Text>
              <Text style={{
                fontSize: 14,
                fontWeight: newTaskType === "lesson" ? "600" : "400",
                color: newTaskType === "lesson" ? "#ffffff" : isDark ? "#9C95A8" : "#6B6577"
              }}>
                Lesson
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTypeSelect("quiz")}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: newTaskType === "quiz" ? "#8A5CE6" : isDark ? "#17151C" : "#ffffff",
                borderWidth: 1,
                borderColor: newTaskType === "quiz" ? "#8A5CE6" : isDark ? "#2B2733" : "#E5DFEE",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16, marginRight: 6 }}>✏️</Text>
              <Text style={{
                fontSize: 14,
                fontWeight: newTaskType === "quiz" ? "600" : "400",
                color: newTaskType === "quiz" ? "#ffffff" : isDark ? "#9C95A8" : "#6B6577"
              }}>
                Quiz
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTypeSelect("review")}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: newTaskType === "review" ? "#8A5CE6" : isDark ? "#17151C" : "#ffffff",
                borderWidth: 1,
                borderColor: newTaskType === "review" ? "#8A5CE6" : isDark ? "#2B2733" : "#E5DFEE",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16, marginRight: 6 }}>🔍</Text>
              <Text style={{
                fontSize: 14,
                fontWeight: newTaskType === "review" ? "600" : "400",
                color: newTaskType === "review" ? "#ffffff" : isDark ? "#9C95A8" : "#6B6577"
              }}>
                Review
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add Task Input */}
          <View
            style={{
              flexDirection: "row",
              marginBottom: 16,
              gap: 8,
            }}
          >
            <TextInput
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="e.g., Complete Algebra lesson"
              onSubmitEditing={addTask}
              returnKeyType="done"
              style={{
                flex: 1,
                backgroundColor: isDark ? "#17151C" : "#ffffff",
                color: isDark ? "#F4F1F8" : "#0B0A0F",
                borderWidth: 1,
                borderColor: isDark ? "#2B2733" : "#E5DFEE",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
              }}
              placeholderTextColor={isDark ? "#7E7889" : "#9C95A8"}
            />
            <TouchableOpacity
              onPress={addTask}
              style={{
                backgroundColor: "#8A5CE6",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Task List */}
          {tasks.length === 0 ? (
            <View
              style={{
                backgroundColor: isDark ? "#17151C" : "#ffffff",
                borderRadius: 12,
                padding: 32,
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDark ? "#2B2733" : "#E5DFEE",
                borderStyle: "dashed",
              }}
            >
              <BookOpen size={32} color={isDark ? "#7E7889" : "#9C95A8"} style={{ marginBottom: 12 }} />
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#7E7889" : "#9C95A8",
                  textAlign: "center",
                }}
              >
                No tasks yet. Add your first SAT prep task above!
              </Text>
            </View>
          ) : (
            tasks.map((task, index) => (
              <View
                key={task.id}
                style={{
                  backgroundColor: isDark ? "#17151C" : "#ffffff",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: isDark ? "#2B2733" : "#E5DFEE",
                }}
              >
                {/* Checkbox */}
                <TouchableOpacity
                  onPress={() => toggleTask(task.id)}
                  style={{ marginRight: 12 }}
                  activeOpacity={0.7}
                >
                  {task.completed ? (
                    <CheckCircle2 size={24} color="#8A5CE6" />
                  ) : (
                    <Circle size={24} color="#8A5CE6" />
                  )}
                </TouchableOpacity>

                {/* Task Icon */}
                <View style={{ marginRight: 12 }}>
                  <Text style={{ fontSize: 20 }}>
                    {task.type === "lesson" ? "📚" : task.type === "quiz" ? "✏️" : task.type === "review" ? "🔍" : "📝"}
                  </Text>
                </View>

                {/* Task Text */}
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: task.completed
                      ? isDark
                        ? "#7E7889"
                        : "#9C95A8"
                      : isDark
                      ? "#F4F1F8"
                      : "#0B0A0F",
                    textDecorationLine: task.completed ? "line-through" : "none",
                  }}
                >
                  {task.text}
                </Text>

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => deleteTask(task.id)}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: isDark ? "#0B0A0F" : "#fef2f2",
                  }}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color="#D93F55" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={savePlan}
          disabled={isSaving}
          style={{
            backgroundColor: "#8A5CE6",
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            opacity: isSaving ? 0.7 : 1,
          }}
          activeOpacity={0.8}
        >
          <Save size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
            {isSaving ? "Saving..." : "Save Study Plan"}
          </Text>
        </TouchableOpacity>

        {/* Helper Text */}
        <View
          style={{
            marginTop: 16,
            padding: 16,
            backgroundColor: isDark ? "#17151C20" : "#7A4BDB10",
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: isDark ? "#9C95A8" : "#6B6577",
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            Your study plan is saved locally on your device. Set clear goals and
            track your tasks to stay organized!
          </Text>
        </View>
      </ScrollView>
      <Toast
        config={{
          success: (props) => (
            <View
              style={{
                width: '90%',
                backgroundColor: isDark ? '#17151C' : '#ffffff',
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                borderLeftWidth: 4,
                borderLeftColor: '#8A5CE6',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#8A5CE620',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 20 }}>✓</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#F4F1F8' : '#0B0A0F', marginBottom: 2 }}>
                  {props.text1}
                </Text>
                <Text style={{ fontSize: 14, color: isDark ? '#9C95A8' : '#6B6577' }}>
                  {props.text2}
                </Text>
              </View>
            </View>
          ),
          error: (props) => (
            <View
              style={{
                width: '90%',
                backgroundColor: isDark ? '#17151C' : '#ffffff',
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                borderLeftWidth: 4,
                borderLeftColor: '#D93F55',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#D93F5520',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 20 }}>✕</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#F4F1F8' : '#0B0A0F', marginBottom: 2 }}>
                  {props.text1}
                </Text>
                <Text style={{ fontSize: 14, color: isDark ? '#9C95A8' : '#6B6577' }}>
                  {props.text2}
                </Text>
              </View>
            </View>
          ),
        }}
      />
    </View>
  );
}

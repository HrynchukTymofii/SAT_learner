import React, { useState, useEffect } from "react";
import { TextInput, View } from "react-native";
import { BookOpen, Check, CircleHelp, Plus, RotateCcw, Save, Trash2 } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getStudyPlan, parseDateKey, saveStudyPlan, Task } from "@/lib/studyPlanStorage";
import Toast from "react-native-toast-message";
import { Fonts, usePalette } from "@/constants/palette";
import { Card, Chip, Field, PastelCard, PillButton, ProgressBar, Screen, T, Tap, TopBar } from "@/components/ds";

const TYPE_LABEL = { lesson: "Lesson", quiz: "Quiz", review: "Review" } as const;
const TYPE_ICON = { lesson: BookOpen, quiz: CircleHelp, review: RotateCcw } as const;

export default function DayPlanningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const c = usePalette();

  const dateParam = params.date as string;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [goals, setGoals] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskType, setNewTaskType] = useState<"lesson" | "quiz" | "review" | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dateParam) {
      const date = parseDateKey(dateParam);
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
          text1: 'Plan saved',
          position: 'top',
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: "Couldn't save the plan",
          text2: 'Please try again',
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
    <Screen header={<TopBar title="Day plan" />} footer={<PillButton title="Save plan" icon={Save} loading={isSaving} onPress={savePlan} />}>
      <PastelCard tone="lav" radius={28} style={{ padding: 20, gap: 10 }}>
        <T variant="smallStrong" onPastel style={{ opacity: 0.7 }}>
          {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
        </T>
        <T variant="title" onPastel>
          {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </T>
        {totalTasks > 0 && (
          <View style={{ gap: 6, marginTop: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <T variant="smallStrong" onPastel>
                {completedTasks} of {totalTasks} done
              </T>
              <T variant="smallStrong" onPastel>
                {Math.round(progressPercentage)}%
              </T>
            </View>
            <ProgressBar value={progressPercentage} onPastel />
          </View>
        )}
      </PastelCard>

      <Field label="Goal for the day" multiline value={goals} onChangeText={setGoals} placeholder="e.g. Finish the linear equations chapter" />

      <View style={{ gap: 10 }}>
        <T variant="h2">Tasks</T>
        {tasks.length === 0 && (
          <T variant="small">No tasks yet. Add one below.</T>
        )}
        {tasks.map((task) => {
          const Icon = task.type ? TYPE_ICON[task.type] : null;
          return (
            <View
              key={task.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 12,
                paddingLeft: 14,
                borderRadius: 20,
                backgroundColor: task.completed ? c.mint : c.surface,
                borderWidth: 1,
                borderColor: task.completed ? "transparent" : c.line,
              }}
            >
              <Tap
                onPress={() => toggleTask(task.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: task.completed }}
                hitSlop={8}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: task.completed ? 0 : 1.5,
                  borderColor: c.line,
                  backgroundColor: task.completed ? c.onPastel : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {task.completed && <Check size={16} color="#fff" strokeWidth={3} />}
              </Tap>
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="bodyStrong" color={task.completed ? c.onPastel : c.ink} style={{ fontSize: 14.5, textDecorationLine: task.completed ? "line-through" : "none" }}>
                  {task.text}
                </T>
                {task.type && Icon && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon size={12} color={task.completed ? c.onPastel : c.muted} />
                    <T variant="caption" color={task.completed ? c.onPastel : c.muted}>
                      {TYPE_LABEL[task.type]}
                    </T>
                  </View>
                )}
              </View>
              <Tap onPress={() => deleteTask(task.id)} hitSlop={8} accessibilityLabel="Delete task" style={{ padding: 6 }}>
                <Trash2 size={18} color={task.completed ? c.onPastel : c.subtle} />
              </Tap>
            </View>
          );
        })}
      </View>

      <Card style={{ gap: 12 }}>
        <T variant="h3">Add a task</T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(["lesson", "quiz", "review"] as const).map((t) => (
            <Chip key={t} label={TYPE_LABEL[t]} icon={TYPE_ICON[t]} active={newTaskType === t} onPress={() => handleTypeSelect(t)} />
          ))}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TextInput
            value={newTaskText}
            onChangeText={setNewTaskText}
            placeholder="What will you study?"
            placeholderTextColor={c.subtle}
            onSubmitEditing={addTask}
            returnKeyType="done"
            style={{ flex: 1, height: 50, borderRadius: 999, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.bg, paddingHorizontal: 16, fontFamily: Fonts.bodySemi, fontSize: 15, color: c.ink }}
          />
          <Tap
            onPress={addTask}
            disabled={!newTaskText.trim()}
            accessibilityLabel="Add task"
            style={({ pressed }) => ({ width: 50, height: 50, borderRadius: 25, backgroundColor: c.inkButton, alignItems: "center", justifyContent: "center", opacity: !newTaskText.trim() ? 0.4 : pressed ? 0.8 : 1 })}
          >
            <Plus size={22} color={c.inkButtonText} />
          </Tap>
        </View>
      </Card>

      <T variant="caption" style={{ textAlign: "center" }}>
        Plans are saved on this phone.
      </T>
    </Screen>
  );
}

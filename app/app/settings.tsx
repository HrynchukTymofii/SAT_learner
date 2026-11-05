import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Bell, KeyRound, LogOut, Monitor, Moon, Sun, Trash2 } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { updateUser, deleteUserAccount } from "@/lib/api/user";
import { useLogout } from "@/hooks/useLogout";
import { useTheme } from "@/context/ThemeContext";
import { cancelDailyStudyReminder, isDailyReminderScheduled, scheduleDailyStudyReminder, setDailyReminderTurnedOff } from "@/lib/notifications";
import { usePalette } from "@/constants/palette";
import { Field, Group, GroupRow, PillButton, Screen, T, TopBar } from "@/components/ds";
import { Segmented, Sheet, SwitchRow } from "@/components/ds/overlays";

/**
 * Settings: theme, study reminder, password, log out, delete account.
 * (Edit profile lives on the profile card; contact / rate / about live in Profile > More.)
 */
export default function SettingsScreen() {
  const router = useRouter();
  const c = usePalette();
  const { token } = useAuth();
  const logout = useLogout();
  const { themeMode, setThemeMode } = useTheme();

  const [reminder, setReminder] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    isDailyReminderScheduled().then(setReminder).catch(() => {});
  }, []);

  const toggleReminder = async (on: boolean) => {
    setReminderBusy(true);
    try {
      if (on) {
        const id = await scheduleDailyStudyReminder();
        if (!id) {
          Toast.show({ type: "error", text1: "Notifications are off", text2: "Allow them for SAT Learner in your phone settings" });
          setReminder(false);
          return;
        }
        setReminder(true);
        await setDailyReminderTurnedOff(false);
        Toast.show({ type: "success", text1: "Daily reminder on", text2: "Every day at 9:00" });
      } else {
        await cancelDailyStudyReminder();
        await setDailyReminderTurnedOff(true);
        setReminder(false);
      }
    } finally {
      setReminderBusy(false);
    }
  };

  const savePassword = async () => {
    if (!token) return;
    if (password.length < 4) {
      Toast.show({ type: "error", text1: "Password is too short", text2: "Use at least 4 characters" });
      return;
    }
    setSavingPassword(true);
    const result = await updateUser(token, { password });
    setSavingPassword(false);
    if (result.success) {
      setPassword("");
      Toast.show({ type: "success", text1: "Password changed" });
    } else {
      Toast.show({ type: "error", text1: result.error || "Couldn't change the password" });
    }
  };

  const doLogout = async () => {
    setLogoutOpen(false);
    await logout();
    router.replace("/login");
    Toast.show({ type: "success", text1: "You have logged out" });
  };

  const doDelete = async () => {
    if (!token || confirmText.trim().toLowerCase() !== "delete") return;
    setDeleting(true);
    const result = await deleteUserAccount(token);
    setDeleting(false);
    if (!result.success) {
      Toast.show({ type: "error", text1: result.error || "Failed to delete account" });
      return;
    }
    setDeleteOpen(false);
    // The account is gone on the server, so don't try to send its offline actions
    await logout({ flushQueue: false });
    router.replace("/");
    Toast.show({ type: "success", text1: "Account deleted" });
  };

  return (
    <Screen header={<TopBar title="Settings" />}>
      <View style={{ gap: 10 }}>
        <T variant="label">Appearance</T>
        <Segmented
          value={themeMode}
          onChange={setThemeMode}
          options={[
            { label: "Auto", value: "system", icon: Monitor },
            { label: "Light", value: "light", icon: Sun },
            { label: "Dark", value: "dark", icon: Moon },
          ]}
        />
      </View>

      <View style={{ gap: 10 }}>
        <T variant="label">Notifications</T>
        <Group>
          <SwitchRow
            icon={Bell}
            tone="butter"
            title="Daily study reminder"
            subtitle="A nudge every day at 9:00"
            value={reminder}
            disabled={reminderBusy}
            onChange={toggleReminder}
          />
        </Group>
      </View>

      {token && (
        <View style={{ gap: 10 }}>
          <T variant="label">Account</T>
          <Field label="New password" icon={KeyRound} value={password} onChangeText={setPassword} placeholder="At least 4 characters" secureTextEntry autoCapitalize="none" />
          {password.length > 0 && <PillButton title="Save password" center loading={savingPassword} onPress={savePassword} />}
          <Group style={{ marginTop: 6 }}>
            <GroupRow icon={LogOut} tone="lav" title="Log out" onPress={() => setLogoutOpen(true)} />
            <GroupRow icon={Trash2} title="Delete account" subtitle="Removes your progress for good" danger onPress={() => setDeleteOpen(true)} />
          </Group>
        </View>
      )}

      <Sheet
        visible={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        icon={LogOut}
        title="Log out?"
        text="Your progress is saved to your account. Log in again any time to pick up where you left off."
        footer={
          <>
            <PillButton title="Log out" center onPress={doLogout} />
            <PillButton title="Cancel" tone="soft" center onPress={() => setLogoutOpen(false)} />
          </>
        }
      />

      <Sheet
        visible={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setConfirmText("");
        }}
        icon={Trash2}
        tone="rose"
        title="Delete your account?"
        text="This removes your account, points, scores and achievements. It can't be undone. Type Delete to confirm."
        footer={
          <>
            <PillButton
              title="Delete account"
              tone="danger"
              center
              loading={deleting}
              disabled={confirmText.trim().toLowerCase() !== "delete"}
              onPress={doDelete}
            />
            <PillButton title="Cancel" tone="soft" center onPress={() => setDeleteOpen(false)} />
          </>
        }
      >
        <Field value={confirmText} onChangeText={setConfirmText} placeholder="Type Delete" autoCapitalize="none" autoCorrect={false} />
      </Sheet>
      <View style={{ height: 1 }} />
      <T variant="caption" color={c.subtle} style={{ textAlign: "center" }}>
        SAT Math Learner
      </T>
    </Screen>
  );
}

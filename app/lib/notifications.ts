import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      //console.log("Notification permissions not granted");
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("daily-reminder", {
        name: "Daily Study Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#06B6D4",
        // no `sound` here: the channel then plays the system default
        // ("default" is looked up as a bundled sound file and fails)
      });
    }

    return true;
  } catch (error) {
    console.error("Failed to request notification permissions:", error);
    return false;
  }
};

/**
 * Schedule daily notification at 9 AM
 */
export const scheduleDailyStudyReminder = async (): Promise<string | null> => {
  try {
    // Cancel any existing daily reminders first
    await cancelDailyStudyReminder();

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Schedule notification for 9 AM every day
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Study! 📚",
        body: "Don't forget to complete your study plan for today. Every step brings you closer to your SAT goals!",
        sound: true, // system default sound
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: "daily_reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });

    // Store the notification ID for future cancellation
    return notificationId;
  } catch (error) {
    console.error("Failed to schedule daily notification:", error);
    return null;
  }
};

/**
 * Cancel the daily study reminder
 */
export const cancelDailyStudyReminder = async (): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    // Find and cancel daily reminder notifications
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === "daily_reminder") {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error("Failed to cancel daily notification:", error);
  }
};

/**
 * Check if daily reminder is scheduled
 */
export const isDailyReminderScheduled = async (): Promise<boolean> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    return scheduledNotifications.some(
      (notification) => notification.content.data?.type === "daily_reminder"
    );
  } catch (error) {
    console.error("Failed to check daily reminder status:", error);
    return false;
  }
};

/**
 * Send an immediate test notification
 */
export const sendTestNotification = async (): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification 📚",
        body: "Daily study reminders are now enabled!",
        sound: true, // system default sound
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Failed to send test notification:", error);
  }
};

// The user's choice in Settings. The app schedules the reminder on start unless it was turned off.
const REMINDER_PREF_KEY = "dailyReminderOff";

export const isDailyReminderTurnedOff = async (): Promise<boolean> =>
  (await SecureStore.getItemAsync(REMINDER_PREF_KEY).catch(() => null)) === "1";

export const setDailyReminderTurnedOff = async (off: boolean): Promise<void> => {
  try {
    if (off) await SecureStore.setItemAsync(REMINDER_PREF_KEY, "1");
    else await SecureStore.deleteItemAsync(REMINDER_PREF_KEY);
  } catch {
    // not saved; the reminder just follows the default next launch
  }
};

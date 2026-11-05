import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "SAT Math Learner",
  slug: "sat-prep-app",
  version: "1.0.8",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "satprepapp",
  userInterfaceStyle: "automatic",

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.hrynchuk.satprepapp",
    buildNumber: "1",
    icon: "./assets/images/icon.png",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    googleServicesFile: "./GoogleService-Info.plist",
  },

  android: {
    package: "com.hrynchuk.satprepapp",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    permissions: [
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.SCHEDULE_EXACT_ALARM",
    ],
  },

  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#111827",
      },
    ],
    "expo-secure-store",
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#111827",
        sounds: [],
      },
    ],
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme:
          "com.googleusercontent.apps.329617813146-3o5aq7gfvejqoi3mudiar02tl4urhivu",
      },
    ],
    // "@react-native-svg/plugin",
    "@react-native-community/datetimepicker",
    "expo-asset",
    "expo-build-properties",
    "expo-font",
    "expo-image",
    "expo-sqlite",
    "expo-status-bar",
    "expo-video",
    "expo-web-browser",
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    androidClientId: process.env.ANDROID_GOOGLE_CLIENT_ID,
    iosClientId: process.env.IOS_GOOGLE_CLIENT_ID,
    webClientId: process.env.GOOGLE_CLIENT_ID,
    router: {},
    eas: {
      projectId: "65557dd4-53bd-42a9-92b4-4d486fb3dd2a",
    },
  },

};

export default config;

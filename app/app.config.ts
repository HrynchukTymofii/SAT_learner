import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "SAT Prep App",
  slug: "sat-prep-app",
  version: "1.0.4",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "satprepapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.hrynchuk.satprepapp",
    buildNumber: "1",
    icon: {
      light: "./assets/images/ios-light.png",
      dark: "./assets/images/ios-dark.png",
      tinted: "./assets/images/ios-tinted.png",
    },
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
    edgeToEdgeEnabled: true,
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon-dark.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#f8fafc",
        dark: {
          image: "./assets/images/splash-icon-light.png",
          backgroundColor: "#0f172a",
        },
      },
    ],
    "expo-secure-store",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme:
          "com.googleusercontent.apps.329617813146-3o5aq7gfvejqoi3mudiar02tl4urhivu",
      },
    ],
    // "@react-native-svg/plugin",
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

  splash: {
    image: "./assets/images/splash-icon-dark.png",
    resizeMode: "contain",
    backgroundColor: "#f8fafc",
    dark: {
      image: "./assets/images/splash-icon-light.png",
      backgroundColor: "#0f172a", 
    },
  },
};

export default config;

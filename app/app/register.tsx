import { Redirect, useLocalSearchParams } from "expo-router";

// Sign up lives on the login screen's "Sign up" tab now; this keeps old links working
export default function RegisterScreen() {
  const { returnUrl } = useLocalSearchParams<{ returnUrl?: string }>();
  return <Redirect href={{ pathname: "/login", params: { tab: "register", ...(returnUrl ? { returnUrl } : {}) } } as any} />;
}

import { useRouter } from "expo-router";
import { MapPinOff } from "lucide-react-native";
import { EmptyState, Screen } from "@/components/ds";

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <EmptyState icon={MapPinOff} title="Page not found" text="This screen doesn't exist. It may have moved in an update." action="Go to Home" onAction={() => router.replace("/")} />
    </Screen>
  );
}

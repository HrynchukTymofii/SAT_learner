import { View } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { usePalette } from "@/constants/palette";
import { T } from "@/components/ds";

export default function TimeAlert() {
  const c = usePalette();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.rose, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 }}>
      <AlertTriangle size={17} color={c.onPastel} strokeWidth={2.2} />
      <T variant="smallStrong" onPastel>
        Less than 5 minutes left
      </T>
    </View>
  );
}

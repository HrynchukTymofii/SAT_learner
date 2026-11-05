import React from "react";
import { View } from "react-native";
import { Lightbulb } from "lucide-react-native";
import AutoHeightWebView from "react-native-autoheight-webview";
import { wrapHtmlContent } from "@/lib/htmlWrapper";
import { usePalette } from "@/constants/palette";
import { PillButton } from "@/components/ds";
import { Sheet } from "@/components/ds/overlays";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hint?: string;
  hintImageUrl?: string;
}

/** Hint for the current question, as a bottom sheet. */
export const HintModal = ({ isOpen, onClose, hint }: HintModalProps) => {
  const c = usePalette();
  if (!hint) return null;
  return (
    <Sheet
      visible={isOpen}
      onClose={onClose}
      icon={Lightbulb}
      tone="butter"
      title="Hint"
      scroll
      footer={<PillButton title="Got it" center onPress={onClose} />}
    >
      <View style={{ backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.line, padding: 12 }}>
        <AutoHeightWebView
          source={{ html: wrapHtmlContent(hint, { isDark: c.isDark }) }}
          style={{ width: "100%", minHeight: 50 }}
          scrollEnabled={false}
        />
      </View>
    </Sheet>
  );
};

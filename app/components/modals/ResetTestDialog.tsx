import React, { useState } from "react";
import { RotateCcw } from "lucide-react-native";
import { PillButton } from "@/components/ds";
import { Sheet } from "@/components/ds/overlays";

interface ResetTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  testTitle: string;
}

/** Asks before wiping the results of a finished test. */
export const ResetTestDialog = ({ isOpen, onClose, onConfirm, testTitle }: ResetTestDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error resetting test:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet
      visible={isOpen}
      onClose={onClose}
      dismissable={!isLoading}
      icon={RotateCcw}
      tone="lav"
      title="Start over?"
      text={`You've already finished "${testTitle}". Starting over clears those answers and the score.`}
      footer={
        <>
          <PillButton title="Reset and start again" icon={RotateCcw} loading={isLoading} onPress={handleConfirm} />
          <PillButton title="Keep my results" tone="soft" center disabled={isLoading} onPress={onClose} />
        </>
      }
    />
  );
};

import React from "react";
import { useRouter } from "expo-router";
import { LogIn, Lock } from "lucide-react-native";
import { PillButton } from "@/components/ds";
import { Sheet } from "@/components/ds/overlays";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Shown when a feature needs an account. */
export const LoginRequiredModal = ({ isOpen, onClose }: Props) => {
  const router = useRouter();
  return (
    <Sheet
      visible={isOpen}
      onClose={onClose}
      icon={Lock}
      tone="lav"
      title="Log in to continue"
      text="With an account your answers, scores and points are saved, and you can pick up on another phone."
      footer={
        <>
          <PillButton
            title="Log in or sign up"
            icon={LogIn}
            onPress={() => {
              onClose();
              router.push("/login");
            }}
          />
          <PillButton title="Maybe later" tone="soft" center onPress={onClose} />
        </>
      }
    />
  );
};

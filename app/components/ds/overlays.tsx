/**
 * Overlays in the app's style: toasts, bottom sheets, a segmented control and a switch row.
 * Every popup in the app should be one of these, so they all look the same.
 */
import React, { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Info, LucideIcon, X } from "lucide-react-native";
import type { ToastConfig, ToastConfigParams } from "react-native-toast-message";
import { Fonts, PastelName, usePalette } from "@/constants/palette";
import { CircleButton, IconTile, T, Tap } from "./index";

// ---------------------------------------------------------------- toast

function ToastPill({ text1, text2, kind }: ToastConfigParams<any> & { kind: "success" | "error" | "info" }) {
  const c = usePalette();
  const dot = kind === "success" ? c.mint : kind === "error" ? c.rose : c.lav;
  const Icon = kind === "success" ? Check : kind === "error" ? X : Info;
  return (
    <View
      style={{
        maxWidth: "92%",
        minWidth: 180,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: c.inkButton,
        borderRadius: 999,
        paddingVertical: 8,
        paddingLeft: 8,
        paddingRight: 18,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      }}
    >
      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: dot, alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color="#0B0A0F" strokeWidth={2.8} />
      </View>
      <View style={{ flexShrink: 1 }}>
        <Text numberOfLines={2} style={{ fontFamily: Fonts.bodyBold, fontSize: 14.5, color: c.inkButtonText }}>
          {text1}
        </Text>
        {!!text2 && (
          <Text numberOfLines={2} style={{ fontFamily: Fonts.bodySemi, fontSize: 12.5, color: c.inkButtonText, opacity: 0.7 }}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  );
}

/** Pass to <Toast config={toastConfig} /> */
export const toastConfig: ToastConfig = {
  success: (p) => <ToastPill {...p} kind="success" />,
  error: (p) => <ToastPill {...p} kind="error" />,
  info: (p) => <ToastPill {...p} kind="info" />,
};

// ---------------------------------------------------------------- sheet

/**
 * Bottom sheet: dims the screen, rounded top, optional icon + title + text, then content and actions.
 * Tapping the dimmed area closes it (unless `dismissable` is false).
 */
export function Sheet({
  visible,
  onClose,
  title,
  text,
  icon,
  tone = "lav",
  children,
  footer,
  dismissable = true,
  scroll,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  text?: string;
  icon?: LucideIcon;
  tone?: PastelName;
  children?: ReactNode;
  footer?: ReactNode;
  dismissable?: boolean;
  scroll?: boolean;
}) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const body = (
    <>
      {(icon || title) && (
        <View style={{ gap: 10, marginBottom: children ? 16 : 4 }}>
          {icon && <IconTile icon={icon} tone={tone} size={52} radius={18} />}
          {!!title && <T variant="title" style={{ fontSize: 24, lineHeight: 28 }}>{title}</T>}
          {!!text && <T variant="small" style={{ fontSize: 14, lineHeight: 20 }}>{text}</T>}
        </View>
      )}
      {children}
    </>
  );
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={dismissable ? onClose : () => {}}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "flex-end", backgroundColor: c.overlay }}>
        <Tap style={{ flex: 1 }} onPress={dismissable ? onClose : undefined} accessibilityLabel="Close" />
        <View
          style={{
            backgroundColor: c.bg,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: 10,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 18,
            maxHeight: "88%",
          }}
        >
          <View style={{ alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: c.line, marginBottom: 12 }} />
          {dismissable && (
            <View style={{ position: "absolute", right: 16, top: 16, zIndex: 2 }}>
              <CircleButton icon={X} size={38} label="Close" onPress={onClose} />
            </View>
          )}
          {scroll ? (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: 6 }}>
              {body}
            </ScrollView>
          ) : (
            <View style={{ paddingTop: 6 }}>{body}</View>
          )}
          {footer && <View style={{ gap: 10, marginTop: 18 }}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------- segmented

export function Segmented<V extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: V; icon?: LucideIcon }[];
  value: V;
  onChange: (v: V) => void;
}) {
  const c = usePalette();
  return (
    <View style={{ flexDirection: "row", backgroundColor: c.surface2, borderRadius: 999, padding: 4, gap: 4 }}>
      {options.map((o) => {
        const on = o.value === value;
        const Icon = o.icon;
        return (
          <Tap
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{
              flex: 1,
              flexDirection: "row",
              gap: 6,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              paddingVertical: 10,
              backgroundColor: on ? c.inkButton : "transparent",
            }}
          >
            {Icon && <Icon size={15} color={on ? c.inkButtonText : c.muted} strokeWidth={2} />}
            <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 13.5, color: on ? c.inkButtonText : c.muted }}>{o.label}</Text>
          </Tap>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------- switch row

export function SwitchRow({
  icon,
  tone = "lav",
  title,
  subtitle,
  value,
  onChange,
  disabled,
}: {
  icon: LucideIcon;
  tone?: PastelName;
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const c = usePalette();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 12, minHeight: 60 }}>
      <IconTile icon={icon} tone={tone} size={36} radius={11} />
      <View style={{ flex: 1 }}>
        <T variant="bodyStrong">{title}</T>
        {!!subtitle && <T variant="caption">{subtitle}</T>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: c.line, true: c.isDark ? c.lav2 : c.inkButton }}
        thumbColor={Platform.OS === "android" ? "#fff" : undefined}
        ios_backgroundColor={c.line}
      />
    </View>
  );
}

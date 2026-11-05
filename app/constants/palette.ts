import { useColorScheme } from "@/hooks/useColorScheme";

// Brand palette, same as the website: lavender, butter and black.
// Pastel cards keep dark ink (onPastel) in both themes; only the surfaces flip.
export const Palette = {
  light: {
    bg: "#F4F1F9",
    surface: "#FFFFFF",
    surface2: "#EFEAF7",
    ink: "#0B0A0F",
    muted: "#6B6577",
    subtle: "#9C95A8",
    line: "#E5DFEE",
    // links and small accents on the page background
    brand: "#7A4BDB",
    success: "#0E7A43",
    danger: "#B4233F",
    // floating tab bar
    nav: "#FFFFFF",
    navInk: "#6B6577",
    navActive: "transparent",
    navActiveInk: "#7A4BDB",
    // ink buttons flip with the theme
    inkButton: "#0B0A0F",
    inkButtonText: "#FFFFFF",
    overlay: "rgba(11,10,15,0.45)",
  },
  dark: {
    bg: "#0B0A0F",
    surface: "#17151C",
    surface2: "#221F29",
    ink: "#F4F1F8",
    muted: "#9C95A8",
    subtle: "#7E7889",
    line: "#2B2733",
    brand: "#C9AAFB",
    success: "#7FD9A3",
    danger: "#F0707F",
    nav: "#17151C",
    navInk: "#9C95A8",
    navActive: "transparent",
    navActiveInk: "#C9AAFB",
    inkButton: "#F4F1F8",
    inkButtonText: "#0B0A0F",
    overlay: "rgba(0,0,0,0.65)",
  },
};

// The same in both themes
export const Pastel = {
  lav: "#E4CDFF",
  lav2: "#C9AAFB",
  butter: "#FEE7A6",
  mint: "#CDEFD9",
  rose: "#FFD6DE",
  onPastel: "#0B0A0F",
  mintInk: "#0E7A43",
  roseInk: "#B4233F",
  // faint graph-paper lines drawn on pastel cards
  grid: "rgba(11,10,15,0.07)",
};

export type PastelName = "lav" | "lav2" | "butter" | "mint" | "rose";
export const PASTEL_CYCLE: PastelName[] = ["butter", "lav", "mint", "lav2", "rose"];

// Headings use Outfit, body text uses Manrope (both loaded in app/_layout.tsx)
export const Fonts = {
  display: "Outfit_600SemiBold",
  displayMedium: "Outfit_500Medium",
  displayBold: "Outfit_700Bold",
  body: "Manrope_500Medium",
  bodySemi: "Manrope_600SemiBold",
  bodyBold: "Manrope_700Bold",
  bodyHeavy: "Manrope_800ExtraBold",
};

export function usePalette() {
  const scheme = useColorScheme();
  return { ...Palette[scheme === "dark" ? "dark" : "light"], ...Pastel, isDark: scheme === "dark" };
}

export type AppPalette = ReturnType<typeof usePalette>;

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
    brand: "#7A4BDB",
    success: "#2E9A5E",
    danger: "#D93F55",
    // floating tab bar
    nav: "#0B0A0F",
    navInk: "#FFFFFF",
    navActive: "#FFFFFF",
    navActiveInk: "#0B0A0F",
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
    success: "#6FCF97",
    danger: "#F0707F",
    nav: "#E4CDFF",
    navInk: "#0B0A0F",
    navActive: "#0B0A0F",
    navActiveInk: "#E4CDFF",
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
  // faint graph-paper lines drawn on pastel cards
  grid: "rgba(11,10,15,0.07)",
};

// Headings use Outfit (loaded in app/_layout.tsx); body text stays on the system font
export const Fonts = {
  display: "Outfit_600SemiBold",
  displayBold: "Outfit_700Bold",
};

export function usePalette() {
  const scheme = useColorScheme();
  return { ...Palette[scheme === "dark" ? "dark" : "light"], ...Pastel, isDark: scheme === "dark" };
}

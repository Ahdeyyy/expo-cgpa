import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";
import { Uniwind, useCSSVariable } from "uniwind";
import { Storage } from "expo-sqlite/kv-store";

export const SystemUIConfig = () => {
  const theme = Storage.getItemSync("theme") as
    | "light"
    | "dark"
    | "amoled"
    | null;
  Uniwind.setTheme(theme || "light");

  const backgroundColor = useCSSVariable("--color-background");

  useEffect(() => {
    const setSystemColor = async () => {
      // Check if color is defined and is a string (to satisfy TypeScript/API)
      if (backgroundColor && typeof backgroundColor === "string") {
        try {
          await SystemUI.setBackgroundColorAsync(backgroundColor);
        } catch (error) {
          console.warn("Failed to set SystemUI background color:", error);
        }
      }
    };

    setSystemColor();
  }, [backgroundColor]); // Re-run whenever the theme changes the variable value

  return null;
};

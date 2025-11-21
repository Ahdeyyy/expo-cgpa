import { Text, View } from "react-native";
import { ScreenView } from "../components/ui/ScreenView";
import { useState } from "react";
import { Uniwind } from "uniwind";
import { Select } from "../components/ui/Input";
import { Storage } from "expo-sqlite/kv-store";

function ThemeSwitcher() {
  type ThemeType = "light" | "dark" | "amoled";
  const themes = ["light", "dark", "amoled"] as const;
  const [theme, setTheme] = useState<ThemeType>(Uniwind.currentTheme);

  return (
    <Select
      items={themes.map((theme) => ({ label: theme, value: theme }))}
      onValueChange={(value) => {
        setTheme(value as ThemeType);
        Uniwind.setTheme(value as ThemeType);
        Storage.setItemSync("theme", value as ThemeType);
      }}
      selectedValue={theme}
      placeholder="Select Theme"
    />
  );
}

export default function SettingsScreen() {
  return (
    <ScreenView>
      <Text className="text-foreground text-center mb-4 text-lg font-semibold">
        Settings
      </Text>
      <View className="bg-card p-4 rounded-md flex-row items-center justify-between gap-3 max-w-full">
        <Text className="text-card-foreground  font-medium">Theme</Text>
        <ThemeSwitcher />
      </View>
    </ScreenView>
  );
}

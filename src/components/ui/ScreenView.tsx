import { ReactNode } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUniwind, withUniwind } from "uniwind";

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledStatusBar = withUniwind(StatusBar, {
  backgroundColor: {
    fromClassName: "backgroundColorClassName",
    styleProperty: "backgroundColor",
  },
});

export function ScreenView({ children }: { children: ReactNode }) {
  const { theme } = useUniwind();
  const barStyle = theme === "light" ? "dark-content" : "light-content";
  return (
    <StyledSafeAreaView className="bg-background flex-1 px-4 pb-24 w-full">
      <StyledStatusBar
        backgroundColorClassName="bg-background"
        barStyle={barStyle}
      />
      {children}
    </StyledSafeAreaView>
  );
}

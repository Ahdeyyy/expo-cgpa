import { Stack } from "expo-router";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import * as Network from "expo-network";
// import { Stack } from "expo-router";
import { useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "../global.css";
import { SystemUIConfig } from "../components/SystemUIConfig";

const queryClient = new QueryClient();

onlineManager.setEventListener((setOnline) => {
  const eventSubscription = Network.addNetworkStateListener((state) => {
    setOnline(!!state.isConnected);
  });
  return eventSubscription.remove;
});

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export default function AppLayout() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  SystemUIConfig();
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <GestureHandlerRootView>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}

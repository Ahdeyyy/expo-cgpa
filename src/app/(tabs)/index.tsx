// import { useState } from "react";
import { Alert } from "react-native";

// import { PaypalIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { db } from "../../db";
// import { Uniwind } from "uniwind";
// import { Button } from "../components/ui/Button";
// import { CheckboxInput, PasswordInput, Select } from "../components/ui/Input";
// import { ScreenView } from "../components/ui/ScreenView";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../../drizzle/migrations";
import HomeScreen from "../../screens/HomeScreen";

export default function Index() {
  const { error } = useMigrations(db, migrations);

  // if (success) Alert.alert("Migrations applied successfully");
  if (error) Alert.alert("Error applying migrations", error.message);

  return <HomeScreen />;
}

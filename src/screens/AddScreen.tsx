import { Text, View } from "react-native";
import { ScreenView } from "../components/ui/ScreenView";
import { Button } from "../components/ui/Button";

export function AddScreen() {
  return (
    <ScreenView>
      <View className="gap-4 p-2">
        <Text className="text-center text-lg text-foreground font-bold">
          Add Course | Semester
        </Text>
        <Button size="lg" route={{ href: "/add-semester" }}>
          Add Semester
        </Button>
        <Button size="lg" route={{ href: "/add-course" }}>
          Add Course
        </Button>
      </View>
    </ScreenView>
  );
}

import {
  NativeTabs,
  Icon,
  Label,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
// import { StyledHugeiconsIcon } from "../../components/ui/Button";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function RootLayout() {
  return (
    <NativeTabs minimizeBehavior="automatic" backBehavior="history">
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        {Platform.select({
          ios: <Icon sf="house.fill" />,
          android: (
            <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />
          ),
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="add-course-semester">
        <Icon sf="plus" drawable="ic_input_add" />
        <Label>Add Course | Semester</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Icon
          sf={{ selected: "gear", default: "gear" }}
          drawable="ic_menu_manage"
        />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

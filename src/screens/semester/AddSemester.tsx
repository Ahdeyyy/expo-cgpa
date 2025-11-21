import { ScreenView } from "@/src/components/ui/ScreenView";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import {
  Text,
  View,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useAddSemesterQuery } from "@/src/db/hooks";
import { useRouter } from "expo-router";

export default function AddSemesterScreen() {
  const router = useRouter();
  const [semesterName, setSemesterName] = useState("");
  const [year, setYear] = useState("");
  const [errors, setErrors] = useState<{
    semesterName?: string;
    year?: string;
  }>({});

  const addSemesterMutation = useAddSemesterQuery();

  const validateForm = () => {
    const newErrors: { semesterName?: string; year?: string } = {};

    // Validate semester name
    if (!semesterName.trim()) {
      newErrors.semesterName = "Semester name is required";
    }

    // Validate year
    if (!year.trim()) {
      newErrors.year = "Year is required";
    } else {
      const yearNum = parseInt(year, 10);
      if (isNaN(yearNum)) {
        newErrors.year = "Year must be a valid number";
      } else if (yearNum < 1900 || yearNum > 2100) {
        newErrors.year = "Year must be between 1900 and 2100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await addSemesterMutation.mutateAsync({
        semesterName: semesterName.trim(),
        year: parseInt(year, 10),
      });

      Alert.alert("Success", "Semester added successfully!", [
        {
          text: "OK",
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to add semester. Please try again.", [
        { text: "OK" },
      ]);
      console.error("Error adding semester:", err);
    }
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <ScreenView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <Text className="text-foreground text-center text-2xl font-bold">
              Add New Semester
            </Text>
            <Text className="text-muted-foreground text-center mt-2">
              Create a new semester to organize your courses
            </Text>
          </View>

          <View className="gap-6">
            <Input
              label="Semester Name"
              placeholder="e.g. Spring 2025, First, Second"
              value={semesterName}
              onChangeText={(text) => {
                setSemesterName(text);
                if (errors.semesterName) {
                  setErrors({ ...errors, semesterName: undefined });
                }
              }}
              error={errors.semesterName}
              autoCapitalize="words"
            />

            <Input
              label="Year"
              placeholder="e.g., 2024"
              value={year}
              onChangeText={(text) => {
                setYear(text);
                if (errors.year) {
                  setErrors({ ...errors, year: undefined });
                }
              }}
              error={errors.year}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>

          <View className="mt-8 gap-4">
            <Button
              size="lg"
              onPress={handleSubmit}
              className={
                addSemesterMutation.isPending ? "opacity-50" : undefined
              }
            >
              {addSemesterMutation.isPending ? "Adding..." : "Add Semester"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onPress={handleCancel}
              className={
                addSemesterMutation.isPending ? "opacity-50" : undefined
              }
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView>
  );
}

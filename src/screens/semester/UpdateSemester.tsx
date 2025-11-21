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
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import {
  useUpdateSemesterQuery,
  useDeleteSemesterQuery,
  useGetSemestersQuery,
} from "@/src/db/hooks";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function UpdateSemesterScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const semesterId = parseInt(id, 10);

  const [semesterName, setSemesterName] = useState("");
  const [year, setYear] = useState("");
  const [errors, setErrors] = useState<{
    semesterName?: string;
    year?: string;
  }>({});

  const { data: semesters = [], isLoading } = useGetSemestersQuery();
  const updateSemesterMutation = useUpdateSemesterQuery();
  const deleteSemesterMutation = useDeleteSemesterQuery();

  const semester = semesters.find((s) => s.id === semesterId);

  useEffect(() => {
    if (semester) {
      setSemesterName(semester.semesterName);
      setYear(semester.year.toString());
    }
  }, [semester]);

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

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateSemesterMutation.mutateAsync({
        semesterId,
        updatedSemester: {
          semesterName: semesterName.trim(),
          year: parseInt(year, 10),
        },
      });

      Alert.alert("Success", "Semester updated successfully!", [
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
      Alert.alert("Error", "Failed to update semester. Please try again.", [
        { text: "OK" },
      ]);
      console.error("Error updating semester:", err);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Semester",
      "Are you sure you want to delete this semester? This will also delete all associated courses.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSemesterMutation.mutateAsync(semesterId);
              Alert.alert("Success", "Semester deleted successfully!", [
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
              Alert.alert(
                "Error",
                "Failed to delete semester. Please try again.",
                [{ text: "OK" }],
              );
              console.error("Error deleting semester:", err);
            }
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (isLoading) {
    return (
      <ScreenView>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary active:accent-primary" />
          <Text className="text-foreground mt-4">Loading...</Text>
        </View>
      </ScreenView>
    );
  }

  if (!semester) {
    return (
      <ScreenView>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-6xl mb-4">❌</Text>
          <Text className="text-foreground text-xl font-bold mb-2 text-center">
            Semester Not Found
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            The semester you&apos;re looking for doesn&apos;t exist
          </Text>
          <Button
            size="lg"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
          >
            Go Back
          </Button>
        </View>
      </ScreenView>
    );
  }

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
              Update Semester
            </Text>
            <Text className="text-muted-foreground text-center mt-2">
              Edit semester details
            </Text>
          </View>

          <View className="gap-6">
            <Input
              label="Semester Name"
              placeholder="e.g., Fall 2024, Spring 2025"
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
              onPress={handleUpdate}
              className={
                updateSemesterMutation.isPending ? "opacity-50" : undefined
              }
            >
              {updateSemesterMutation.isPending
                ? "Updating..."
                : "Update Semester"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onPress={handleCancel}
              className={
                updateSemesterMutation.isPending ||
                deleteSemesterMutation.isPending
                  ? "opacity-50"
                  : undefined
              }
            >
              Cancel
            </Button>

            <Button
              size="lg"
              variant="destructive"
              onPress={handleDelete}
              className={
                deleteSemesterMutation.isPending ? "opacity-50" : undefined
              }
            >
              {deleteSemesterMutation.isPending
                ? "Deleting..."
                : "Delete Semester"}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView>
  );
}

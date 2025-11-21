import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button } from "../../../src/components/ui/Button";
import { CheckboxInput, Input, Select } from "../../../src/components/ui/Input";
import { ScreenView } from "../../../src/components/ui/ScreenView";
import { useAddCourseQuery, useGetSemestersQuery } from "../../../src/db/hooks";

const GRADES = [
  { label: "Select Grade", value: "" },
  { label: "A (5.0)", value: "A" },
  { label: "B (4.0)", value: "B" },
  { label: "C (3.0)", value: "C" },
  { label: "D (2.0)", value: "D" },
  { label: "E (1.0)", value: "E" },
  { label: "F (0.0)", value: "F" },
];

export default function AddCourseScreen() {
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("");
  const [grade, setGrade] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [isElective, setIsElective] = useState(false);
  const [countsTowardsCGPA, setCountsTowardsCGPA] = useState(true);
  const [errors, setErrors] = useState<{
    courseName?: string;
    credits?: string;
    grade?: string;
    semesterId?: string;
  }>({});

  const { data: semesters = [], isLoading: semestersLoading } =
    useGetSemestersQuery();
  const addCourseMutation = useAddCourseQuery();

  const semesterOptions = [
    { label: "Select Semester", value: "" },
    ...semesters.map((semester) => ({
      label: `${semester.semesterName} (${semester.year})`,
      value: semester.id.toString(),
    })),
  ];

  useEffect(() => {
    if (semesters.length === 1 && !semesterId) {
      setSemesterId(semesters[0].id.toString());
    }
  }, [semesters, semesterId]);

  const validateForm = () => {
    const newErrors: {
      courseName?: string;
      credits?: string;
      grade?: string;
      semesterId?: string;
    } = {};

    // Validate course name
    if (!courseName.trim()) {
      newErrors.courseName = "Course name is required";
    }

    // Validate credits
    if (!credits.trim()) {
      newErrors.credits = "Credits are required";
    } else {
      const creditsNum = parseInt(credits, 10);
      if (isNaN(creditsNum)) {
        newErrors.credits = "Credits must be a valid number";
      } else if (creditsNum < 1 || creditsNum > 10) {
        newErrors.credits = "Credits must be between 1 and 10";
      }
    }

    // Validate grade
    if (!grade) {
      newErrors.grade = "Grade is required";
    }

    // Validate semester
    if (!semesterId) {
      newErrors.semesterId = "Semester is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await addCourseMutation.mutateAsync({
        courseName: courseName.trim(),
        credits: parseInt(credits, 10),
        grade: grade,
        semesterId: parseInt(semesterId, 10),
        isElective,
        countsTowardsCGPA,
      });

      Alert.alert("Success", "Course added successfully!", [
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
      Alert.alert("Error", "Failed to add course. Please try again.", [
        { text: "OK" },
      ]);
      console.error("Error adding course:", err);
    }
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (semestersLoading) {
    return (
      <ScreenView>
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground text-lg">Loading semesters...</Text>
        </View>
      </ScreenView>
    );
  }

  if (semesters.length === 0) {
    return (
      <ScreenView>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-6xl mb-4">📚</Text>
          <Text className="text-foreground text-xl font-bold mb-2 text-center">
            No Semesters Available
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            You need to create a semester before adding courses
          </Text>
          <Button size="lg" route={{ href: "/add-semester" }}>
            Add Semester
          </Button>
        </View>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <Stack.Screen options={{ headerShown: false }} />
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
              Add New Course
            </Text>
            <Text className="text-muted-foreground text-center mt-2">
              Enter course details to track your grades
            </Text>
          </View>

          <View className="gap-6">
            <Input
              label="Course Name"
              placeholder="e.g., Introduction to Programming"
              value={courseName}
              onChangeText={(text) => {
                setCourseName(text);
                if (errors.courseName) {
                  setErrors({ ...errors, courseName: undefined });
                }
              }}
              error={errors.courseName}
              autoCapitalize="words"
            />

            <Input
              label="Credits"
              placeholder="e.g., 3"
              value={credits}
              onChangeText={(text) => {
                setCredits(text);
                if (errors.credits) {
                  setErrors({ ...errors, credits: undefined });
                }
              }}
              error={errors.credits}
              keyboardType="number-pad"
              maxLength={2}
            />

            <View className="gap-1.5">
              <Text className="text-foreground mb-2 text-sm font-medium">
                Grade
              </Text>
              <Select
                items={GRADES}
                selectedValue={grade}
                onValueChange={(value) => {
                  setGrade(value);
                  if (errors.grade) {
                    setErrors({ ...errors, grade: undefined });
                  }
                }}
              />
              {errors.grade && (
                <Text className="mt-2 text-sm text-destructive font-medium">
                  {errors.grade}
                </Text>
              )}
            </View>

            <View className="gap-1.5">
              <Text className="text-foreground mb-2 text-sm font-medium">
                Semester
              </Text>
              <Select
                items={semesterOptions}
                selectedValue={semesterId}
                onValueChange={(value) => {
                  setSemesterId(value);
                  if (errors.semesterId) {
                    setErrors({ ...errors, semesterId: undefined });
                  }
                }}
              />
              {errors.semesterId && (
                <Text className="mt-2 text-sm text-destructive font-medium">
                  {errors.semesterId}
                </Text>
              )}
            </View>

            <View className="gap-4 mt-2">
              <CheckboxInput
                label="Elective Course"
                value={isElective}
                onValueChange={setIsElective}
              />

              <CheckboxInput
                label="Counts Towards CGPA"
                value={countsTowardsCGPA}
                onValueChange={setCountsTowardsCGPA}
              />
            </View>
          </View>

          <View className="mt-8 gap-4">
            <Button
              size="lg"
              onPress={handleSubmit}
              className={addCourseMutation.isPending ? "opacity-50" : undefined}
            >
              {addCourseMutation.isPending ? "Adding..." : "Add Course"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onPress={handleCancel}
              className={addCourseMutation.isPending ? "opacity-50" : undefined}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView>
  );
}

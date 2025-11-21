import { ScreenView } from "../../../src/components/ui/ScreenView";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button } from "../../../src/components/ui/Button";
import { CheckboxInput, Input, Select } from "../../../src/components/ui/Input";
import {
  useDeleteCourseQuery,
  useGetCoursesQuery,
  useGetSemestersQuery,
  useUpdateCourseQuery,
} from "../../../src/db/hooks";

const GRADES = [
  { label: "Select Grade", value: "" },
  { label: "A (5.0)", value: "A" },
  { label: "B (4.0)", value: "B" },
  { label: "C (3.0)", value: "C" },
  { label: "D (2.0)", value: "D" },
  { label: "E (1.0)", value: "E" },
  { label: "F (0.0)", value: "F" },
];

export default function UpdateCourseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = parseInt(id, 10);

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

  const { data: courses = [], isLoading: coursesLoading } =
    useGetCoursesQuery();
  const { data: semesters = [], isLoading: semestersLoading } =
    useGetSemestersQuery();
  const updateCourseMutation = useUpdateCourseQuery();
  const deleteCourseMutation = useDeleteCourseQuery();

  const course = courses.find((c) => c.id === courseId);

  const semesterOptions = [
    { label: "Select Semester", value: "" },
    ...semesters.map((semester) => ({
      label: `${semester.semesterName} (${semester.year})`,
      value: semester.id.toString(),
    })),
  ];

  useEffect(() => {
    if (course) {
      setCourseName(course.courseName);
      setCredits(course.credits.toString());
      setGrade(course.grade);
      setSemesterId(course.semesterId.toString());
      setIsElective(course.isElective);
      setCountsTowardsCGPA(course.countsTowardsCGPA);
    }
  }, [course]);

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

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateCourseMutation.mutateAsync({
        courseId,
        updatedCourse: {
          courseName: courseName.trim(),
          credits: parseInt(credits, 10),
          grade: grade,
          semesterId: parseInt(semesterId, 10),
          isElective,
          countsTowardsCGPA,
        },
      });

      Alert.alert("Success", "Course updated successfully!", [
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
      Alert.alert("Error", "Failed to update course. Please try again.", [
        { text: "OK" },
      ]);
      console.error("Error updating course:", err);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Course",
      "Are you sure you want to delete this course?",
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
              await deleteCourseMutation.mutateAsync(courseId);
              Alert.alert("Success", "Course deleted successfully!", [
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
                "Failed to delete course. Please try again.",
                [{ text: "OK" }],
              );
              console.error("Error deleting course:", err);
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

  const isLoading = coursesLoading || semestersLoading;

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

  if (!course) {
    return (
      <ScreenView>
        <Stack.Screen />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-6xl mb-4">❌</Text>
          <Text className="text-foreground text-xl font-bold mb-2 text-center">
            Course Not Found
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            The course you&apos;re looking for doesn&apos;t exist
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
              Update Course
            </Text>
            <Text className="text-muted-foreground text-center mt-2">
              Edit course details
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
              onPress={handleUpdate}
              className={
                updateCourseMutation.isPending ? "opacity-50" : undefined
              }
            >
              {updateCourseMutation.isPending ? "Updating..." : "Update Course"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onPress={handleCancel}
              className={
                updateCourseMutation.isPending || deleteCourseMutation.isPending
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
                deleteCourseMutation.isPending ? "opacity-50" : undefined
              }
            >
              {deleteCourseMutation.isPending ? "Deleting..." : "Delete Course"}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView>
  );
}

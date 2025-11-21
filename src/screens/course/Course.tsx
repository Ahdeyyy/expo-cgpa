import { ScreenView } from "@/src/components/ui/ScreenView";
import { Button } from "@/src/components/ui/Button";
import { Text, View, ActivityIndicator, ScrollView } from "react-native";
import { useGetCoursesQuery, useGetSemestersQuery } from "@/src/db/hooks";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Edit02Icon } from "@hugeicons/core-free-icons";

const GRADE_POINTS: { [key: string]: number } = {
  A: 5.0,
  B: 4.0,
  C: 3.0,
  D: 2.0,
  E: 1.0,
  F: 0.0,
};

const GRADE_LABELS: { [key: string]: string } = {
  A: "A (Excellent)",
  B: "B (Very Good)",
  C: "C (Good)",
  D: "D (Satisfactory)",
  E: "E (Pass)",
  F: "F (Fail)",
};

export default function CourseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = parseInt(id, 10);

  const { data: courses = [], isLoading: coursesLoading } =
    useGetCoursesQuery();
  const { data: semesters = [], isLoading: semestersLoading } =
    useGetSemestersQuery();

  const course = courses.find((c) => c.id === courseId);
  const semester = semesters.find((s) => s.id === course?.semesterId);

  const isLoading = coursesLoading || semestersLoading;

  if (isLoading) {
    return (
      <ScreenView>
        <Stack.Screen
          options={{
            title: "Course Details",
            headerShown: true,
          }}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator colorClassName="accent-primary active:accent-primary" />
          <Text className="text-foreground mt-4 text-base">
            Loading course...
          </Text>
        </View>
      </ScreenView>
    );
  }

  if (!course) {
    return (
      <ScreenView>
        <Stack.Screen
          options={{
            title: "Course Not Found",
            headerShown: false,
          }}
        />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-6xl mb-4">📚</Text>
          <Text className="text-foreground text-xl font-bold mb-2 text-center">
            Course Not Found
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            The course you&apos;re looking for doesn&apos;t exist or may have
            been deleted
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

  const gradePoint = GRADE_POINTS[course.grade] || 0;
  const gradeLabel = GRADE_LABELS[course.grade] || course.grade;

  return (
    <ScreenView>
      <Stack.Screen
        options={{
          title: "Course Details",
          headerShown: false,
        }}
      />
      <ScrollView className="flex-1" contentContainerClassName="p-6">
        {/* Course Header */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-foreground text-3xl font-bold flex-1">
              {course.courseName}
            </Text>
          </View>
          {semester && (
            <Text className="text-muted-foreground text-base">
              {semester.semesterName} • {semester.year}
            </Text>
          )}
        </View>

        {/* Grade Card */}
        <View className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
          <Text className="text-muted-foreground text-sm font-medium mb-2">
            Grade
          </Text>
          <View className="flex-row items-baseline gap-3">
            <Text className="text-primary text-5xl font-bold">
              {course.grade}
            </Text>
            <View className="flex-1">
              <Text className="text-foreground text-lg font-semibold">
                {gradeLabel}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {gradePoint.toFixed(1)} grade points
              </Text>
            </View>
          </View>
        </View>

        {/* Course Information */}
        <View className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
          <Text className="text-foreground text-lg font-bold mb-4">
            Course Information
          </Text>

          <View className="gap-4">
            {/* Credits */}
            <View className="flex-row justify-between items-center pb-4 border-b border-border">
              <View>
                <Text className="text-muted-foreground text-sm mb-1">
                  Credits
                </Text>
                <Text className="text-foreground text-base font-semibold">
                  {course.credits} {course.credits === 1 ? "credit" : "credits"}
                </Text>
              </View>
              <View className="bg-primary/10 rounded-full px-4 py-2">
                <Text className="text-primary text-lg font-bold">
                  {course.credits}
                </Text>
              </View>
            </View>

            {/* Course Type */}
            <View className="flex-row justify-between items-center pb-4 border-b border-border">
              <View>
                <Text className="text-muted-foreground text-sm mb-1">
                  Course Type
                </Text>
                <Text className="text-foreground text-base font-semibold">
                  {course.isElective ? "Elective" : "Core"}
                </Text>
              </View>
              <View
                className={`rounded-full px-4 py-2 ${
                  course.isElective ? "bg-accent/20" : "bg-secondary/20"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    course.isElective
                      ? "text-accent-foreground"
                      : "text-secondary-foreground"
                  }`}
                >
                  {course.isElective ? "Elective" : "Core"}
                </Text>
              </View>
            </View>

            {/* CGPA Status */}
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-muted-foreground text-sm mb-1">
                  CGPA Calculation
                </Text>
                <Text className="text-foreground text-base font-semibold">
                  {course.countsTowardsCGPA ? "Included" : "Excluded"}
                </Text>
              </View>
              <View
                className={`rounded-full px-4 py-2 ${
                  course.countsTowardsCGPA ? "bg-primary/10" : "bg-muted/50"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    course.countsTowardsCGPA
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {course.countsTowardsCGPA ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Grade Point Contribution */}
        {course.countsTowardsCGPA && (
          <View className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
            <Text className="text-primary text-sm font-medium mb-2">
              Grade Point Contribution
            </Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-foreground text-3xl font-bold">
                {(gradePoint * course.credits).toFixed(2)}
              </Text>
              <Text className="text-muted-foreground text-base">
                quality points
              </Text>
            </View>
            <Text className="text-muted-foreground text-sm mt-2">
              {course.credits} credits × {gradePoint.toFixed(1)} grade points
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-4 mt-4">
          <Button
            size="lg"
            icon={Edit02Icon}
            onPress={() => router.push(`/course/${courseId}/update`)}
          >
            Edit Course
          </Button>

          <Button
            size="lg"
            variant="outline"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
          >
            Back
          </Button>
        </View>
      </ScrollView>
    </ScreenView>
  );
}

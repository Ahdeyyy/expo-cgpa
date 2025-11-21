import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ScreenView } from "@/src/components/ui/ScreenView";
import {
  useGetSemestersQuery,
  useGetCoursesQuery,
  useGetGPAQuery,
} from "@/src/db/hooks";
import { useState } from "react";
import { SelectCourse } from "@/src/db/schema";
import { gradeToGradePoint } from "@/src/db";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/src/components/ui/Button";

function SemesterInfoCard({
  semesterName,
  year,
  gpa,
  courseCount,
}: {
  semesterName: string;
  year: number;
  gpa: number;
  courseCount: number;
}) {
  return (
    <View className="bg-card rounded-xl p-6 mb-6 shadow-lg">
      <Text className="text-card-foreground text-sm font-medium uppercase tracking-wide mb-2">
        {semesterName}
      </Text>
      <Text className="text-card-foreground text-5xl font-bold">
        {gpa.toFixed(2)}
      </Text>
      <Text className="text-card-foreground/80 text-xs mt-2">
        Semester GPA • {year}
      </Text>
      <View className="mt-4 pt-4 border-t border-border">
        <Text className="text-card-foreground/80 text-sm">
          {courseCount} {courseCount === 1 ? "Course" : "Courses"}
        </Text>
      </View>
    </View>
  );
}

function CourseCard({ course }: { course: SelectCourse }) {
  const gradePoint = gradeToGradePoint(course.grade);
  const courseGPA = gradePoint;

  return (
    <Link
      replace
      href={{
        pathname: "/course/[id]/update",
        params: { id: course.id.toString() },
      }}
      className="bg-card rounded-lg p-4 mb-3 border border-border shadow-sm active:opacity-80"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-foreground text-base font-semibold mb-1">
            {course.courseName}
          </Text>
          <View className="flex-row gap-2">
            {course.isElective ? (
              <View className="bg-secondary px-2 py-1 rounded">
                <Text className="text-secondary-foreground text-xs font-medium">
                  Elective
                </Text>
              </View>
            ) : (
              <View className="bg-primary px-2 py-1 rounded">
                <Text className="text-primary-foreground text-xs font-medium">
                  Core
                </Text>
              </View>
            )}
            {!course.countsTowardsCGPA && (
              <View className="bg-muted px-2 py-1 rounded">
                <Text className="text-muted-foreground text-xs font-medium">
                  Non-CGPA
                </Text>
              </View>
            )}
          </View>
        </View>
        <View className="items-end">
          <View className="bg-primary/90 dark:bg-primary px-3 py-1 rounded-full mb-1">
            <Text className="text-primary-foreground dark:text-primary-foreground/80 text-lg font-bold">
              {course.grade}
            </Text>
          </View>
          <Text className="text-muted-foreground text-xs">
            {courseGPA.toFixed(1)} GPA
          </Text>
        </View>
      </View>
      <View className="flex-row items-center mt-2 pt-2 border-t border-border">
        <Text className="text-muted-foreground text-sm">
          Credits:{" "}
          <Text className="text-foreground font-medium">{course.credits}</Text>
        </Text>
      </View>
    </Link>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-6xl mb-4">📚</Text>
      <Text className="text-foreground text-lg font-semibold mb-2">
        No Courses Yet
      </Text>
      <Text className="text-muted-foreground text-center px-6">
        Add courses to this semester to track your progress
      </Text>
    </View>
  );
}

export default function SemesterScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const semesterId = parseInt(id, 10);

  const [refreshing, setRefreshing] = useState(false);

  const { data: semesters = [], isLoading: semestersLoading } =
    useGetSemestersQuery();
  const {
    data: courses = [],
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useGetCoursesQuery(semesterId);
  const {
    data: gpa = 0,
    isLoading: gpaLoading,
    refetch: refetchGPA,
  } = useGetGPAQuery(semesterId);

  const semester = semesters.find((s) => s.id === semesterId);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCourses(), refetchGPA()]);
    setRefreshing(false);
  };

  const isLoading = semestersLoading || coursesLoading || gpaLoading;

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
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          <SemesterInfoCard
            semesterName={semester.semesterName}
            year={semester.year}
            gpa={gpa}
            courseCount={courses.length}
          />

          <View className="mb-4 flex-row justify-between items-center">
            <Text className="text-foreground text-lg font-semibold">
              Courses ({courses.length})
            </Text>
            <Button
              size="sm"
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: "/semester/[id]/update",
                  params: { id: semesterId.toString() },
                })
              }
            >
              Edit Semester
            </Button>
          </View>

          {courses.length === 0 ? (
            <EmptyState />
          ) : (
            <View>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenView>
  );
}

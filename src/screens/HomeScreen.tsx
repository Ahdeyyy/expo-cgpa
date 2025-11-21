import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ScreenView } from "../components/ui/ScreenView";
import {
  useGetCGPAQuery,
  useGetCoursesQuery,
  useGetSemestersQuery,
  useGetGPAQuery,
} from "../db/hooks";
import { useState } from "react";
import { SelectCourse, SelectSemester } from "../db/schema";
import { gradeToGradePoint } from "../db";
import { Link } from "expo-router";
// import { Button } from "../components/ui/Button";

function CGPACard({
  cgpa,
  electiveCredits,
}: {
  cgpa: number;
  electiveCredits: number;
}) {
  return (
    <View className="bg-card rounded-xl p-6 mb-6 shadow-lg">
      <Text className="text-card-foreground text-sm font-medium uppercase tracking-wide mb-2">
        Current CGPA
      </Text>
      <Text className="text-card-foreground text-5xl font-bold">
        {cgpa.toFixed(2)}
      </Text>
      <Text className="text-card-foreground/80 text-xs mt-2">Out of 5.00</Text>
      <View className="mt-4 pt-4 border-t border-border">
        <Text className="text-card-foreground/80 text-sm">
          Elective Credits: {electiveCredits}
        </Text>
      </View>
    </View>
  );
}

function SemesterCard({ semester }: { semester: SelectSemester }) {
  const { data: semesterGPA = 0 } = useGetGPAQuery(semester.id);

  return (
    <Link
      href={`/semester/${semester.id}` as any}
      className="bg-card rounded-lg p-4 mb-3 border border-border shadow-sm active:opacity-80"
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-foreground text-base font-semibold mb-1">
            {semester.semesterName}
          </Text>
          <Text className="text-muted-foreground text-sm">{semester.year}</Text>
        </View>
        <View className="items-end gap-1">
          <View className="bg-primary/90 dark:bg-primary px-3 py-1 rounded-full">
            <Text className="text-primary-foreground dark:text-primary-foreground/80 text-base font-bold">
              {semesterGPA.toFixed(2)}
            </Text>
          </View>
          <Text className="text-muted-foreground text-xs">Semester GPA</Text>
        </View>
      </View>
    </Link>
  );
}

function CourseCard({ course }: { course: SelectCourse }) {
  const gradePoint = gradeToGradePoint(course.grade);
  const courseGPA = gradePoint;

  return (
    <Link
      replace
      href={{
        pathname: "/course/[id]",
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
        Start adding courses to track your academic progress
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: cgpa = 0,
    isLoading: cgpaLoading,
    refetch: refetchCGPA,
  } = useGetCGPAQuery();
  const {
    data: courses = [],
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useGetCoursesQuery();
  const {
    data: semesters = [],
    isLoading: semestersLoading,
    refetch: refetchSemesters,
  } = useGetSemestersQuery();

  // Calculate elective credits
  const electiveCredits = courses
    .filter((course) => course.isElective)
    .reduce((total, course) => total + course.credits, 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCGPA(), refetchCourses(), refetchSemesters()]);
    setRefreshing(false);
  };

  const isLoading = cgpaLoading || coursesLoading || semestersLoading;

  // if (isLoading) {
  //   return (
  //     <ScreenView>
  //       <View className="flex-1 items-center justify-center">
  //         <ActivityIndicator
  //           colorClassName="accent-primary active:accent-primary"
  //           className=""
  //         />
  //       </View>
  //     </ScreenView>
  //   );
  // }

  return (
    <ScreenView>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          <Text className="text-foreground text-center text-2xl font-bold mb-4">
            Academic Overview
          </Text>

          {isLoading ? (
            <View className="py-8">
              <ActivityIndicator colorClassName="accent-primary active:accent-primary" />
            </View>
          ) : (
            <>
              <CGPACard cgpa={cgpa} electiveCredits={electiveCredits} />

              <View className="mb-4">
                <Text className="text-foreground text-lg font-semibold mb-3">
                  Semesters ({semesters.length})
                </Text>
              </View>

              {semesters.length === 0 ? (
                <View className="bg-card rounded-lg p-6 mb-6 border border-border">
                  <Text className="text-center text-muted-foreground">
                    No semesters yet. Add a semester to get started!
                  </Text>
                </View>
              ) : (
                <View className="mb-6">
                  {semesters.map((semester) => (
                    <SemesterCard key={semester.id} semester={semester} />
                  ))}
                </View>
              )}

              <View className="mb-4">
                <Text className="text-foreground text-lg font-semibold mb-3">
                  All Courses ({courses.length})
                </Text>
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
            </>
          )}
        </View>
      </ScrollView>
      {/*<View className="p-4 flex-col justify-between gap-4">
        <View className="flex-row justify-between gap-4">
          <Button size="lg" route={{ href: "/add-course" }}>
            Add Course
          </Button>

          <Button size="lg" route={{ href: "/add-semester" }}>
            Add Semester
          </Button>
        </View>

        <Button
          size="lg"
          route={{
            href: "/settings",
          }}
        >
          Settings
        </Button>
      </View>*/}
    </ScreenView>
  );
}

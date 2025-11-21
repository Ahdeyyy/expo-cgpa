import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as db from "../index";
import * as schema from "../schema";

// Query Keys
export const queryKeys = {
  semesters: ["semesters"] as const,
  courses: ["courses"] as const,
  coursesBySemester: (semesterId: number) =>
    ["courses", "semester", semesterId] as const,
  gpa: (semesterId: number) => ["gpa", semesterId] as const,
  cgpa: ["cgpa"] as const,
};

// Semester Hooks
export function useAddSemesterQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semester: schema.InsertSemester) => db.newSemester(semester),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.semesters });
      queryClient.invalidateQueries({ queryKey: queryKeys.cgpa });
    },
  });
}

export function useGetSemestersQuery() {
  return useQuery({
    queryKey: queryKeys.semesters,
    queryFn: () => db.getSemesters(),
  });
}

export function useDeleteSemesterQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semesterId: number) => db.deleteSemester(semesterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.semesters });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
      queryClient.invalidateQueries({ queryKey: queryKeys.cgpa });
    },
  });
}

export function useUpdateSemesterQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      semesterId,
      updatedSemester,
    }: {
      semesterId: number;
      updatedSemester: Partial<schema.InsertSemester>;
    }) => db.updateSemester(semesterId, updatedSemester),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.semesters });
    },
  });
}

// Course Hooks
export function useAddCourseQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (course: schema.InsertCourse) => db.addCourseToSemester(course),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
      queryClient.invalidateQueries({
        queryKey: queryKeys.coursesBySemester(variables.semesterId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.gpa(variables.semesterId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.cgpa });
    },
  });
}

export function useGetCoursesQuery(semesterId?: number) {
  return useQuery({
    queryKey: semesterId
      ? queryKeys.coursesBySemester(semesterId)
      : queryKeys.courses,
    queryFn: () =>
      semesterId !== undefined
        ? db.getCoursesBySemesterId(semesterId)
        : db.getAllCourses(),
  });
}

export function useDeleteCourseQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) => db.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
      queryClient.invalidateQueries({ queryKey: queryKeys.cgpa });
    },
  });
}

export function useUpdateCourseQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      updatedCourse,
    }: {
      courseId: number;
      updatedCourse: Partial<schema.InsertCourse>;
    }) => db.updateCourse(courseId, updatedCourse),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
      if (variables.updatedCourse.semesterId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.coursesBySemester(
            variables.updatedCourse.semesterId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.gpa(variables.updatedCourse.semesterId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.cgpa });
    },
  });
}

// GPA Hooks
export function useGetGPAQuery(semesterId: number) {
  return useQuery({
    queryKey: queryKeys.gpa(semesterId),
    queryFn: () => db.getGPABySemesterId(semesterId),
    enabled: semesterId !== undefined,
  });
}

export function useGetCGPAQuery() {
  return useQuery({
    queryKey: queryKeys.cgpa,
    queryFn: () => db.getCGPA(),
  });
}

import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";

import * as schema from "./schema";
import { eq } from "drizzle-orm";

const expo = SQLite.openDatabaseSync("grades.db");

export const db = drizzle(expo, { schema });

export const newSemester = async (
  semester: schema.InsertSemester,
): Promise<void> => {
  await db.insert(schema.semesters).values(semester);
};

export const getSemesters = async (): Promise<schema.SelectSemester[]> => {
  return await db.select().from(schema.semesters);
};

export const deleteSemester = async (semesterId: number): Promise<void> => {
  await db.delete(schema.semesters).where(eq(schema.semesters.id, semesterId));
};

export const getSemesterById = async (
  semesterId: number,
): Promise<schema.SelectSemester | undefined> => {
  return await db.query.semesters.findFirst({
    where: eq(schema.semesters.id, semesterId),
  });
};

export const getCoursesBySemesterId = async (semesterId: number) => {
  return await db.query.courses.findMany({
    where: eq(schema.courses.semesterId, semesterId),
  });
};

export const addCourseToSemester = async (course: schema.InsertCourse) => {
  await db.insert(schema.courses).values(course);
};

export const deleteCourse = async (courseId: number): Promise<void> => {
  await db.delete(schema.courses).where(eq(schema.courses.id, courseId));
};

export const updateCourse = async (
  courseId: number,
  updatedCourse: Partial<schema.InsertCourse>,
): Promise<void> => {
  await db
    .update(schema.courses)
    .set(updatedCourse)
    .where(eq(schema.courses.id, courseId));
};

export const updateSemester = async (
  semesterId: number,
  updatedSemester: Partial<schema.InsertSemester>,
): Promise<void> => {
  await db
    .update(schema.semesters)
    .set(updatedSemester)
    .where(eq(schema.semesters.id, semesterId));
};

export const getGPABySemesterId = async (
  semesterId: number,
): Promise<number> => {
  const courses = await getCoursesBySemesterId(semesterId);

  if (courses.length === 0) return 0.0;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const course of courses) {
    if (course.countsTowardsCGPA) {
      const gradePoint = gradeToGradePoint(course.grade);
      totalPoints += gradePoint * course.credits;
      totalCredits += course.credits;
    }
  }

  return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
};

export const getCGPA = async (): Promise<number> => {
  const semesters = await getSemesters();

  if (semesters.length === 0) return 0.0;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const semester of semesters) {
    const courses = await getCoursesBySemesterId(semester.id);

    for (const course of courses) {
      if (course.countsTowardsCGPA) {
        const gradePoint = gradeToGradePoint(course.grade);
        totalPoints += gradePoint * course.credits;
        totalCredits += course.credits;
      }
    }
  }

  console.log("Total Points:", totalPoints, "Total Credits:", totalCredits);

  return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
};

export const getAllCourses = async (): Promise<schema.SelectCourse[]> => {
  return await db.select().from(schema.courses);
};

export const gradeToGradePoint = (grade: string): number => {
  const gradeMap: { [key: string]: number } = {
    A: 5.0,
    B: 4.0,
    C: 3.0,
    D: 2.0,
    E: 1.0,
    F: 0.0,
  };
  return gradeMap[grade.toUpperCase()] ?? 0.0;
};

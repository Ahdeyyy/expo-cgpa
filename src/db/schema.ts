import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const courses = sqliteTable("courses_table", {
  id: int().primaryKey({ autoIncrement: true }),
  courseName: text().notNull(),
  credits: int().notNull(),
  grade: text().notNull(),
  semesterId: int()
    .notNull()
    .references(() => semesters.id),
  isElective: int({ mode: "boolean" }).notNull().default(false),
  countsTowardsCGPA: int({ mode: "boolean" }).notNull().default(true),
});

export const semesters = sqliteTable("semesters_table", {
  id: int().primaryKey({ autoIncrement: true }),
  semesterName: text().notNull(),
  year: int().notNull(),
});

export const semestersRelations = relations(semesters, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one }) => ({
  semester: one(semesters, {
    fields: [courses.semesterId],
    references: [semesters.id],
  }),
}));

export type SelectCourse = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;
export type SelectSemester = typeof semesters.$inferSelect;
export type InsertSemester = typeof semesters.$inferInsert;

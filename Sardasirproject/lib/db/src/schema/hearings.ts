import { pgTable, text, uuid, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hearingsTable = pgTable("hearings", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id"),
  title: text("title"),
  hearingDate: date("hearing_date", { mode: "string" }),
  courtName: text("court_name"),
  status: text("status").default("scheduled"),
  notes: text("notes"),
  judge: text("judge"),
  advocateId: uuid("advocate_id"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHearingSchema = createInsertSchema(hearingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHearing = z.infer<typeof insertHearingSchema>;
export type Hearing = typeof hearingsTable.$inferSelect;

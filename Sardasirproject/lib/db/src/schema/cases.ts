import { pgTable, text, uuid, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const casesTable = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  caseNumber: text("case_number"),
  description: text("description"),
  status: text("status").default("open"),
  clientId: uuid("client_id"),
  advocateId: uuid("advocate_id"),
  courtName: text("court_name"),
  filingDate: date("filing_date", { mode: "string" }),
  nextHearingDate: date("next_hearing_date", { mode: "string" }),
  tags: jsonb("tags"),
  templateId: uuid("template_id"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaseSchema = createInsertSchema(casesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof casesTable.$inferSelect;

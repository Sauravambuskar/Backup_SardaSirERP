import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const advocatesTable = pgTable("advocates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  barNumber: text("bar_number"),
  specialization: text("specialization"),
  status: text("status").default("active"),
  notes: text("notes"),
  tags: jsonb("tags"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdvocateSchema = createInsertSchema(advocatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAdvocate = z.infer<typeof insertAdvocateSchema>;
export type Advocate = typeof advocatesTable.$inferSelect;

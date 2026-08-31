import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const documentsTable = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  fileUrl: text("file_url"),
  fileType: text("file_type"),
  fileSize: text("file_size"),
  caseId: uuid("case_id"),
  clientId: uuid("client_id"),
  category: text("category"),
  notes: text("notes"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const importantDocumentsTable = pgTable("important_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  fileUrl: text("file_url"),
  fileType: text("file_type"),
  category: text("category"),
  notes: text("notes"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;

export const insertImportantDocumentSchema = createInsertSchema(importantDocumentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertImportantDocument = z.infer<typeof insertImportantDocumentSchema>;
export type ImportantDocument = typeof importantDocumentsTable.$inferSelect;

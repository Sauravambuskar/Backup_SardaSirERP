import { pgTable, text, uuid, timestamp, date, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adviceTable = pgTable("advice", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id"),
  caseId: uuid("case_id"),
  title: text("title"),
  content: text("content"),
  status: text("status").default("pending"),
  advisedBy: uuid("advised_by"),
  advisedDate: date("advised_date", { mode: "string" }),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactsTable = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  organization: text("organization"),
  role: text("role"),
  notes: text("notes"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notesTable = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title"),
  content: text("content"),
  caseId: uuid("case_id"),
  clientId: uuid("client_id"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasksTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending"),
  priority: text("priority").default("medium"),
  dueDate: date("due_date", { mode: "string" }),
  caseId: uuid("case_id"),
  clientId: uuid("client_id"),
  assignedTo: uuid("assigned_to"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const evidenceTable = pgTable("evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id"),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  evidenceType: text("evidence_type"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tagsTable = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mattersTable = pgTable("matters", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("open"),
  clientId: uuid("client_id"),
  caseId: uuid("case_id"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const expenseTypesTable = pgTable("expense_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const expensesTable = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  expenseDate: date("expense_date", { mode: "string" }),
  expenseTypeId: uuid("expense_type_id"),
  caseId: uuid("case_id"),
  clientId: uuid("client_id"),
  notes: text("notes"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const communicationLogsTable = pgTable("communication_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id"),
  caseId: uuid("case_id"),
  type: text("type"),
  subject: text("subject"),
  content: text("content"),
  communicationDate: date("communication_date", { mode: "string" }),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const caseTemplatesTable = pgTable("case_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  tasks: jsonb("tasks"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const caseTemplateTasksTable = pgTable("case_template_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id"),
  title: text("title").notNull(),
  description: text("description"),
  order: text("order"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  action: text("action"),
  tableName: text("table_name"),
  recordId: text("record_id"),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const errorLogsTable = pgTable("error_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  message: text("message"),
  context: text("context"),
  stack: text("stack"),
  userId: uuid("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdviceSchema = createInsertSchema(adviceTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContactSchema = createInsertSchema(contactsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNoteSchema = createInsertSchema(notesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEvidenceSchema = createInsertSchema(evidenceTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTagSchema = createInsertSchema(tagsTable).omit({ id: true, createdAt: true });
export const insertMatterSchema = createInsertSchema(mattersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExpenseTypeSchema = createInsertSchema(expenseTypesTable).omit({ id: true, createdAt: true });
export const insertExpenseSchema = createInsertSchema(expensesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCommunicationLogSchema = createInsertSchema(communicationLogsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCaseTemplateSchema = createInsertSchema(caseTemplatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCaseTemplateTaskSchema = createInsertSchema(caseTemplateTasksTable).omit({ id: true, createdAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, createdAt: true });
export const insertErrorLogSchema = createInsertSchema(errorLogsTable).omit({ id: true, createdAt: true });

export type Advice = typeof adviceTable.$inferSelect;
export type Contact = typeof contactsTable.$inferSelect;
export type Note = typeof notesTable.$inferSelect;
export type Task = typeof tasksTable.$inferSelect;
export type Evidence = typeof evidenceTable.$inferSelect;
export type Tag = typeof tagsTable.$inferSelect;
export type Matter = typeof mattersTable.$inferSelect;
export type ExpenseType = typeof expenseTypesTable.$inferSelect;
export type Expense = typeof expensesTable.$inferSelect;
export type CommunicationLog = typeof communicationLogsTable.$inferSelect;
export type CaseTemplate = typeof caseTemplatesTable.$inferSelect;
export type CaseTemplateTask = typeof caseTemplateTasksTable.$inferSelect;
export type AuditLog = typeof auditLogsTable.$inferSelect;
export type ErrorLog = typeof errorLogsTable.$inferSelect;

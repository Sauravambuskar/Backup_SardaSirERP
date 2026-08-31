-- ============================================================
-- LAWMIND — MySQL Schema (Hostinger compatible)
-- Import this ONCE in phpMyAdmin (Hostinger → Databases → phpMyAdmin)
-- Compatible with MySQL 5.7+ and MariaDB 10.2+
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ────────────────────────────────────────────────────────────
-- USERS (replaces auth.users from Supabase)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  email_confirmed TINYINT(1) NOT NULL DEFAULT 1,
  raw_user_meta_data JSON,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36) NOT NULL UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        VARCHAR(20) NOT NULL DEFAULT 'agent',
  status      VARCHAR(20) NOT NULL DEFAULT 'active',
  phone       TEXT,
  email       TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_profiles_role CHECK (role IN ('super_admin','admin','agent','lawyer')),
  CONSTRAINT chk_profiles_status CHECK (status IN ('active','inactive')),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- CLIENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255),
  phone       VARCHAR(50),
  city        VARCHAR(100),
  state       VARCHAR(100),
  country     VARCHAR(100),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_clients_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- ADVOCATES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS advocates (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(50),
  specialization  VARCHAR(100),
  bar_number      VARCHAR(100),
  status          VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_advocates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_advocates_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- MATTERS (practice areas)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matters (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_matters_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- CASES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id       CHAR(36) NOT NULL,
  case_number   VARCHAR(100) NOT NULL,
  title         VARCHAR(500) NOT NULL,
  description   TEXT,
  client_id     CHAR(36),
  advocate_id   CHAR(36),
  matter_id     CHAR(36),
  status        VARCHAR(50) NOT NULL DEFAULT 'open',
  case_type     VARCHAR(100),
  court_name    VARCHAR(255),
  filing_date   DATE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cases_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cases_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  CONSTRAINT fk_cases_advocate FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE SET NULL,
  CONSTRAINT fk_cases_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE SET NULL,
  INDEX idx_cases_user (user_id),
  INDEX idx_cases_client (client_id),
  INDEX idx_cases_matter (matter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- HEARINGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hearings (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id       CHAR(36) NOT NULL,
  case_id       CHAR(36) NOT NULL,
  hearing_date  DATETIME NOT NULL,
  court_name    VARCHAR(255),
  judge_name    VARCHAR(255),
  purpose       TEXT,
  status        VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  notes         TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_hearings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_hearings_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  INDEX idx_hearings_case (case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- ADVICE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS advice (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id       CHAR(36) NOT NULL,
  client_id     CHAR(36),
  case_id       CHAR(36),
  subject       VARCHAR(500) NOT NULL,
  description   TEXT,
  advice_date   DATE NOT NULL DEFAULT (CURRENT_DATE),
  status        VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_advice_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_advice_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  CONSTRAINT fk_advice_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- EVIDENCE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  case_id         CHAR(36) NOT NULL,
  title           VARCHAR(500) NOT NULL,
  description     TEXT,
  evidence_type   VARCHAR(100),
  file_url        TEXT,
  submitted_date  DATE DEFAULT (CURRENT_DATE),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_evidence_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_evidence_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- INVOICES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  case_id         CHAR(36),
  client_id       CHAR(36),
  invoice_number  VARCHAR(100) NOT NULL,
  amount          DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax             DECIMAL(12,2) NOT NULL DEFAULT 0,
  total           DECIMAL(12,2) NOT NULL DEFAULT 0,
  status          VARCHAR(50) NOT NULL DEFAULT 'draft',
  due_date        DATE,
  paid_date       DATE,
  notes           TEXT,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_invoices_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
  CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- PAYMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  invoice_id    CHAR(36) NOT NULL,
  amount_paid   DECIMAL(10,2) NOT NULL,
  payment_date  DATE NOT NULL DEFAULT (CURRENT_DATE),
  method        VARCHAR(50) NOT NULL,
  reference_no  VARCHAR(255),
  notes         TEXT,
  user_id       CHAR(36) NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_payments_amount CHECK (amount_paid > 0),
  CONSTRAINT chk_payments_method CHECK (method IN ('cash','upi','bank_transfer','cheque','dd','other')),
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_payments_invoice (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- DOCUMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id       CHAR(36) NOT NULL,
  case_id       CHAR(36),
  title         VARCHAR(500) NOT NULL,
  description   TEXT,
  document_type VARCHAR(100),
  file_url      TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- EXPENSES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id       CHAR(36) NOT NULL,
  case_id       CHAR(36),
  title         VARCHAR(500) NOT NULL,
  description   TEXT,
  amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
  expense_date  DATE NOT NULL DEFAULT (CURRENT_DATE),
  category      VARCHAR(100),
  receipt_url   TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_expenses_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- CONTACTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id       CHAR(36) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(50),
  company       VARCHAR(255),
  designation   VARCHAR(255),
  contact_type  VARCHAR(50) NOT NULL DEFAULT 'general',
  notes         TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contacts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- NOTES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36) NOT NULL,
  case_id     CHAR(36),
  client_id   CHAR(36),
  title       VARCHAR(500) NOT NULL,
  content     TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- TAGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(20) DEFAULT '#6366f1',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tags_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- EXPENSE TYPES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_types (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_expense_types_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- TASKS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title         VARCHAR(500) NOT NULL,
  description   TEXT,
  status        VARCHAR(50) NOT NULL DEFAULT 'todo',
  priority      VARCHAR(20) NOT NULL DEFAULT 'medium',
  due_date      DATE,
  case_id       CHAR(36),
  assigned_to   CHAR(36),
  created_by    CHAR(36),
  user_id       CHAR(36) NOT NULL,
  completed_at  DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_tasks_status CHECK (status IN ('todo','in_progress','done')),
  CONSTRAINT chk_tasks_priority CHECK (priority IN ('high','medium','low')),
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_tasks_assigned (assigned_to),
  INDEX idx_tasks_case (case_id),
  INDEX idx_tasks_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- CASE TEMPLATES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_templates (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  category    VARCHAR(100),
  user_id     CHAR(36) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ct_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS case_template_tasks (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  template_id CHAR(36) NOT NULL,
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  days_offset INT NOT NULL DEFAULT 0,
  priority    VARCHAR(20) NOT NULL DEFAULT 'medium',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_ctt_priority CHECK (priority IN ('low','medium','high','urgent')),
  CONSTRAINT fk_ctt_template FOREIGN KEY (template_id) REFERENCES case_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- COMMUNICATION LOGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communication_logs (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  client_id   CHAR(36),
  case_id     CHAR(36),
  type        VARCHAR(50) NOT NULL,
  date        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  summary     TEXT NOT NULL,
  notes       TEXT,
  user_id     CHAR(36) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_comm_type CHECK (type IN ('call','email','meeting','message','letter','other')),
  CONSTRAINT fk_comm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comm_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_comm_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  INDEX idx_comm_client (client_id),
  INDEX idx_comm_case (case_id),
  INDEX idx_comm_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- AUDIT LOGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36),
  action      VARCHAR(50) NOT NULL,
  table_name  VARCHAR(100) NOT NULL,
  record_id   VARCHAR(100),
  old_data    JSON,
  new_data    JSON,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_table (table_name),
  INDEX idx_audit_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- ERROR LOGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS error_logs (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36),
  message     TEXT NOT NULL,
  context     TEXT,
  stack       TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_error_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- AI CONFIG
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_config (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  provider    VARCHAR(50) NOT NULL UNIQUE,
  api_key     TEXT NOT NULL,
  model       VARCHAR(100) NOT NULL DEFAULT '',
  base_url    TEXT,
  is_active   TINYINT(1) NOT NULL DEFAULT 0,
  updated_by  CHAR(36),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_ai_provider CHECK (provider IN ('groq','openai','gemini','custom')),
  CONSTRAINT fk_ai_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO ai_config (provider, api_key, model, is_active) VALUES
  ('groq', '', 'llama-3.3-70b-versatile', 1),
  ('openai', '', 'gpt-4o-mini', 0),
  ('gemini', '', 'gemini-2.0-flash', 0),
  ('custom', '', '', 0);

-- ────────────────────────────────────────────────────────────
-- APP SETTINGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
  `key`       VARCHAR(100) PRIMARY KEY,
  value       JSON NOT NULL,
  updated_by  CHAR(36),
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_settings_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO app_settings (`key`, value) VALUES ('ai_autofill', '{"enabled": false}');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DONE. Schema ready for Hostinger MySQL.
-- After importing: sign up your first user in the app,
-- then run:
--   UPDATE profiles SET role='super_admin' WHERE user_id=(SELECT id FROM users WHERE email='YOUR_EMAIL');
-- ============================================================

// ============================================================
// LAWMIND — Supabase client shim
// All code imports { supabase } from here.
// This re-exports the MySQL/PHP client so every existing
// import continues to work without any other file changes.
// ============================================================
import { mysqlClient } from "@/integrations/mysql/client";

export const supabase = mysqlClient;

// Keep window.supabase for any legacy inline scripts / devtools
(window as any).supabase = mysqlClient;

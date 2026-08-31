import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";
import { requireAuth } from "./auth";

const router: IRouter = Router();

const ALLOWED_TABLES = [
  "users", "profiles", "clients", "cases", "advocates", "hearings",
  "invoices", "payments", "documents", "important_documents",
  "advice", "contacts", "notes", "tasks", "evidence", "tags", "matters",
  "expense_types", "expenses", "communication_logs", "case_templates",
  "case_template_tasks", "audit_logs", "error_logs",
];

function validateTable(table: string): boolean {
  return ALLOWED_TABLES.includes(table);
}

function sanitizeCol(col: string): string {
  return col.replace(/[^a-zA-Z0-9_]/g, "");
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function castVal(val: any): { placeholder: string; value: any } {
  if (typeof val === "string" && UUID_RE.test(val)) {
    return { placeholder: "$IDX::uuid", value: val };
  }
  return { placeholder: "$IDX", value: val };
}

function buildWhereClause(filters: any[], paramOffset = 0): { clause: string; params: any[] } {
  if (!filters || filters.length === 0) return { clause: "", params: [] };
  const parts: string[] = [];
  const params: any[] = [];

  function addParam(val: any): string {
    const { placeholder, value } = castVal(val);
    params.push(value);
    return placeholder.replace("$IDX", `$${params.length + paramOffset}`);
  }

  for (const f of filters) {
    const col = `"${sanitizeCol(f.col)}"`;
    switch (f.op) {
      case "eq":
        parts.push(`${col} = ${addParam(f.val)}`);
        break;
      case "neq":
        parts.push(`${col} != ${addParam(f.val)}`);
        break;
      case "gt":
        parts.push(`${col} > ${addParam(f.val)}`);
        break;
      case "gte":
        parts.push(`${col} >= ${addParam(f.val)}`);
        break;
      case "lt":
        parts.push(`${col} < ${addParam(f.val)}`);
        break;
      case "lte":
        parts.push(`${col} <= ${addParam(f.val)}`);
        break;
      case "like":
        parts.push(`${col} LIKE ${addParam(f.val)}`);
        break;
      case "ilike":
        parts.push(`${col} ILIKE ${addParam(f.val)}`);
        break;
      case "is":
        if (f.val === null) {
          parts.push(`${col} IS NULL`);
        } else {
          parts.push(`${col} IS NOT DISTINCT FROM ${addParam(f.val)}`);
        }
        break;
      case "in":
        if (Array.isArray(f.val) && f.val.length > 0) {
          const placeholders = f.val.map((v: any) => addParam(v));
          parts.push(`${col} IN (${placeholders.join(", ")})`);
        }
        break;
    }
  }
  return { clause: parts.length > 0 ? `WHERE ${parts.join(" AND ")}` : "", params };
}

async function query(sql: string, params: any[] = []): Promise<any[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

router.post("/crud.php", requireAuth, async (req, res): Promise<void> => {
  const table = req.query["table"] as string;
  if (!table || !validateTable(table)) {
    res.status(400).json({ error: "Invalid or missing table name" });
    return;
  }

  const {
    action = "select",
    filters = [],
    order = [],
    limit,
    offset,
    single,
    maybe_single,
    count,
    embed = [],
    rows,
    data: updateData,
  } = req.body;

  const validActions = ["select", "insert", "update", "delete"];
  if (!validActions.includes(action)) {
    res.status(400).json({ error: "Invalid action" });
    return;
  }

  try {
    if (action === "select") {
      const { clause: whereClause, params } = buildWhereClause(filters);

      const orderParts = (order || []).map((o: any) => {
        const col = `"${sanitizeCol(o.column)}"`;
        const dir = o.ascending === false ? "DESC" : "ASC";
        return `${col} ${dir}`;
      });
      const orderSql = orderParts.length > 0 ? `ORDER BY ${orderParts.join(", ")}` : "";

      if (count) {
        const countSql = `SELECT COUNT(*) as total FROM "${table}" ${whereClause}`;
        const countRows = await query(countSql, params);
        const totalCount = parseInt(countRows[0]?.total || "0", 10);

        let dataSql = `SELECT * FROM "${table}" ${whereClause} ${orderSql}`;
        if (limit) dataSql += ` LIMIT ${parseInt(limit, 10)}`;
        if (offset) dataSql += ` OFFSET ${parseInt(offset, 10)}`;
        const dataRows = await query(dataSql, params);
        res.json({ data: dataRows, error: null, count: totalCount });
        return;
      }

      let selectSql = `SELECT * FROM "${table}" ${whereClause} ${orderSql}`;
      if (single || maybe_single) {
        selectSql += ` LIMIT 1`;
      } else {
        if (limit) selectSql += ` LIMIT ${parseInt(limit, 10)}`;
        if (offset) selectSql += ` OFFSET ${parseInt(offset, 10)}`;
      }

      let resultData = await query(selectSql, params);

      // Handle embeds via separate queries
      if (embed && embed.length > 0 && resultData.length > 0) {
        for (const emb of embed) {
          const embTable = emb.table;
          if (!validateTable(embTable)) continue;
          const fk = sanitizeCol(emb.fk);
          const ids = resultData.map((r: any) => r.id).filter(Boolean);
          if (ids.length === 0) continue;
          const placeholders = ids.map((_: any, i: number) => `$${i + 1}`);
          const embSql = `SELECT * FROM "${embTable}" WHERE "${fk}" = ANY($1::uuid[])`;
          const embRows = await query(embSql, [ids]);
          for (const row of resultData) {
            (row as any)[emb.as] = embRows.filter((r: any) => r[fk] === row.id);
          }
        }
      }

      if (single) {
        if (resultData.length === 0) {
          res.json({ data: null, error: { message: "Record not found", code: "PGRST116" } });
          return;
        }
        res.json({ data: resultData[0], error: null });
        return;
      }
      if (maybe_single) {
        res.json({ data: resultData[0] ?? null, error: null });
        return;
      }
      res.json({ data: resultData, error: null });
      return;
    }

    if (action === "insert") {
      if (!rows || rows.length === 0) {
        res.status(400).json({ error: "No rows provided for insert" });
        return;
      }
      const allKeys: string[] = Array.from(new Set(rows.flatMap((r: any) => Object.keys(r))));
      const cols = allKeys.map((k) => `"${sanitizeCol(k)}"`).join(", ");
      const insertedRows: any[] = [];
      for (const row of rows) {
        const vals = allKeys.map((k) => row[k] ?? null);
        const placeholders = vals.map((_: any, i: number) => `$${i + 1}`).join(", ");
        const q = `INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) RETURNING *`;
        const inserted = await query(q, vals);
        if (inserted[0]) insertedRows.push(inserted[0]);
      }
      const returnVal = insertedRows.length === 1 ? insertedRows[0] : insertedRows;
      res.json({ data: returnVal, error: null });
      return;
    }

    if (action === "update") {
      if (!updateData || Object.keys(updateData).length === 0) {
        res.status(400).json({ error: "No data provided for update" });
        return;
      }
      const keys = Object.keys(updateData);
      const vals = keys.map((k) => updateData[k]);
      const setClauses = keys.map((k, i) => `"${sanitizeCol(k)}" = $${i + 1}`).join(", ");
      const { clause: whereClause, params: whereParams } = buildWhereClause(filters, keys.length);
      const allParams = [...vals, ...whereParams];
      const q = `UPDATE "${table}" SET ${setClauses} ${whereClause} RETURNING *`;
      const updated = await query(q, allParams);
      res.json({ data: updated, error: null });
      return;
    }

    if (action === "delete") {
      const { clause: whereClause, params } = buildWhereClause(filters);
      const q = `DELETE FROM "${table}" ${whereClause} RETURNING *`;
      const deleted = await query(q, params);
      res.json({ data: deleted, error: null });
      return;
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (err: any) {
    logger.error({ err, table, action: req.body?.action }, "CRUD error");
    res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

export default router;

<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

// Generic CRUD endpoint
// Path:  /api/crud.php?table=clients
// Body for POST/PATCH/DELETE encodes filters and data.
//
// Request shape (sent by the JS wrapper):
//   POST   ?table=X       body: { action: 'select', columns: '*', filters: [...], order: [...], limit, single }
//   POST   ?table=X       body: { action: 'insert', rows: [{}], returning: true }
//   POST   ?table=X       body: { action: 'update', data: {}, filters: [...], returning: true }
//   POST   ?table=X       body: { action: 'delete', filters: [...] }
//
// All requests require Authorization: Bearer <jwt>
// user_id filter is enforced server-side for non-global tables.

$user = current_user(true);

$table = $_GET['table'] ?? '';
if (!$table) json_error('table parameter required', 400);
ensure_table_allowed($table);

$body = input_json();
$action = $body['action'] ?? 'select';

$isGlobal = in_array($table, global_tables(), true);

// ── BUILD WHERE CLAUSE FROM FILTERS ─────────────────────────
function build_where(array $filters, array &$params, ?string $userId, bool $scopeUser, string $table): string {
    $clauses = [];
    foreach ($filters as $i => $f) {
        $op  = $f['op']  ?? 'eq';
        $col = $f['col'] ?? null;
        $val = $f['val'] ?? null;
        if (!$col || !preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $col)) continue;
        $ph = ":f{$i}";
        switch ($op) {
            case 'eq':   $clauses[] = "`$col` = $ph"; $params[$ph] = $val; break;
            case 'neq':  $clauses[] = "`$col` <> $ph"; $params[$ph] = $val; break;
            case 'gt':   $clauses[] = "`$col` > $ph"; $params[$ph] = $val; break;
            case 'gte':  $clauses[] = "`$col` >= $ph"; $params[$ph] = $val; break;
            case 'lt':   $clauses[] = "`$col` < $ph"; $params[$ph] = $val; break;
            case 'lte':  $clauses[] = "`$col` <= $ph"; $params[$ph] = $val; break;
            case 'like': $clauses[] = "`$col` LIKE $ph"; $params[$ph] = $val; break;
            case 'ilike':$clauses[] = "LOWER(`$col`) LIKE LOWER($ph)"; $params[$ph] = $val; break;
            case 'is':
                if ($val === null) $clauses[] = "`$col` IS NULL";
                else { $clauses[] = "`$col` = $ph"; $params[$ph] = $val; }
                break;
            case 'in':
                if (is_array($val) && count($val) > 0) {
                    $phs = [];
                    foreach ($val as $j => $v) { $phs[] = ":f{$i}_{$j}"; $params[":f{$i}_{$j}"] = $v; }
                    $clauses[] = "`$col` IN (" . implode(',', $phs) . ")";
                } else {
                    $clauses[] = "1=0";
                }
                break;
        }
    }
    if ($scopeUser && $userId) {
        $clauses[] = "`user_id` = :__uid";
        $params[':__uid'] = $userId;
    }
    if (empty($clauses)) return '';
    return ' WHERE ' . implode(' AND ', $clauses);
}

function build_order(array $order): string {
    $parts = [];
    foreach ($order as $o) {
        $col = $o['column'] ?? null;
        if (!$col || !preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $col)) continue;
        $dir = (!empty($o['ascending'])) ? 'ASC' : 'DESC';
        $parts[] = "`$col` $dir";
    }
    return $parts ? ' ORDER BY ' . implode(', ', $parts) : '';
}

$pdo = db();

// ── SELECT ──────────────────────────────────────────────────
if ($action === 'select') {
    $filters = $body['filters'] ?? [];
    $params  = [];
    $where   = build_where($filters, $params, $user['id'], !$isGlobal, $table);
    $order   = build_order($body['order'] ?? []);
    $limit   = isset($body['limit']) ? ' LIMIT ' . (int)$body['limit'] : '';
    $offset  = isset($body['offset']) ? ' OFFSET ' . (int)$body['offset'] : '';

    // Optional count of total matching rows (for pagination)
    $count = null;
    if (!empty($body['count'])) {
        $cstmt = $pdo->prepare("SELECT COUNT(*) FROM `$table`$where");
        $cstmt->execute($params);
        $count = (int)$cstmt->fetchColumn();
    }

    $sql = "SELECT * FROM `$table`$where$order$limit$offset";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    // Optional embedded relations (very simple Supabase-style joins)
    // Format: embed: [{table: 'clients', as: 'clients', fk: 'client_id'}, ...]
    if (!empty($body['embed']) && is_array($body['embed']) && count($rows) > 0) {
        foreach ($body['embed'] as $em) {
            $relTable = $em['table'] ?? null;
            $as       = $em['as'] ?? $relTable;
            $fk       = $em['fk'] ?? null;
            $pk       = $em['pk'] ?? 'id';
            $isMany   = !empty($em['many']);  // true → array, false → single object
            if (!$relTable || !in_array($relTable, allowed_tables(), true) || !$fk) continue;
            if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $fk)) continue;
            if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $pk)) continue;

            if ($isMany) {
                // hasMany: relTable rows where relTable.fk = parent.pk
                $ids = array_filter(array_map(fn($r) => $r[$pk] ?? null, $rows));
                if (empty($ids)) { foreach ($rows as &$r) $r[$as] = []; unset($r); continue; }
                $phs = implode(',', array_fill(0, count($ids), '?'));
                $relStmt = $pdo->prepare("SELECT * FROM `$relTable` WHERE `$fk` IN ($phs)");
                $relStmt->execute(array_values($ids));
                $relRows = $relStmt->fetchAll();
                $grouped = [];
                foreach ($relRows as $rr) { $grouped[$rr[$fk]][] = $rr; }
                foreach ($rows as &$r) { $r[$as] = $grouped[$r[$pk]] ?? []; }
                unset($r);
            } else {
                // belongsTo: parent.fk = relTable.pk
                $ids = array_filter(array_map(fn($r) => $r[$fk] ?? null, $rows));
                if (empty($ids)) { foreach ($rows as &$r) $r[$as] = null; unset($r); continue; }
                $phs = implode(',', array_fill(0, count($ids), '?'));
                $relStmt = $pdo->prepare("SELECT * FROM `$relTable` WHERE `$pk` IN ($phs)");
                $relStmt->execute(array_values($ids));
                $relRows = $relStmt->fetchAll();
                $byId = [];
                foreach ($relRows as $rr) { $byId[$rr[$pk]] = $rr; }
                foreach ($rows as &$r) { $r[$as] = $byId[$r[$fk]] ?? null; }
                unset($r);
            }
        }
    }

    if (!empty($body['single'])) {
        if (count($rows) === 0) {
            json_response(['data' => null, 'error' => ['message' => 'No rows found', 'code' => 'PGRST116'], 'count' => $count]);
        }
        json_response(['data' => $rows[0], 'error' => null, 'count' => $count]);
    }
    if (!empty($body['maybe_single'])) {
        json_response(['data' => $rows[0] ?? null, 'error' => null, 'count' => $count]);
    }

    json_response(['data' => $rows, 'error' => null, 'count' => $count]);
}

// ── INSERT ──────────────────────────────────────────────────
if ($action === 'insert') {
    $rowsIn = $body['rows'] ?? [];
    if (!is_array($rowsIn) || count($rowsIn) === 0) json_error('rows required', 400);

    $inserted = [];
    foreach ($rowsIn as $row) {
        if (!$isGlobal && empty($row['user_id'])) $row['user_id'] = $user['id'];
        if (empty($row['id'])) $row['id'] = uuid();

        $cols = [];
        $phs  = [];
        $params = [];
        foreach ($row as $k => $v) {
            if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $k)) continue;
            $cols[] = "`$k`";
            $phs[]  = ":$k";
            $params[":$k"] = is_array($v) || is_object($v) ? json_encode($v) : $v;
        }
        $sql = "INSERT INTO `$table` (" . implode(',', $cols) . ") VALUES (" . implode(',', $phs) . ")";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } catch (PDOException $e) {
            json_error('Insert failed: ' . $e->getMessage(), 400);
        }

        $sel = $pdo->prepare("SELECT * FROM `$table` WHERE id = ? LIMIT 1");
        $sel->execute([$row['id']]);
        $inserted[] = $sel->fetch();
    }

    if (!empty($body['single'])) {
        json_response(['data' => $inserted[0] ?? null, 'error' => null]);
    }
    json_response(['data' => $inserted, 'error' => null]);
}

// ── UPDATE ──────────────────────────────────────────────────
if ($action === 'update') {
    $data = $body['data'] ?? [];
    if (!is_array($data) || count($data) === 0) json_error('data required', 400);
    $filters = $body['filters'] ?? [];
    if (count($filters) === 0) json_error('At least one filter required for update', 400);

    $sets = [];
    $params = [];
    foreach ($data as $k => $v) {
        if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $k)) continue;
        if ($k === 'id' || $k === 'user_id' || $k === 'created_at') continue;
        $sets[] = "`$k` = :s_$k";
        $params[":s_$k"] = is_array($v) || is_object($v) ? json_encode($v) : $v;
    }
    if (empty($sets)) json_error('No valid fields to update', 400);

    $where = build_where($filters, $params, $user['id'], !$isGlobal, $table);
    if (!$where) json_error('Filter required', 400);

    $sql = "UPDATE `$table` SET " . implode(',', $sets) . $where;
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    } catch (PDOException $e) {
        json_error('Update failed: ' . $e->getMessage(), 400);
    }

    // Return affected rows
    $selParams = [];
    $selWhere  = build_where($filters, $selParams, $user['id'], !$isGlobal, $table);
    $sel = $pdo->prepare("SELECT * FROM `$table`$selWhere");
    $sel->execute($selParams);
    $rows = $sel->fetchAll();

    if (!empty($body['single'])) {
        json_response(['data' => $rows[0] ?? null, 'error' => null]);
    }
    json_response(['data' => $rows, 'error' => null]);
}

// ── DELETE ──────────────────────────────────────────────────
if ($action === 'delete') {
    $filters = $body['filters'] ?? [];
    if (count($filters) === 0) json_error('At least one filter required for delete', 400);

    $params = [];
    $where  = build_where($filters, $params, $user['id'], !$isGlobal, $table);
    if (!$where) json_error('Filter required', 400);

    // Fetch rows being deleted for return value
    $sel = $pdo->prepare("SELECT * FROM `$table`$where");
    $sel->execute($params);
    $rows = $sel->fetchAll();

    $stmt = $pdo->prepare("DELETE FROM `$table`$where");
    $stmt->execute($params);

    json_response(['data' => $rows, 'error' => null]);
}

json_error('Unknown action: ' . $action, 400);

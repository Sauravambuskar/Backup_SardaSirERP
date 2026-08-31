<?php
// PDO database connection + utility helpers

function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $config = require __DIR__ . '/config.php';
    $dsn = "mysql:host={$config['db_host']};dbname={$config['db_name']};charset={$config['db_charset']}";
    try {
        $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        ]);
    } catch (PDOException $e) {
        json_error('Database connection failed: ' . $e->getMessage(), 500);
    }
    return $pdo;
}

function get_config(): array {
    static $cfg = null;
    if ($cfg === null) $cfg = require __DIR__ . '/config.php';
    return $cfg;
}

function uuid(): string {
    return db()->query("SELECT UUID() AS u")->fetch()['u'];
}

function json_response($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $msg, int $status = 400, $extra = null): void {
    $payload = ['error' => $msg, 'message' => $msg];
    if ($extra !== null) $payload['details'] = $extra;
    json_response($payload, $status);
}

function input_json(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    if (!is_array($data)) return [];
    return $data;
}

// Allowed tables for the generic CRUD endpoint (whitelist for security)
function allowed_tables(): array {
    return [
        'profiles', 'clients', 'advocates', 'matters', 'cases', 'hearings',
        'advice', 'evidence', 'invoices', 'payments', 'documents', 'expenses',
        'contacts', 'notes', 'tags', 'expense_types', 'tasks',
        'case_templates', 'case_template_tasks', 'communication_logs',
        'audit_logs', 'error_logs', 'ai_config', 'app_settings',
    ];
}

function ensure_table_allowed(string $table): void {
    if (!in_array($table, allowed_tables(), true)) {
        json_error("Table '$table' is not allowed", 403);
    }
}

// Tables that are global (not scoped by user_id)
function global_tables(): array {
    return ['ai_config', 'app_settings', 'case_templates', 'case_template_tasks',
            'communication_logs', 'payments', 'tasks', 'audit_logs'];
}

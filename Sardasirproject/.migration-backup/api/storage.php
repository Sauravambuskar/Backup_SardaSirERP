<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

$user   = current_user(true);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? 'upload';
$cfg    = get_config();

$baseDir = rtrim($cfg['upload_dir'], '/\\');
$baseUrl = rtrim($cfg['upload_url'], '/');

if (!is_dir($baseDir)) @mkdir($baseDir, 0755, true);

// ── UPLOAD ──────────────────────────────────────────────────
if ($action === 'upload') {
    if ($method !== 'POST') json_error('POST required', 405);
    if (empty($_FILES['file'])) json_error('No file uploaded', 400);

    $f = $_FILES['file'];
    if ($f['error'] !== UPLOAD_ERR_OK) json_error('Upload error code ' . $f['error'], 400);
    if ($f['size'] > $cfg['max_upload_size']) json_error('File too large', 400);

    // Path: <userId>/<provided-path-or-uuid>
    $reqPath = $_POST['path'] ?? '';
    $reqPath = preg_replace('/[^A-Za-z0-9_\-\/\.]/', '', $reqPath);
    if (!$reqPath) {
        $ext = pathinfo($f['name'], PATHINFO_EXTENSION);
        $reqPath = uuid() . ($ext ? ".$ext" : '');
    }
    $relative = $user['id'] . '/' . ltrim($reqPath, '/');
    $absolute = $baseDir . '/' . $relative;
    $dir = dirname($absolute);
    if (!is_dir($dir)) @mkdir($dir, 0755, true);

    if (!move_uploaded_file($f['tmp_name'], $absolute)) {
        json_error('Could not save file', 500);
    }
    json_response(['data' => ['path' => $relative, 'url' => "$baseUrl/$relative"], 'error' => null]);
}

// ── PUBLIC URL ──────────────────────────────────────────────
if ($action === 'public_url') {
    $path = $_GET['path'] ?? '';
    if (!$path) json_error('path required', 400);
    json_response(['data' => ['publicUrl' => "$baseUrl/" . ltrim($path, '/')], 'error' => null]);
}

// ── DELETE ──────────────────────────────────────────────────
if ($action === 'remove') {
    $body = input_json();
    $paths = $body['paths'] ?? [];
    $removed = [];
    foreach ($paths as $p) {
        $p = preg_replace('/[^A-Za-z0-9_\-\/\.]/', '', $p);
        // Only allow deleting inside user's own folder
        if (strpos($p, $user['id'] . '/') !== 0) continue;
        $abs = $baseDir . '/' . $p;
        if (is_file($abs) && @unlink($abs)) $removed[] = $p;
    }
    json_response(['data' => $removed, 'error' => null]);
}

json_error('Unknown action', 400);

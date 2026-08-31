<?php
// Admin endpoint — create a new user without affecting the caller's session.
// Caller must be super_admin or admin.

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST required', 405);

$me = current_user(true);
$pdo = db();

// Caller role check
$stmt = $pdo->prepare('SELECT role FROM profiles WHERE user_id = ? LIMIT 1');
$stmt->execute([$me['id']]);
$myRole = $stmt->fetchColumn();
if (!in_array($myRole, ['super_admin', 'admin'], true)) {
    json_error('Only admins can create users', 403);
}

$body = input_json();
$email    = trim(strtolower($body['email'] ?? ''));
$password = $body['password'] ?? '';
$fullName = trim($body['full_name'] ?? '');
$role     = $body['role'] ?? 'agent';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Invalid email', 400);
if (strlen($password) < 6) json_error('Password must be at least 6 characters', 400);
if (!in_array($role, ['super_admin', 'admin', 'agent', 'lawyer'], true)) json_error('Invalid role', 400);

// Admins (not super_admins) cannot create super_admins
if ($myRole === 'admin' && $role === 'super_admin') {
    json_error('Only super_admins can create super_admins', 403);
}

$check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$check->execute([$email]);
if ($check->fetch()) json_error('User with this email already exists', 400);

$userId = uuid();
$hash   = password_hash($password, PASSWORD_BCRYPT);
$meta   = json_encode(['full_name' => $fullName]);

$pdo->beginTransaction();
try {
    $pdo->prepare('INSERT INTO users (id, email, password_hash, raw_user_meta_data) VALUES (?, ?, ?, ?)')
        ->execute([$userId, $email, $hash, $meta]);
    $pdo->prepare('INSERT INTO profiles (user_id, full_name, email, role, status) VALUES (?, ?, ?, ?, ?)')
        ->execute([$userId, $fullName, $email, $role, 'active']);
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    json_error('Create user failed: ' . $e->getMessage(), 500);
}

json_response([
    'data' => [
        'user' => [
            'id'    => $userId,
            'email' => $email,
            'user_metadata' => ['full_name' => $fullName],
        ],
    ],
    'error' => null,
]);

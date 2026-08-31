<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST required', 405);

$cfg = get_config();
if (!$cfg['allow_signup']) json_error('Signup is disabled', 403);

$body = input_json();
$email = trim(strtolower($body['email'] ?? ''));
$password = $body['password'] ?? '';
$fullName = trim($body['data']['full_name'] ?? $body['full_name'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Invalid email', 400);
if (strlen($password) < 6) json_error('Password must be at least 6 characters', 400);

$pdo = db();

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
if ($stmt->fetch()) json_error('User with this email already exists', 400);

$userId = uuid();
$hash = password_hash($password, PASSWORD_BCRYPT);
$meta = json_encode(['full_name' => $fullName]);

$pdo->beginTransaction();
try {
    $pdo->prepare('INSERT INTO users (id, email, password_hash, raw_user_meta_data) VALUES (?, ?, ?, ?)')
        ->execute([$userId, $email, $hash, $meta]);

    // Auto-create profile (replaces Supabase handle_new_user trigger)
    $pdo->prepare('INSERT INTO profiles (user_id, full_name, email) VALUES (?, ?, ?)')
        ->execute([$userId, $fullName, $email]);

    // First-ever user becomes super_admin automatically
    $count = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    if ($count === 1) {
        $pdo->prepare("UPDATE profiles SET role = 'super_admin' WHERE user_id = ?")->execute([$userId]);
    }

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    json_error('Signup failed: ' . $e->getMessage(), 500);
}

$token = make_token_for_user($userId);

// Return Supabase-style response so the frontend can use it as-is
json_response([
    'data' => [
        'user' => [
            'id' => $userId,
            'email' => $email,
            'user_metadata' => ['full_name' => $fullName],
            'created_at' => date('c'),
        ],
        'session' => [
            'access_token'  => $token,
            'refresh_token' => $token,
            'expires_at'    => time() + $cfg['jwt_ttl'],
            'expires_in'    => $cfg['jwt_ttl'],
            'token_type'    => 'bearer',
            'user' => [
                'id' => $userId,
                'email' => $email,
                'user_metadata' => ['full_name' => $fullName],
            ],
        ],
    ],
    'error' => null,
]);

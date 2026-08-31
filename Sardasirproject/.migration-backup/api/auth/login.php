<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST required', 405);

$body = input_json();
$email = trim(strtolower($body['email'] ?? ''));
$password = $body['password'] ?? '';

if (!$email || !$password) json_error('Email and password required', 400);

$stmt = db()->prepare('SELECT id, email, password_hash, raw_user_meta_data FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_error('Invalid login credentials', 400);
}

$cfg = get_config();
$token = make_token_for_user($user['id']);
$meta = json_decode($user['raw_user_meta_data'] ?? '{}', true) ?: [];

json_response([
    'data' => [
        'user' => [
            'id'    => $user['id'],
            'email' => $user['email'],
            'user_metadata' => $meta,
        ],
        'session' => [
            'access_token'  => $token,
            'refresh_token' => $token,
            'expires_at'    => time() + $cfg['jwt_ttl'],
            'expires_in'    => $cfg['jwt_ttl'],
            'token_type'    => 'bearer',
            'user' => [
                'id'    => $user['id'],
                'email' => $user['email'],
                'user_metadata' => $meta,
            ],
        ],
    ],
    'error' => null,
]);

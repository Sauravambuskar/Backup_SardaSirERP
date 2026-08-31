<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt.php';

$user = current_user(false);
if (!$user) {
    json_response(['data' => ['user' => null], 'error' => null]);
}

$stmt = db()->prepare('SELECT raw_user_meta_data FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$user['id']]);
$row = $stmt->fetch();
$meta = json_decode($row['raw_user_meta_data'] ?? '{}', true) ?: [];

json_response([
    'data' => [
        'user' => [
            'id'    => $user['id'],
            'email' => $user['email'],
            'user_metadata' => $meta,
        ],
    ],
    'error' => null,
]);

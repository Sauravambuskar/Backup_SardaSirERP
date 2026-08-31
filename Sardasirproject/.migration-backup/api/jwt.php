<?php
// Minimal HMAC-SHA256 JWT implementation (no external libraries)

function jwt_b64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function jwt_b64url_decode(string $data): string {
    $remainder = strlen($data) % 4;
    if ($remainder) $data .= str_repeat('=', 4 - $remainder);
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload, string $secret): string {
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $h = jwt_b64url_encode(json_encode($header));
    $p = jwt_b64url_encode(json_encode($payload));
    $sig = hash_hmac('sha256', "$h.$p", $secret, true);
    $s = jwt_b64url_encode($sig);
    return "$h.$p.$s";
}

function jwt_decode(string $token, string $secret): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $p, $s] = $parts;
    $expected = jwt_b64url_encode(hash_hmac('sha256', "$h.$p", $secret, true));
    if (!hash_equals($expected, $s)) return null;
    $payload = json_decode(jwt_b64url_decode($p), true);
    if (!is_array($payload)) return null;
    if (isset($payload['exp']) && $payload['exp'] < time()) return null;
    return $payload;
}

function bearer_token(): ?string {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $h = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
    if (!$h) {
        // Apache strips Authorization sometimes; fall back to redirect var
        $h = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    }
    if (preg_match('/Bearer\s+(.+)/i', $h, $m)) return trim($m[1]);
    return null;
}

function current_user(bool $required = true): ?array {
    $token = bearer_token();
    if (!$token) {
        if ($required) json_error('Not authenticated', 401);
        return null;
    }
    $cfg = get_config();
    $payload = jwt_decode($token, $cfg['jwt_secret']);
    if (!$payload || empty($payload['sub'])) {
        if ($required) json_error('Invalid or expired token', 401);
        return null;
    }
    $stmt = db()->prepare('SELECT id, email FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$payload['sub']]);
    $user = $stmt->fetch();
    if (!$user) {
        if ($required) json_error('User no longer exists', 401);
        return null;
    }
    return $user;
}

function make_token_for_user(string $userId): string {
    $cfg = get_config();
    return jwt_encode([
        'sub' => $userId,
        'iat' => time(),
        'exp' => time() + $cfg['jwt_ttl'],
    ], $cfg['jwt_secret']);
}

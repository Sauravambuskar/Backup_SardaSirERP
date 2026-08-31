<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

$user = current_user(true);
$fn   = $_GET['fn'] ?? '';
$args = input_json();

$pdo = db();

switch ($fn) {
    case 'get_case_status_counts': {
        $stmt = $pdo->prepare("SELECT status, COUNT(*) AS cnt FROM cases WHERE user_id = ? GROUP BY status");
        $stmt->execute([$user['id']]);
        json_response(['data' => $stmt->fetchAll(), 'error' => null]);
    }

    case 'get_monthly_advice_counts': {
        $monthsBack = (int)($args['months_back'] ?? 10);
        $sql = "SELECT DATE_FORMAT(advice_date, '%Y-%m') AS yr_month, COUNT(*) AS cnt
                FROM advice
                WHERE user_id = ?
                  AND advice_date >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')
                GROUP BY yr_month
                ORDER BY yr_month";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user['id'], $monthsBack]);
        json_response(['data' => $stmt->fetchAll(), 'error' => null]);
    }

    case 'get_monthly_case_counts': {
        $monthsBack = (int)($args['months_back'] ?? 5);
        $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS yr_month, COUNT(*) AS cnt
                FROM cases
                WHERE user_id = ?
                  AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')
                GROUP BY yr_month
                ORDER BY yr_month";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user['id'], $monthsBack]);
        json_response(['data' => $stmt->fetchAll(), 'error' => null]);
    }

    default:
        json_error("Unknown RPC: $fn", 404);
}

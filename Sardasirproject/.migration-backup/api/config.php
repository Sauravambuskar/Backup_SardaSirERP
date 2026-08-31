<?php
// ============================================================
// LAWMIND — PHP API CONFIGURATION
// Edit this file with YOUR Hostinger MySQL credentials.
// Get these from: Hostinger hPanel → Databases → MySQL Databases
// ============================================================

return [
    // MySQL connection (from Hostinger Databases section)
    'db_host' => 'localhost',                  // Usually 'localhost' on Hostinger
    'db_name' => 'u123456789_lawmind',         // Your database name
    'db_user' => 'u123456789_lawuser',         // Your database username
    'db_pass' => 'YOUR_DB_PASSWORD_HERE',      // Your database password
    'db_charset' => 'utf8mb4',

    // JWT secret — MUST be changed for every deployment (any long random string)
    'jwt_secret' => 'CHANGE_THIS_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARACTERS',
    'jwt_ttl'    => 60 * 60 * 24 * 30,         // 30 days

    // File upload directory (relative to /api/)
    'upload_dir' => __DIR__ . '/../uploads',
    'upload_url' => '/uploads',                // URL prefix served by web server
    'max_upload_size' => 20 * 1024 * 1024,     // 20 MB

    // Allow new signups (set to false to disable public signup after admin is created)
    'allow_signup' => true,
];

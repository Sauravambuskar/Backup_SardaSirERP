<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';

// JWT is stateless; "logout" simply means the client drops its token.
// We return success regardless of whether a token was present.
json_response(['data' => null, 'error' => null]);

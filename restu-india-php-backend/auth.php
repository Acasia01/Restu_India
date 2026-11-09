<?php
// auth.php - Native PHP JWT generation, validation and authentication middleware
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// Helper: base64UrlEncode
function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

// Helper: base64UrlDecode
function base64UrlDecode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

// Generate HS256 JWT Token
function generateJWT($userId, $role) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'id' => $userId,
        'role' => $role,
        'iat' => time(),
        'exp' => time() + JWT_EXPIRES_IN
    ]);

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

// Decode and verify HS256 JWT Token
function decodeJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    list($header, $payload, $signature) = $parts;

    // Verify signature
    $validSignature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
    if (!hash_equals(base64UrlDecode($signature), $validSignature)) {
        return null;
    }

    $decodedPayload = json_decode(base64UrlDecode($payload), true);

    // Verify expiration
    if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
        return null;
    }

    return $decodedPayload;
}

// Helper: Get Authorization Header Bearer Token
function getBearerToken() {
    // 1. Direct server envs (Apache rewrite, Nginx, FastCGI)
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        if (preg_match('/Bearer\s(\S+)/i', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
            return $matches[1];
        }
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        if (preg_match('/Bearer\s(\S+)/i', $_SERVER['REDIRECT_HTTP_AUTHORIZATION'], $matches)) {
            return $matches[1];
        }
    }

    // 2. getallheaders() with case-insensitive check
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    foreach ($headers as $key => $value) {
        if (strtolower($key) === 'authorization') {
            if (preg_match('/Bearer\s(\S+)/i', $value, $matches)) {
                return $matches[1];
            }
        }
    }

    return null;
}

// Middleware: protect route for authenticated users
function protect() {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(["message" => "Not authorized, no token provided"]);
        exit;
    }

    $payload = decodeJWT($token);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(["message" => "Not authorized, invalid or expired token"]);
        exit;
    }

    $db = getDBConnection();
    $stmt = $db->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
    $stmt->execute([$payload['id']]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(["message" => "User not found"]);
        exit;
    }

    return $user;
}

// Middleware: enforce admin authorization
function admin($user) {
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden, admin access required"]);
        exit;
    }
}

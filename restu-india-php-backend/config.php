<?php
// config.php - Environment Configurations

/**
 * Lightweight .env parser for loading environment variables
 */
function loadEnv($filePath) {
    if (!file_exists($filePath)) {
        return;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        // Ignore empty lines and comments
        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }

        if (strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);

            // Strip surrounding single or double quotes
            if (
                (strpos($val, '"') === 0 && substr($val, -1) === '"') ||
                (strpos($val, "'") === 0 && substr($val, -1) === "'")
            ) {
                $val = substr($val, 1, -1);
            }

            putenv("{$key}={$val}");
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
        }
    }
}

// Load .env from current directory
loadEnv(__DIR__ . '/.env');

/**
 * Helper to fetch environment variable with fallback
 */
function env($key, $default = null) {
    $val = getenv($key);
    if ($val !== false && $val !== '') {
        return $val;
    }
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return $_ENV[$key];
    }
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return $_SERVER[$key];
    }
    return $default;
}

// Database Configuration
define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_USER', env('DB_USER', ''));
define('DB_PASS', env('DB_PASS', ''));
define('DB_NAME', env('DB_NAME', ''));

// JWT Configuration
define('JWT_SECRET', env('JWT_SECRET', 'f7d29bc56a81e3a479b47e2e8df31765c71c4c8d5d9096739f4e24da2e8b0a1d'));
define('JWT_EXPIRES_IN', intval(env('JWT_EXPIRES_IN', 7 * 24 * 60 * 60))); // 7 days in seconds

// Admin Default Credentials
define('ADMIN_EMAIL', env('ADMIN_EMAIL', 'admin@restuindia.in'));
define('ADMIN_PASSWORD', env('ADMIN_PASSWORD', 'adminpassword'));

// Allowed Origins for CORS (Comma-separated)
define('ALLOWED_ORIGINS', env('ALLOWED_ORIGINS', 'https://lightslategray-raccoon-114982.hostingersite.com/'));


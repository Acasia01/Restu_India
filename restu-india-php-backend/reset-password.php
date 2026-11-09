<?php
// reset-password.php - Quick script to reset or update the admin password
if (php_sapi_name() !== 'cli') {
    header('Content-Type: text/html; charset=utf-8');
    echo "<pre>";
}
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// ── Pulls email and password directly from .env (or falls back to defaults) ──
$adminEmail = defined('ADMIN_EMAIL') ? ADMIN_EMAIL : 'admin@restuindia.in';
$newPassword = defined('ADMIN_PASSWORD') ? ADMIN_PASSWORD : 'adminpassword';

$db = getDBConnection();
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$adminEmail]);
$user = $stmt->fetch();

if ($user) {
    $update = $db->prepare("UPDATE users SET password = ?, role = 'admin' WHERE email = ?");
    $update->execute([$hashedPassword, $adminEmail]);
    echo "✓ Success: Password for {$adminEmail} has been updated to: {$newPassword}\n";
} else {
    $insert = $db->prepare("INSERT INTO users (name, email, password, role) VALUES ('System Admin', ?, ?, 'admin')");
    $insert->execute([$adminEmail, $hashedPassword]);
    echo "✓ Success: New admin account created with Email: {$adminEmail} and Password: {$newPassword}\n";
}


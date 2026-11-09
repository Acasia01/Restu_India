<?php
// db.php - Database connection helper using PDO
require_once __DIR__ . '/config.php';

function getDBConnection() {
    static $conn = null;
    if ($conn === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "message" => "Database connection failed",
                "error" => $e->getMessage()
            ]);
            exit;
        }
    }
    return $conn;
}

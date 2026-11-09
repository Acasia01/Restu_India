<?php
// seed.php - Create tables and seed initial database content
if (php_sapi_name() !== 'cli') {
    header('Content-Type: text/html; charset=utf-8');
    echo "<pre>";
}
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$db = getDBConnection();

// Read and execute schema.sql
echo "Initializing database schema...\n";
$schemaSql = file_get_contents(__DIR__ . '/schema.sql');
// Remove comments
$schemaSql = preg_replace('/--.*\n/', '', $schemaSql);
// Split by semicolon
$statements = explode(';', $schemaSql);

foreach ($statements as $stmt) {
    $stmt = trim($stmt);
    if (!empty($stmt)) {
        try {
            $db->exec($stmt);
        } catch (PDOException $e) {
            echo "Error running statement: " . substr($stmt, 0, 50) . "... Error: " . $e->getMessage() . "\n";
        }
    }
}
echo "Schema initialized successfully!\n";

// Insert or Update default Admin user
echo "Setting up default admin...\n";
$adminEmail = defined('ADMIN_EMAIL') ? ADMIN_EMAIL : 'admin@restuindia.in';
$plainPassword = defined('ADMIN_PASSWORD') ? ADMIN_PASSWORD : 'adminpassword';
$adminPass = password_hash($plainPassword, PASSWORD_BCRYPT);
$adminName = 'System Admin';

$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$adminEmail]);
$existingUser = $stmt->fetch();

if (!$existingUser) {
    $insertUser = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')");
    $insertUser->execute([$adminName, $adminEmail, $adminPass]);
    echo "Admin created! Email: {$adminEmail}, Password: {$plainPassword}\n";
} else {
    // Update password if admin already exists so changes in this file take effect
    $updateUser = $db->prepare("UPDATE users SET password = ?, name = ?, role = 'admin' WHERE email = ?");
    $updateUser->execute([$adminPass, $adminName, $adminEmail]);
    echo "Admin updated! Email: {$adminEmail}, Password set to: {$plainPassword}\n";
}

// Insert categories
echo "Inserting default categories...\n";
$categories = [
    ['name' => 'Hospital Beds', 'slug' => 'hospital-beds', 'description' => 'Premium manual and electric hospital beds for patient recovery.', 'image' => 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80'],
    ['name' => 'OT Equipment', 'slug' => 'ot-equipment', 'description' => 'Operation theatre tables, lights, and scrub sinks.', 'image' => 'https://images.unsplash.com/photo-1584515901367-f134706ef532?auto=format&fit=crop&w=400&q=80'],
    ['name' => 'Ward Furniture', 'slug' => 'ward-furniture', 'description' => 'IV stands, bedside tables, overbed tables, and lockers.', 'image' => 'https://images.unsplash.com/photo-1586773860383-dab5f3bc1b54?auto=format&fit=crop&w=400&q=80'],
    ['name' => 'Mattresses', 'slug' => 'mattresses', 'description' => 'Medical-grade mattresses, anti-decubitus and water beds.', 'image' => 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80']
];

$catIds = [];
foreach ($categories as $cat) {
    $stmt = $db->prepare("SELECT id FROM categories WHERE name = ?");
    $stmt->execute([$cat['name']]);
    $existing = $stmt->fetch();
    if (!$existing) {
        $insertCat = $db->prepare("INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)");
        $insertCat->execute([$cat['name'], $cat['slug'], $cat['description'], $cat['image']]);
        $catIds[$cat['slug']] = $db->lastInsertId();
        echo "Category created: {$cat['name']}\n";
    } else {
        $catIds[$cat['slug']] = $existing['id'];
    }
}

// Insert products
echo "Inserting default products...\n";
$products = [
    [
        'name' => 'Electric ICU Bed (5 Function)',
        'code' => 'RI-ICU-05',
        'description' => '5-function electric ICU bed with detachable head & foot boards, split side rails, and high-quality actuators.',
        'brand' => 'Restu India',
        'category_slug' => 'hospital-beds',
        'price' => 45000.00,
        'comparePrice' => 52000.00,
        'emoji' => '🏥',
        'image' => '/uploads/icu-bed.jpg',
        'images' => json_encode(['/uploads/icu-bed.jpg']),
        'tags' => json_encode(['icu', 'bed', 'electric', 'hospital']),
        'variants' => json_encode([['size' => 'Standard', 'stock' => 10]]),
        'isFeatured' => true,
        'isNew' => true
    ],
    [
        'name' => 'Manual Fowler Bed',
        'code' => 'RI-FB-01',
        'description' => 'Standard manual fowler bed with two handles for backrest and knee-rest adjustment.',
        'brand' => 'Restu India',
        'category_slug' => 'hospital-beds',
        'price' => 18000.00,
        'comparePrice' => 22000.00,
        'emoji' => '🛌',
        'image' => '/uploads/fowler-bed.jpg',
        'images' => json_encode(['/uploads/fowler-bed.jpg']),
        'tags' => json_encode(['fowler', 'bed', 'manual', 'hospital']),
        'variants' => json_encode([['size' => 'Standard', 'stock' => 25]]),
        'isFeatured' => true,
        'isNew' => false
    ],
    [
        'name' => 'Hydraulic OT Table',
        'code' => 'RI-OT-01',
        'description' => 'Universal C-arm compatible hydraulic operation theatre table with multi-section top.',
        'brand' => 'Restu India',
        'category_slug' => 'ot-equipment',
        'price' => 95000.00,
        'comparePrice' => 110000.00,
        'emoji' => '🩺',
        'image' => '/uploads/ot-table.jpg',
        'images' => json_encode(['/uploads/ot-table.jpg']),
        'tags' => json_encode(['ot', 'table', 'hydraulic', 'surgical']),
        'variants' => json_encode([['size' => 'Standard', 'stock' => 5]]),
        'isFeatured' => true,
        'isNew' => true
    ]
];

foreach ($products as $p) {
    $stmt = $db->prepare("SELECT id FROM products WHERE name = ?");
    $stmt->execute([$p['name']]);
    if (!$stmt->fetch()) {
        $catId = isset($catIds[$p['category_slug']]) ? $catIds[$p['category_slug']] : 1;

        // Generate clean slug
        $base = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $p['name'])));
        $slug = $base . '-' . substr(md5(uniqid(rand(), true)), 0, 5);

        $insertProd = $db->prepare("INSERT INTO products (name, slug, code, description, brand, category_id, price, comparePrice, emoji, image, images, tags, variants, isFeatured, isNew) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $insertProd->execute([
            $p['name'],
            $slug,
            $p['code'],
            $p['description'],
            $p['brand'],
            $catId,
            $p['price'],
            $p['comparePrice'],
            $p['emoji'],
            $p['image'],
            $p['images'],
            $p['tags'],
            $p['variants'],
            $p['isFeatured'] ? 1 : 0,
            $p['isNew'] ? 1 : 0
        ]);
        echo "Product created: {$p['name']}\n";
    }
}
echo "Database seeding completed successfully!\n";

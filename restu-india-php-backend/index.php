<?php
// index.php - Front Controller & Router for Restu India API

// Include configurations, DB, and JWT helpers
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

// Set response content type
header('Content-Type: application/json; charset=UTF-8');

// CORS Handling
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_map('trim', explode(',', ALLOWED_ORIGINS));
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle CORS Preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Extract and normalize request URL path
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
if ($scriptName !== '/' && strpos($requestUri, $scriptName) === 0) {
    $requestUri = substr($requestUri, strlen($scriptName));
}
$requestUri = trim($requestUri, '/');

// Strip 'api/' prefix if it exists to normalize route paths
if (strpos($requestUri, 'api/') === 0) {
    $requestUri = substr($requestUri, 4);
} elseif ($requestUri === 'api') {
    $requestUri = '';
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

$routeMatched = false;

// 1. Auth routes
if ($requestUri === 'auth/register' && $method === 'POST') {
    $routeMatched = true;
    handleRegister($input);
} elseif ($requestUri === 'auth/login' && $method === 'POST') {
    $routeMatched = true;
    handleLogin($input);
} elseif ($requestUri === 'auth/me' && $method === 'GET') {
    $routeMatched = true;
    $user = protect();
    handleMe($user);
}

// 2. Categories routes
elseif ($requestUri === 'categories' && $method === 'GET') {
    $routeMatched = true;
    handleGetCategories();
} elseif (preg_match('/^categories\/(\d+)$/', $requestUri, $matches) && $method === 'GET') {
    $routeMatched = true;
    handleGetCategory($matches[1]);
} elseif ($requestUri === 'categories' && $method === 'POST') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleCreateCategory($input);
} elseif (preg_match('/^categories\/(\d+)$/', $requestUri, $matches) && $method === 'PATCH') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleUpdateCategory($matches[1], $input);
} elseif (preg_match('/^categories\/(\d+)$/', $requestUri, $matches) && $method === 'DELETE') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleDeleteCategory($matches[1]);
}

// 3. Products routes
elseif ($requestUri === 'products' && $method === 'GET') {
    $routeMatched = true;
    handleGetProducts();
} elseif (preg_match('/^products\/([a-zA-Z0-9_-]+)$/', $requestUri, $matches) && $method === 'GET') {
    $routeMatched = true;
    handleGetProduct($matches[1]);
} elseif ($requestUri === 'products' && $method === 'POST') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleCreateProduct($input);
} elseif (preg_match('/^products\/([a-zA-Z0-9_-]+)$/', $requestUri, $matches) && $method === 'PATCH') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleUpdateProduct($matches[1], $input);
} elseif (preg_match('/^products\/([a-zA-Z0-9_-]+)$/', $requestUri, $matches) && $method === 'DELETE') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleDeleteProduct($matches[1]);
}

// 4. Enquiries routes
elseif ($requestUri === 'enquiries' && $method === 'POST') {
    $routeMatched = true;
    handleCreateEnquiry($input);
} elseif ($requestUri === 'enquiries' && $method === 'GET') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleGetEnquiries();
} elseif (preg_match('/^enquiries\/(\d+)$/', $requestUri, $matches) && $method === 'PATCH') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleUpdateEnquiry($matches[1], $input);
} elseif (preg_match('/^enquiries\/(\d+)$/', $requestUri, $matches) && $method === 'DELETE') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleDeleteEnquiry($matches[1]);
}

// 5. Upload route
elseif ($requestUri === 'upload' && $method === 'POST') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleUpload();
}

// 6. Admin stats route
elseif ($requestUri === 'admin/stats' && $method === 'GET') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleGetAdminStats();
}

// 7. Users routes
elseif ($requestUri === 'users' && $method === 'GET') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleGetUsers();
} elseif (preg_match('/^users\/(\d+)$/', $requestUri, $matches) && $method === 'PATCH') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleUpdateUser($matches[1], $input);
} elseif (preg_match('/^users\/(\d+)$/', $requestUri, $matches) && $method === 'DELETE') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleDeleteUser($matches[1], $user);
}

// 8. Orders routes
elseif ($requestUri === 'orders' && $method === 'GET') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleGetOrders();
} elseif (preg_match('/^orders\/(\d+)$/', $requestUri, $matches) && $method === 'GET') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleGetOrder($matches[1]);
} elseif ($requestUri === 'orders' && $method === 'POST') {
    $routeMatched = true;
    $user = protect();
    handleCreateOrder($user, $input);
} elseif (preg_match('/^orders\/(\d+)\/status$/', $requestUri, $matches) && $method === 'PATCH') {
    $routeMatched = true;
    $user = protect();
    admin($user);
    handleUpdateOrderStatus($matches[1], $input);
}

// 9. Route Not Found Fallback
if (!$routeMatched) {
    http_response_code(404);
    echo json_encode(["message" => "Route not found ($method $requestUri)"]);
    exit;
}

// ==========================================
// CONTROLLER IMPLEMENTATIONS
// ==========================================

// --- Auth Controllers ---

function handleRegister($input) {
    $name = trim($input['name'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (empty($name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["message" => "Please provide name, email and password"]);
        return;
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(["message" => "Password must be at least 6 characters"]);
        return;
    }

    $db = getDBConnection();
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(["message" => "A user with this email already exists"]);
        return;
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')");
    $stmt->execute([$name, $email, $hashedPassword]);
    $userId = $db->lastInsertId();

    $token = generateJWT($userId, 'user');

    http_response_code(201);
    echo json_encode([
        "_id" => (string)$userId,
        "id" => (int)$userId,
        "name" => $name,
        "email" => $email,
        "role" => "user",
        "token" => $token
    ]);
}

function handleLogin($input) {
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["message" => "Please provide email and password"]);
        return;
    }

    $db = getDBConnection();
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid email or password"]);
        return;
    }

    $token = generateJWT($user['id'], $user['role']);

    echo json_encode([
        "_id" => (string)$user['id'],
        "id" => (int)$user['id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "role" => $user['role'],
        "token" => $token
    ]);
}

function handleMe($user) {
    echo json_encode([
        "_id" => (string)$user['id'],
        "id" => (int)$user['id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "role" => $user['role'],
        "createdAt" => date('c', strtotime($user['created_at']))
    ]);
}

// --- Categories Controllers ---

function handleGetCategories() {
    $db = getDBConnection();
    $stmt = $db->query("SELECT * FROM categories ORDER BY name ASC");
    $categories = $stmt->fetchAll();

    foreach ($categories as &$cat) {
        $cat['_id'] = (string)$cat['id'];
        $cat['id'] = (int)$cat['id'];
    }
    echo json_encode($categories);
}

function handleGetCategory($id) {
    $db = getDBConnection();
    $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $cat = $stmt->fetch();

    if (!$cat) {
        http_response_code(404);
        echo json_encode(["message" => "Category not found"]);
        return;
    }

    $cat['_id'] = (string)$cat['id'];
    $cat['id'] = (int)$cat['id'];
    echo json_encode($cat);
}

function handleCreateCategory($input) {
    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    $image = trim($input['image'] ?? '');
    $slug = trim($input['slug'] ?? '');

    if (empty($name)) {
        http_response_code(400);
        echo json_encode(["message" => "Category name is required"]);
        return;
    }

    $db = getDBConnection();
    $stmt = $db->prepare("SELECT id FROM categories WHERE name = ?");
    $stmt->execute([$name]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(["message" => "Category already exists"]);
        return;
    }

    if (empty($slug)) {
        $slug = strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $name));
        $slug = trim($slug, '-');
    }

    $stmt = $db->prepare("INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $slug, $description, $image]);
    $catId = $db->lastInsertId();

    $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$catId]);
    $cat = $stmt->fetch();

    $cat['_id'] = (string)$cat['id'];
    $cat['id'] = (int)$cat['id'];

    http_response_code(201);
    echo json_encode($cat);
}

function handleUpdateCategory($id, $input) {
    $db = getDBConnection();
    $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $cat = $stmt->fetch();

    if (!$cat) {
        http_response_code(404);
        echo json_encode(["message" => "Category not found"]);
        return;
    }

    $name = $input['name'] ?? $cat['name'];
    $description = $input['description'] ?? $cat['description'];
    $image = $input['image'] ?? $cat['image'];
    $slug = $input['slug'] ?? $cat['slug'];

    if (isset($input['name']) && empty($name)) {
        http_response_code(400);
        echo json_encode(["message" => "Category name is required"]);
        return;
    }

    if (isset($input['name']) && $name !== $cat['name']) {
        if (empty($slug) || $slug === $cat['slug']) {
            $slug = strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $name));
            $slug = trim($slug, '-');
        }
    }

    $stmt = $db->prepare("UPDATE categories SET name = ?, slug = ?, description = ?, image = ? WHERE id = ?");
    $stmt->execute([$name, $slug, $description, $image, $id]);

    $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $updated = $stmt->fetch();

    $updated['_id'] = (string)$updated['id'];
    $updated['id'] = (int)$updated['id'];

    echo json_encode($updated);
}

function handleDeleteCategory($id) {
    $db = getDBConnection();
    $stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(["message" => "Category not found"]);
        return;
    }

    $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["message" => "Category removed"]);
}

// --- Products Controllers ---

function handleGetProducts() {
    $db = getDBConnection();

    $search = $_GET['search'] ?? '';
    $category = $_GET['category'] ?? '';
    $featured = $_GET['featured'] ?? '';
    $isNew = $_GET['isNew'] ?? '';
    $limit = $_GET['limit'] ?? '';
    $page = $_GET['page'] ?? '';
    $includeInactive = filter_var($_GET['includeInactive'] ?? false, FILTER_VALIDATE_BOOLEAN);

    $where = [];
    $params = [];

    if (!$includeInactive) {
        $where[] = "p.isActive = 1";
    }

    if ($search !== '') {
        $where[] = "(p.name LIKE ? OR p.description LIKE ? OR p.code LIKE ? OR p.tags LIKE ?)";
        $searchTerm = '%' . $search . '%';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    if ($category !== '') {
        if (!is_numeric($category)) {
            $catStmt = $db->prepare("SELECT id FROM categories WHERE slug = ?");
            $catStmt->execute([$category]);
            $catRow = $catStmt->fetch();
            $catId = $catRow ? $catRow['id'] : 0;
        } else {
            $catId = (int)$category;
        }
        $where[] = "p.category_id = ?";
        $params[] = $catId;
    }

    if ($featured === 'true') {
        $where[] = "p.isFeatured = 1";
    }

    if ($isNew === 'true') {
        $where[] = "p.isNew = 1";
    }

    $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

    // Count query
    $countSql = "SELECT COUNT(*) as total FROM products p $whereClause";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = (int)($countStmt->fetch()['total'] ?? 0);

    // Pagination
    $pageSize = $limit ? (int)$limit : 100;
    $pageNumber = $page ? (int)$page : 1;
    $offset = ($pageNumber - 1) * $pageSize;

    // Fetch query
    $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            $whereClause
            ORDER BY p.created_at DESC
            LIMIT $pageSize OFFSET $offset";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    foreach ($products as &$p) {
        $p['_id'] = (string)$p['id'];
        $p['id'] = (int)$p['id'];
        $p['price'] = (float)$p['price'];
        $p['comparePrice'] = $p['comparePrice'] !== null ? (float)$p['comparePrice'] : null;
        $p['isFeatured'] = (bool)$p['isFeatured'];
        $p['isNew'] = (bool)$p['isNew'];
        $p['isActive'] = (bool)$p['isActive'];
        
        // Decode JSON fields
        $p['images'] = json_decode($p['images'] ?? '[]', true);
        $p['tags'] = json_decode($p['tags'] ?? '[]', true);
        $p['variants'] = json_decode($p['variants'] ?? '[]', true);

        // Format category as object
        $p['category'] = [
            '_id' => (string)$p['category_id'],
            'id' => (int)$p['category_id'],
            'name' => $p['category_name'] ?? '',
            'slug' => $p['category_slug'] ?? ''
        ];

        unset($p['category_name']);
        unset($p['category_slug']);
    }

    echo json_encode([
        "products" => $products,
        "total" => $total,
        "page" => $pageNumber,
        "pages" => ceil($total / $pageSize) ?: 1
    ]);
}

function handleGetProduct($idOrSlug) {
    $db = getDBConnection();

    if (is_numeric($idOrSlug)) {
        $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = ?";
    } else {
        $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.slug = ?";
    }

    $stmt = $db->prepare($sql);
    $stmt->execute([$idOrSlug]);
    $p = $stmt->fetch();

    if (!$p) {
        http_response_code(404);
        echo json_encode(["message" => "Product not found"]);
        return;
    }

    $p['_id'] = (string)$p['id'];
    $p['id'] = (int)$p['id'];
    $p['price'] = (float)$p['price'];
    $p['comparePrice'] = $p['comparePrice'] !== null ? (float)$p['comparePrice'] : null;
    $p['isFeatured'] = (bool)$p['isFeatured'];
    $p['isNew'] = (bool)$p['isNew'];
    $p['isActive'] = (bool)$p['isActive'];
    
    // Decode JSON fields
    $p['images'] = json_decode($p['images'] ?? '[]', true);
    $p['tags'] = json_decode($p['tags'] ?? '[]', true);
    $p['variants'] = json_decode($p['variants'] ?? '[]', true);

    // Format category as object
    $p['category'] = [
        '_id' => (string)$p['category_id'],
        'id' => (int)$p['category_id'],
        'name' => $p['category_name'] ?? '',
        'slug' => $p['category_slug'] ?? ''
    ];

    unset($p['category_name']);
    unset($p['category_slug']);

    echo json_encode($p);
}

function handleCreateProduct($input) {
    $db = getDBConnection();

    $name = trim($input['name'] ?? '');
    $slug = trim($input['slug'] ?? '');
    $code = trim($input['code'] ?? '');
    $description = trim($input['description'] ?? '');
    $brand = trim($input['brand'] ?? '');
    
    // Parse category
    $categoryInput = $input['category'] ?? null;
    $categoryId = null;
    if ($categoryInput !== null) {
        if (is_array($categoryInput)) {
            $categoryId = $categoryInput['_id'] ?? $categoryInput['id'] ?? null;
        } else {
            $categoryId = $categoryInput;
        }
    }
    $categoryId = $categoryId !== null ? (int)$categoryId : 0;

    $price = isset($input['price']) ? (float)$input['price'] : 0.0;
    $comparePrice = isset($input['comparePrice']) && $input['comparePrice'] !== '' ? (float)$input['comparePrice'] : null;
    $emoji = trim($input['emoji'] ?? '✨');

    $images = $input['images'] ?? [];
    if (!is_array($images)) $images = [];
    $image = $input['image'] ?? ($images[0] ?? '');

    $tags = $input['tags'] ?? [];
    if (!is_array($tags)) $tags = [];

    $variants = $input['variants'] ?? [];
    if (!is_array($variants)) $variants = [];

    $isFeatured = filter_var($input['isFeatured'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    $isNew = filter_var($input['isNew'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    $isActive = filter_var($input['isActive'] ?? true, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;

    if (empty($name)) {
        http_response_code(400);
        echo json_encode(["message" => "Product name is required"]);
        return;
    }

    if (empty($slug)) {
        $base = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));
        $base = trim($base, '-');
        $slug = $base . '-' . substr(md5(uniqid(rand(), true)), 0, 5);
    }

    $stmt = $db->prepare("INSERT INTO products (name, slug, code, description, brand, category_id, price, comparePrice, emoji, image, images, tags, variants, isFeatured, isNew, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $name,
        $slug,
        $code,
        $description,
        $brand,
        $categoryId,
        $price,
        $comparePrice,
        $emoji,
        $image,
        json_encode($images),
        json_encode($tags),
        json_encode($variants),
        $isFeatured,
        $isNew,
        $isActive
    ]);

    $productId = $db->lastInsertId();
    
    // Output created product
    http_response_code(201);
    handleGetProduct($productId);
}

function handleUpdateProduct($idOrSlug, $input) {
    $db = getDBConnection();

    // Find existing product
    if (is_numeric($idOrSlug)) {
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
    } else {
        $stmt = $db->prepare("SELECT * FROM products WHERE slug = ?");
    }
    $stmt->execute([$idOrSlug]);
    $p = $stmt->fetch();

    if (!$p) {
        http_response_code(404);
        echo json_encode(["message" => "Product not found"]);
        return;
    }

    // Prepare updated fields
    $name = isset($input['name']) ? trim($input['name']) : $p['name'];
    $slug = isset($input['slug']) ? trim($input['slug']) : $p['slug'];
    $code = isset($input['code']) ? trim($input['code']) : $p['code'];
    $description = isset($input['description']) ? trim($input['description']) : $p['description'];
    $brand = isset($input['brand']) ? trim($input['brand']) : $p['brand'];

    // Category
    $categoryId = $p['category_id'];
    if (array_key_exists('category', $input)) {
        $categoryInput = $input['category'];
        if (is_array($categoryInput)) {
            $categoryId = $categoryInput['_id'] ?? $categoryInput['id'] ?? null;
        } else {
            $categoryId = $categoryInput;
        }
        $categoryId = $categoryId !== null ? (int)$categoryId : 0;
    }

    $price = isset($input['price']) ? (float)$input['price'] : (float)$p['price'];
    $comparePrice = $p['comparePrice'];
    if (array_key_exists('comparePrice', $input)) {
        $comparePrice = ($input['comparePrice'] !== null && $input['comparePrice'] !== '') ? (float)$input['comparePrice'] : null;
    }

    $emoji = isset($input['emoji']) ? trim($input['emoji']) : $p['emoji'];

    // Images
    $imagesJson = $p['images'];
    if (array_key_exists('images', $input)) {
        $images = $input['images'];
        if (!is_array($images)) $images = [];
        $imagesJson = json_encode($images);
    } else {
        $images = json_decode($imagesJson, true) ?? [];
    }

    $image = isset($input['image']) ? trim($input['image']) : (isset($input['images']) ? ($images[0] ?? '') : $p['image']);

    // Tags
    $tagsJson = $p['tags'];
    if (array_key_exists('tags', $input)) {
        $tags = $input['tags'];
        if (!is_array($tags)) $tags = [];
        $tagsJson = json_encode($tags);
    }

    // Variants
    $variantsJson = $p['variants'];
    if (array_key_exists('variants', $input)) {
        $variants = $input['variants'];
        if (!is_array($variants)) $variants = [];
        $variantsJson = json_encode($variants);
    }

    $isFeatured = isset($input['isFeatured']) ? (filter_var($input['isFeatured'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0) : $p['isFeatured'];
    $isNew = isset($input['isNew']) ? (filter_var($input['isNew'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0) : $p['isNew'];
    $isActive = isset($input['isActive']) ? (filter_var($input['isActive'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0) : $p['isActive'];

    if (empty($name)) {
        http_response_code(400);
        echo json_encode(["message" => "Product name is required"]);
        return;
    }

    $stmt = $db->prepare("UPDATE products SET name = ?, slug = ?, code = ?, description = ?, brand = ?, category_id = ?, price = ?, comparePrice = ?, emoji = ?, image = ?, images = ?, tags = ?, variants = ?, isFeatured = ?, isNew = ?, isActive = ? WHERE id = ?");
    
    $stmt->execute([
        $name,
        $slug,
        $code,
        $description,
        $brand,
        $categoryId,
        $price,
        $comparePrice,
        $emoji,
        $image,
        $imagesJson,
        $tagsJson,
        $variantsJson,
        $isFeatured,
        $isNew,
        $isActive,
        $p['id']
    ]);

    handleGetProduct($p['id']);
}

function handleDeleteProduct($idOrSlug) {
    $db = getDBConnection();

    if (is_numeric($idOrSlug)) {
        $stmt = $db->prepare("SELECT id FROM products WHERE id = ?");
    } else {
        $stmt = $db->prepare("SELECT id FROM products WHERE slug = ?");
    }
    $stmt->execute([$idOrSlug]);
    $p = $stmt->fetch();

    if (!$p) {
        http_response_code(404);
        echo json_encode(["message" => "Product not found"]);
        return;
    }

    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$p['id']]);

    echo json_encode(["message" => "Product deleted"]);
}

// --- Enquiries Controllers ---

function handleCreateEnquiry($input) {
    $db = getDBConnection();

    $name = trim($input['name'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $phone = trim($input['phone'] ?? '');
    $company = trim($input['company'] ?? '');
    $purpose = trim($input['purpose'] ?? '');
    $message = trim($input['message'] ?? '');

    // Parse category
    $categoryInput = $input['category'] ?? null;
    $categoryId = null;
    if ($categoryInput !== null) {
        if (is_array($categoryInput)) {
            $categoryId = $categoryInput['_id'] ?? $categoryInput['id'] ?? null;
        } else {
            $categoryId = $categoryInput;
        }
    }
    $categoryId = $categoryId !== null ? (int)$categoryId : null;

    if (empty($name) || empty($message)) {
        http_response_code(400);
        echo json_encode(["message" => "Name and message are required"]);
        return;
    }

    $stmt = $db->prepare("INSERT INTO enquiries (name, email, phone, company, purpose, category_id, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'new')");
    $stmt->execute([$name, $email, $phone, $company, $purpose, $categoryId, $message]);
    $enquiryId = $db->lastInsertId();

    // Fetch and return populated enquiry
    $stmt = $db->prepare("SELECT e.*, c.name as category_name FROM enquiries e LEFT JOIN categories c ON e.category_id = c.id WHERE e.id = ?");
    $stmt->execute([$enquiryId]);
    $en = $stmt->fetch();

    $en['_id'] = (string)$en['id'];
    $en['id'] = (int)$en['id'];
    $en['category'] = $en['category_id'] ? [
        '_id' => (string)$en['category_id'],
        'id' => (int)$en['category_id'],
        'name' => $en['category_name']
    ] : null;
    unset($en['category_name']);

    http_response_code(201);
    echo json_encode($en);
}

function handleGetEnquiries() {
    $db = getDBConnection();

    $stmt = $db->query("SELECT e.*, c.name as category_name FROM enquiries e LEFT JOIN categories c ON e.category_id = c.id ORDER BY e.created_at DESC");
    $enquiries = $stmt->fetchAll();

    foreach ($enquiries as &$en) {
        $en['_id'] = (string)$en['id'];
        $en['id'] = (int)$en['id'];
        $en['category'] = $en['category_id'] ? [
            '_id' => (string)$en['category_id'],
            'id' => (int)$en['category_id'],
            'name' => $en['category_name']
        ] : null;
        unset($en['category_name']);
    }

    echo json_encode(["enquiries" => $enquiries]);
}

function handleUpdateEnquiry($id, $input) {
    $db = getDBConnection();

    $stmt = $db->prepare("SELECT * FROM enquiries WHERE id = ?");
    $stmt->execute([$id]);
    $en = $stmt->fetch();

    if (!$en) {
        http_response_code(404);
        echo json_encode(["message" => "Enquiry not found"]);
        return;
    }

    $status = $input['status'] ?? $en['status'];
    $allowed = ['new', 'contacted', 'closed'];

    if (!in_array($status, $allowed)) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid status value"]);
        return;
    }

    $stmt = $db->prepare("UPDATE enquiries SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);

    $stmt = $db->prepare("SELECT e.*, c.name as category_name FROM enquiries e LEFT JOIN categories c ON e.category_id = c.id WHERE e.id = ?");
    $stmt->execute([$id]);
    $updated = $stmt->fetch();

    $updated['_id'] = (string)$updated['id'];
    $updated['id'] = (int)$updated['id'];
    $updated['category'] = $updated['category_id'] ? [
        '_id' => (string)$updated['category_id'],
        'id' => (int)$updated['category_id'],
        'name' => $updated['category_name']
    ] : null;
    unset($updated['category_name']);

    echo json_encode($updated);
}

function handleDeleteEnquiry($id) {
    $db = getDBConnection();

    $stmt = $db->prepare("SELECT id FROM enquiries WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(["message" => "Enquiry not found"]);
        return;
    }

    $stmt = $db->prepare("DELETE FROM enquiries WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["message" => "Enquiry removed"]);
}

// --- Upload Controller ---

function handleUpload() {
    $uploadDir = __DIR__ . '/uploads/';

    // Create directory if not exists
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to create uploads directory. Please manually create a folder named 'uploads' inside your 'api' folder."]);
            return;
        }
    }

    // Check write permissions
    if (!is_writable($uploadDir)) {
        http_response_code(500);
        echo json_encode(["message" => "Uploads folder is not writable. Please change the permissions of the 'uploads' folder inside your 'api' directory to 775 or 777 in Hostinger File Manager."]);
        return;
    }

    if (!isset($_FILES['images'])) {
        http_response_code(400);
        echo json_encode(["message" => "No files were received in request. (Check if files are empty or if POST size exceeds php.ini limit)"]);
        return;
    }

    $files = $_FILES['images'];
    $urls = [];
    $errors = [];

    $errorMap = [
        UPLOAD_ERR_INI_SIZE => "File exceeds upload_max_filesize in php.ini",
        UPLOAD_ERR_FORM_SIZE => "File exceeds MAX_FILE_SIZE in HTML form",
        UPLOAD_ERR_PARTIAL => "File was only partially uploaded",
        UPLOAD_ERR_NO_FILE => "No file was uploaded",
        UPLOAD_ERR_NO_TMP_DIR => "Missing temporary folder on server",
        UPLOAD_ERR_CANT_WRITE => "Failed to write file to disk (Check server disk space/permissions)",
        UPLOAD_ERR_EXTENSION => "A PHP extension stopped the file upload"
    ];

    // Handle standard PHP multiple files structure vs single file structure
    if (is_array($files['name'])) {
        $count = count($files['name']);
        for ($i = 0; $i < $count; $i++) {
            $errCode = $files['error'][$i];
            if ($errCode === UPLOAD_ERR_OK) {
                $tmpName = $files['tmp_name'][$i];
                $originalName = basename($files['name'][$i]);
                $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
                $newFilename = uniqid('img_', true) . '.' . $extension;
                $destination = $uploadDir . $newFilename;

                if (move_uploaded_file($tmpName, $destination)) {
                    $urls[] = '/api/uploads/' . $newFilename;
                } else {
                    $errors[] = "Failed to move file '{$originalName}' to destination.";
                }
            } else {
                $errors[] = "File '{$files['name'][$i]}' failed: " . ($errorMap[$errCode] ?? "Code {$errCode}");
            }
        }
    } else {
        $errCode = $files['error'];
        if ($errCode === UPLOAD_ERR_OK) {
            $tmpName = $files['tmp_name'];
            $originalName = basename($files['name']);
            $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
            $newFilename = uniqid('img_', true) . '.' . $extension;
            $destination = $uploadDir . $newFilename;

            if (move_uploaded_file($tmpName, $destination)) {
                $urls[] = '/api/uploads/' . $newFilename;
            } else {
                $errors[] = "Failed to move file '{$originalName}' to destination.";
            }
        } else {
            $errors[] = "File '{$files['name']}' failed: " . ($errorMap[$errCode] ?? "Code {$errCode}");
        }
    }

    if (empty($urls)) {
        http_response_code(400);
        $errDetails = !empty($errors) ? implode(" | ", $errors) : "Unknown error";
        echo json_encode(["message" => "Upload failed: " . $errDetails]);
        return;
    }

    http_response_code(201);
    echo json_encode(["urls" => $urls]);
}

// --- Admin Stats Controller ---

function handleGetAdminStats() {
    $db = getDBConnection();

    // 1. Total users
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $totalUsers = (int)($stmt->fetch()['count'] ?? 0);

    // 2. Active products
    $stmt = $db->query("SELECT COUNT(*) as count FROM products WHERE isActive = 1");
    $totalProducts = (int)($stmt->fetch()['count'] ?? 0);

    // 3. Total orders
    $stmt = $db->query("SELECT COUNT(*) as count FROM orders");
    $totalOrders = (int)($stmt->fetch()['count'] ?? 0);

    // 4. Total revenue (paid orders)
    $stmt = $db->query("SELECT SUM(totalPrice) as total FROM orders WHERE isPaid = 1");
    $totalRevenue = (float)($stmt->fetch()['total'] ?? 0.0);

    // 5. Orders by status
    $stmt = $db->query("SELECT status as _id, COUNT(*) as count FROM orders GROUP BY status");
    $ordersByStatus = $stmt->fetchAll();
    foreach ($ordersByStatus as &$obs) {
        $obs['count'] = (int)$obs['count'];
    }

    // 6. Recent orders
    $stmt = $db->query("SELECT o.*, u.name as user_name, u.email as user_email 
                        FROM orders o 
                        LEFT JOIN users u ON o.user_id = u.id 
                        ORDER BY o.created_at DESC 
                        LIMIT 5");
    $recentOrders = $stmt->fetchAll();

    foreach ($recentOrders as &$o) {
        $o['_id'] = (string)$o['id'];
        $o['id'] = (int)$o['id'];
        $o['totalPrice'] = (float)$o['totalPrice'];
        $o['isPaid'] = (bool)$o['isPaid'];
        $o['items'] = json_decode($o['items'] ?? '[]', true);
        $o['shipping'] = json_decode($o['shipping'] ?? '{}', true);
        
        $o['user'] = $o['user_id'] ? [
            '_id' => (string)$o['user_id'],
            'id' => (int)$o['user_id'],
            'name' => $o['user_name'],
            'email' => $o['user_email']
        ] : null;

        unset($o['user_name']);
        unset($o['user_email']);
    }

    echo json_encode([
        "totalRevenue" => $totalRevenue,
        "totalOrders" => $totalOrders,
        "totalUsers" => $totalUsers,
        "totalProducts" => $totalProducts,
        "ordersByStatus" => $ordersByStatus,
        "recentOrders" => $recentOrders
    ]);
}

// --- Users Controllers ---

function handleGetUsers() {
    $db = getDBConnection();
    $stmt = $db->query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
    $users = $stmt->fetchAll();

    foreach ($users as &$u) {
        $u['_id'] = (string)$u['id'];
        $u['id'] = (int)$u['id'];
        $u['createdAt'] = date('c', strtotime($u['created_at']));
        unset($u['created_at']);
    }

    echo json_encode(["users" => $users]);
}

function handleUpdateUser($id, $input) {
    $db = getDBConnection();

    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(["message" => "User not found"]);
        return;
    }

    $name = $input['name'] ?? $user['name'];
    $role = $input['role'] ?? $user['role'];

    $stmt = $db->prepare("UPDATE users SET name = ?, role = ? WHERE id = ?");
    $stmt->execute([$name, $role, $id]);

    $stmt = $db->prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $updated = $stmt->fetch();

    echo json_encode([
        "_id" => (string)$updated['id'],
        "id" => (int)$updated['id'],
        "name" => $updated['name'],
        "email" => $updated['email'],
        "role" => $updated['role'],
        "createdAt" => date('c', strtotime($updated['created_at']))
    ]);
}

function handleDeleteUser($id, $currentUser) {
    if ((string)$id === (string)$currentUser['id']) {
        http_response_code(400);
        echo json_encode(["message" => "You cannot delete your own account"]);
        return;
    }

    $db = getDBConnection();

    $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(["message" => "User not found"]);
        return;
    }

    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["message" => "User removed"]);
}

// --- Orders Controllers ---

function handleGetOrders() {
    $db = getDBConnection();

    $status = $_GET['status'] ?? '';
    $where = [];
    $params = [];

    if ($status !== '') {
        $where[] = "o.status = ?";
        $params[] = $status;
    }

    $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

    $sql = "SELECT o.*, u.name as user_name, u.email as user_email 
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            $whereClause
            ORDER BY o.created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    foreach ($orders as &$o) {
        $o['_id'] = (string)$o['id'];
        $o['id'] = (int)$o['id'];
        $o['totalPrice'] = (float)$o['totalPrice'];
        $o['isPaid'] = (bool)$o['isPaid'];
        $o['items'] = json_decode($o['items'] ?? '[]', true);
        $o['shipping'] = json_decode($o['shipping'] ?? '{}', true);

        $o['user'] = $o['user_id'] ? [
            '_id' => (string)$o['user_id'],
            'id' => (int)$o['user_id'],
            'name' => $o['user_name'],
            'email' => $o['user_email']
        ] : null;

        unset($o['user_name']);
        unset($o['user_email']);
    }

    echo json_encode(["orders" => $orders]);
}

function handleGetOrder($id) {
    $db = getDBConnection();

    $sql = "SELECT o.*, u.name as user_name, u.email as user_email 
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?";

    $stmt = $db->prepare($sql);
    $stmt->execute([$id]);
    $o = $stmt->fetch();

    if (!$o) {
        http_response_code(404);
        echo json_encode(["message" => "Order not found"]);
        return;
    }

    $o['_id'] = (string)$o['id'];
    $o['id'] = (int)$o['id'];
    $o['totalPrice'] = (float)$o['totalPrice'];
    $o['isPaid'] = (bool)$o['isPaid'];
    $o['items'] = json_decode($o['items'] ?? '[]', true);
    $o['shipping'] = json_decode($o['shipping'] ?? '{}', true);

    $o['user'] = $o['user_id'] ? [
        '_id' => (string)$o['user_id'],
        'id' => (int)$o['user_id'],
        'name' => $o['user_name'],
        'email' => $o['user_email']
    ] : null;

    unset($o['user_name']);
    unset($o['user_email']);

    echo json_encode($o);
}

function handleCreateOrder($user, $input) {
    $db = getDBConnection();

    $items = $input['items'] ?? [];
    $shipping = $input['shipping'] ?? [];
    $totalPrice = isset($input['totalPrice']) ? (float)$input['totalPrice'] : 0.0;

    if (empty($items) || !is_array($items)) {
        http_response_code(400);
        echo json_encode(["message" => "Order must contain at least one item"]);
        return;
    }

    $orderNumber = 'RI-' . round(microtime(true) * 1000);

    $stmt = $db->prepare("INSERT INTO orders (orderNumber, user_id, items, shipping, totalPrice, status, isPaid) VALUES (?, ?, ?, ?, ?, 'pending', 0)");
    $stmt->execute([
        $orderNumber,
        $user['id'],
        json_encode($items),
        json_encode($shipping),
        $totalPrice
    ]);

    $orderId = $db->lastInsertId();

    // Fetch and return order
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $stmt->execute([$orderId]);
    $o = $stmt->fetch();

    $o['_id'] = (string)$o['id'];
    $o['id'] = (int)$o['id'];
    $o['totalPrice'] = (float)$o['totalPrice'];
    $o['isPaid'] = (bool)$o['isPaid'];
    $o['items'] = json_decode($o['items'] ?? '[]', true);
    $o['shipping'] = json_decode($o['shipping'] ?? '{}', true);
    $o['user'] = [
        '_id' => (string)$user['id'],
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email']
    ];

    http_response_code(201);
    echo json_encode($o);
}

function handleUpdateOrderStatus($id, $input) {
    $db = getDBConnection();

    $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $stmt->execute([$id]);
    $o = $stmt->fetch();

    if (!$o) {
        http_response_code(404);
        echo json_encode(["message" => "Order not found"]);
        return;
    }

    $status = $input['status'] ?? '';
    $allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!in_array($status, $allowed)) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid status value"]);
        return;
    }

    $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);

    // Fetch and return populated
    $sql = "SELECT o.*, u.name as user_name, u.email as user_email 
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?";

    $stmt = $db->prepare($sql);
    $stmt->execute([$id]);
    $updated = $stmt->fetch();

    $updated['_id'] = (string)$updated['id'];
    $updated['id'] = (int)$updated['id'];
    $updated['totalPrice'] = (float)$updated['totalPrice'];
    $updated['isPaid'] = (bool)$updated['isPaid'];
    $updated['items'] = json_decode($updated['items'] ?? '[]', true);
    $updated['shipping'] = json_decode($updated['shipping'] ?? '{}', true);

    $updated['user'] = $updated['user_id'] ? [
        '_id' => (string)$updated['user_id'],
        'id' => (int)$updated['user_id'],
        'name' => $updated['user_name'],
        'email' => $updated['user_email']
    ] : null;

    unset($updated['user_name']);
    unset($updated['user_email']);

    echo json_encode($updated);
}

<?php
// Allow from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

require_once 'config.php';

try {
    // Get POST data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception('Invalid JSON data');
    }

    // Check if all required fields are present
    if (!isset($data['email']) || !isset($data['password'])) {
        throw new Exception('Missing required fields');
    }

    $email = $conn->real_escape_string($data['email']);
    $password = $data['password'];

    // Validate data
    if (empty($email) || empty($password)) {
        throw new Exception('All fields are required');
    }

    // Get user from database
    $stmt = $conn->prepare("SELECT id, fullname, username, email, password FROM account WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Invalid email or password');
    }

    $user = $result->fetch_assoc();

    // Verify password
    if (!password_verify($password, $user['password'])) {
        throw new Exception('Invalid email or password');
    }

    // Remove password from response
    unset($user['password']);

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => $user
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?> 
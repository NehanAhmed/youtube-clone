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
    if (!isset($data['fullname']) || !isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
        throw new Exception('Missing required fields');
    }

    $fullname = $conn->real_escape_string($data['fullname']);
    $username = $conn->real_escape_string($data['username']);
    $email = $conn->real_escape_string($data['email']);
    $password = $data['password'];

    // Validate data
    if (empty($fullname) || empty($username) || empty($email) || empty($password)) {
        throw new Exception('All fields are required');
    }

    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM account WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        throw new Exception('Email already exists');
    }

    // Check if username already exists
    $stmt = $conn->prepare("SELECT id FROM account WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        throw new Exception('Username already exists');
    }

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert user
    $stmt = $conn->prepare("INSERT INTO account (fullname, username, email, password) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $fullname, $username, $email, $hashed_password);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registration successful']);
    } else {
        throw new Exception('Registration failed: ' . $conn->error);
    }

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
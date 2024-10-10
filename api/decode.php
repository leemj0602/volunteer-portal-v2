<?php
$query = array();
if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $query = json_decode(file_get_contents("php://input"), true);
} else {
    $query = $_POST;
}

$key = "N6mPgeHcFfXzvlrVIeSY7Z56f9B4a7NFE32FejfmmKw=";
$data = $query['data'];

list($iv, $encrypted) = explode('::', base64_decode($data), 2);

$decrypted = openssl_decrypt($encrypted, 'aes-256-cbc', $key, 0, $iv);
echo $decrypted;
<?php
require '../../vendor/autoload.php';

// Getting the API key from the config.json and instantiating a new StripeClient
$json = file_get_contents("../../config.json");
$data = json_decode($json, true);
$key = $data['stripe_secret_key'];
$stripe = new \Stripe\StripeClient($key);

// Grabbing the subscriptionId from Post Query
$query = array();
if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $query = json_decode(file_get_contents("php://input"), true);
} else {
    $query = $_POST;
}

// Cancelling the subscription with the provided query
try {
    $subscriptionId = $query['subscriptionId'];
    $stripe -> subscriptions -> cancel($subscriptionId);

    http_response_code(200);
    echo json_encode(['message' => 'Subscription cancelled successfully.']);
}
catch (\Stripe\Exception\ApiErrorException $e) {
    http_response_code(400);
    echo json_encode(['error' => $e -> getMessage()]);
}
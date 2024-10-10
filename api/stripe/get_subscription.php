<?php
require '../../vendor/autoload.php';
$stripe = new \Stripe\StripeClient("sk_test_51MPGQtKYbFmGi644nIDwNr4SpbgdCG2FOkJwtRnfcAQ7qpDNcMAKbdbY3jjjPLpl6eTI5G9kFtJo8SlaHPW18K1i00OfcXShCM");

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
    $subscription = $stripe -> subscriptions -> retrieve($subscriptionId);

    http_response_code(200);
    echo json_encode($subscription);
}
catch (\Stripe\Exception\ApiErrorException $e) {
    http_response_code(400);
    echo json_encode(['error' => $e -> getMessage()]);
}
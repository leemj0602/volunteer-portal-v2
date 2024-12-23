<?php
require '../../vendor/autoload.php';
$stripe = new \Stripe\StripeClient("sk_test_51MPGQtKYbFmGi644nIDwNr4SpbgdCG2FOkJwtRnfcAQ7qpDNcMAKbdbY3jjjPLpl6eTI5G9kFtJo8SlaHPW18K1i00OfcXShCM");

// Grabbing the paymentIntentId from Post Query
$query = array();
if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $query = json_decode(file_get_contents("php://input"), true);
} else {
    $query = $_POST;
}

try {
    $paymentIntentId = $query['paymentIntentId'];
    $paymentIntent = $stripe->paymentIntents->retrieve($paymentIntentId, [
        'expand' => ['charges.data', 'customer', 'payment_method'],
    ]);

    echo json_encode(['payment_intent_details' => $paymentIntent]);
} catch (\Stripe\Exception\ApiErrorException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to retrieve payment intent details', 'message' => $e->getMessage()]);
}

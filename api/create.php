<?php

require_once '../vendor/autoload.php';
require_once './secrets.php';

$stripe = new \Stripe\StripeClient($stripeSecretKey);

function calculateOrderAmount(array $items): int {
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    $total = 0;
    foreach($items as $item) {
      $total += $item->amount;
    }
    return $total;
}

header('Content-Type: application/json');

try {
    // retrieve JSON from POST body
    $jsonStr = file_get_contents('php://input');
    $jsonObj = json_decode($jsonStr);

    // Create a PaymentIntent with amount and currency
    $paymentIntent = $stripe->paymentIntents->create([
        'amount' => calculateOrderAmount($jsonObj->items),
        'currency' => 'usd',
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        'automatic_payment_methods' => [
            'enabled' => true,
        ],
    ]);

    $output = [
        'clientSecret' => $paymentIntent->client_secret,
    ];

    echo json_encode($output);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}


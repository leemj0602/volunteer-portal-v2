<?php
require '../../vendor/autoload.php';
$stripe = new \Stripe\StripeClient("sk_test_51MPGQtKYbFmGi644nIDwNr4SpbgdCG2FOkJwtRnfcAQ7qpDNcMAKbdbY3jjjPLpl6eTI5G9kFtJo8SlaHPW18K1i00OfcXShCM");

function logToConsole($message)
{
    $formattedMessage = json_encode($message); // Encode message for JavaScript
    echo "<script>console.log($formattedMessage);</script>";
}

// logToConsole("Received request: " . json_encode($_POST));

// Grabbing the subscriptionId from Post Query
$query = array();
if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $query = json_decode(file_get_contents("php://input"), true);
} else {
    $query = $_POST;
}

// logToConsole("Parsed query: " . print_r($query, true));

try {
    $paymentIntentData = $query['paymentIntentData'];
    // logToConsole("Payment Intent Data: " . print_r($paymentIntentData, true));

    $customer = $stripe->customers->create([
        'name' => $paymentIntentData['name'],
        'email' => $paymentIntentData['email'],
    ]);
    // logToConsole("Customer created: " . print_r($customer, true));

    $paymentIntentParams = [
        'customer' => $customer['id'],
        'amount' => $paymentIntentData['amount'],
        'application_fee_amount' => round($paymentIntentData['applicationFeeAmount'] * 100),
        'currency' => 'sgd',
        'transfer_data' => array(
            'destination' => "acct_1OwxMY4FX1qEleoP",
        ),
        'payment_method_types' => ['card', 'grabpay', 'paynow'],
    ];

    // Add payment_method or payment_method_data based on the condition
    if (!empty($paymentIntentData['paymentMethodId'])) {
        $paymentIntentParams['payment_method'] = $paymentIntentData['paymentMethodId'];
    } else if (!empty($paymentIntentData['paymentMethodDataType'])) {
        $paymentIntentParams['payment_method_data'] = [
            'type' => $paymentIntentData['paymentMethodDataType'],
        ];
    }

    $paymentIntent = $stripe->paymentIntents->create($paymentIntentParams);

    // logToConsole("Payment Intent created: " . print_r($paymentIntent, true));

    http_response_code(200);
    echo json_encode(['client_secret' => $paymentIntent['client_secret'], 'payment_intent_id' => $paymentIntent['id'], 'payment_intent' => $paymentIntent]);
} catch (\Stripe\Exception\ApiErrorException $e) {
    // logToConsole("Stripe API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} catch (Exception $e) {
    // logToConsole("General Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
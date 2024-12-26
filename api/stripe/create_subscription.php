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
    $subscriptionData = $query['subscriptionData'];
    // logToConsole("Payment Intent Data: " . print_r($subscriptionData, true));

    $customer = $stripe->customers->create([
        'name' => $subscriptionData['name'],
        'email' => $subscriptionData['email'],
        'payment_method' => $subscriptionData['paymentMethodId']
    ]);
    // logToConsole("Customer created: " . print_r($customer, true));

    $recurring_prices = $stripe->prices->all([
        'active' => true,
        'currency' => 'sgd',
        'limit' => 15,
        'product' => 'prod_RSHY3xugTdvPwx',
        'type' => 'recurring',
    ]);

    foreach ($recurring_prices->data as $price) {
        if ($price->unit_amount == $subscriptionData['amount'] && $price->currency == 'sgd') {
            $fetched_price = $price;
        }
    }

    $feePercent = round(($subscriptionData['applicationFeeAmount'] / $fetched_price->unit_amount) * 10000, 2);

    $subscriptionParams = [
        'customer' => $customer['id'],
        'items' => [['price' => $fetched_price->id]],
        'application_fee_percent' => $feePercent,
        'currency' => 'sgd',
        'transfer_data' => array(
            'destination' => "acct_1OwxMY4FX1qEleoP",
        ),
        'default_payment_method' => $subscriptionData['paymentMethodId'],
        'description' => "Recurring Payment from {$subscriptionData['name']} ({$subscriptionData['email']})"
    ];

    $subscription = $stripe->subscriptions->create($subscriptionParams);

    // logToConsole("subscription created: " . print_r($subscription, true));

    // Retrieves invoice
    $invoice = $stripe->invoices->retrieve($subscription->latest_invoice, []);

    // Retrieve payment intent using invoice ID
    $payment_intent = $stripe->paymentIntents->retrieve($invoice->payment_intent);

    http_response_code(200);
    echo json_encode(['subscription_id' => $subscription->id, 'client_secret' => $payment_intent->client_secret, 'payment_intent_id' => $payment_intent->id, 'payment_status' => $payment_intent->status]);
} catch (\Stripe\Exception\ApiErrorException $e) {
    // logToConsole("Stripe API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} catch (Exception $e) {
    // logToConsole("General Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
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
    $chargesData = $query['chargesData'];

    $charge = $stripe->charges->retrieve($chargesData['chargeId'], ['expand' => ['transfer']]);

    $destination_payment = $charge->transfer->destination_payment;

    $update_charge = $stripe->charges->update(
        $destination_payment,
        ['description' => $chargesData['paymentDescription']],
        ['stripe_account' => $chargesData['accountId']]
    );

    http_response_code(200);
} catch (\Stripe\Exception\ApiErrorException $e) {
    // logToConsole("Stripe API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} catch (Exception $e) {
    // logToConsole("General Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
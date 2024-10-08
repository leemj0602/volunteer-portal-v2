<?php
require_once '../../wp-content/plugins/civicrm/civicrm/civicrm.config.php';
require_once '../../wp-content/plugins/civicrm/civicrm/CRM/Core/Config.php';

$query = array();
if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $query = json_decode(file_get_contents("php://input"), true);
} else {
    $query = $_POST;
}

$entity = $query['entity'];
$contactId = $query['contactId'];
$templateId = $query['templateId'];
$contributionId = $query['contributionId'];

try {
    $result = civicrm_api3('Email', 'send', [
        'contact_id' => $contactId,
        'template_id' => $templateId,
        'contribution_id' => $contributionId,
        'check_permissions' => FALSE
    ]);

    echo json_encode($result);
}
catch (CIVICRM_API3_EXCEPTION $e) {
    http_response_code(400);

    $error = [
        'error' => true,
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
    ];
    echo json_encode($error);
}
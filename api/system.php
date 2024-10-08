<?php
require_once '../../wp-content/plugins/civicrm/civicrm/civicrm.config.php';
require_once '../../wp-content/plugins/civicrm/civicrm/CRM/Core/Config.php';

$result = civicrm_api3('System', 'get', 
    ['sequential' => 1],
    ['check_permissions' => false]
);

echo json_encode($result);
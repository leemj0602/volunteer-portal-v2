<?php
require_once '../../wp-content/plugins/civicrm/civicrm/civicrm.config.php';
require_once '../../wp-content/plugins/civicrm/civicrm/CRM/Core/Config.php';

date_default_timezone_set('Asia/Singapore');

$query = array();
if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $query = json_decode(file_get_contents("php://input"), true);
} else {
    $query = $_POST;
}

// $key = "iloveo8";
// $iv = "8f3f2f0355c37b7d1dd81965dbd0516f";
// $encryption = $query=['encryption'];
// $decryptedString = openssl_decrypt(base64_decode($encryption), "AES-256-CBC", $key, 0, hex2bin($iv));

// Specific params variables
$entity = $query['entity'];
$action = $query['action'];
$select = $query['select'] ?? array();
$join = $query['join'] ?? array();
$where = $query['where'] ?? array();
$order = $query['order'] ?? array();
$values = $query['values'] ?? array();
$group = $query['group'] ?? array();
$limit = $query['limit'] ?? null;
$offset = $query['offset'] ?? null;
$chain = $query['chain'] ?? array(); // New chain parameter

// Initializing default params value
$params = array(
    'checkPermissions' => FALSE
);

// Conditional checking
if (is_array($select) && !empty($select))
    $params['select'] = $select;
if (is_array($join) && !empty($join))
    $params['join'] = $join;
if (is_array($where) && !empty($where))
    $params['where'] = $where;
if (is_array($order) && !empty($order)) {
    $orderBy = array();
    // $order = [[id, ASC], [createdAt, ASC]]
    foreach ($order as $o) {
        $orderBy[$o[0]] = $o[1];
    }
    $params['orderBy'] = $orderBy;
}
if (is_array($values) && !empty($values)) {
    $valuesArray = array();
    foreach ($values as $v) {
        $valuesArray[$v[0]] = $v[1];
    }
    // Automatically populates activity_date_time with current Singapore time
    if (!array_key_exists('activity_date_time', $valuesArray) && $action === 'create') {
        $valuesArray['activity_date_time'] = (new DateTime('now', new DateTimeZone('Asia/Singapore')))->format('Y-m-d H:i:s');
    }
    $params['values'] = $valuesArray;
}
if (is_array($group) && !empty($group))
    $params['groupBy'] = $group;
if ($limit != null) {
    $params['limit'] = $limit;
}
if ($offset != null) {
    $params['offset'] = $offset;
}
if (is_array($chain) && !empty($chain)) {
    $params['chain'] = $chain;
}

$result = civicrm_api4($entity, $action, $params);
echo json_encode($result);
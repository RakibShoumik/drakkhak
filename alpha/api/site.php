<?php
/* What every visitor's browser reads: the switches the owner has changed.
   Only the changed ones are sent; js/site.js holds the defaults. */
require dirname(__FILE__) . '/_lib.php';

$saved = drk_data() ? drk_saved() : array('rev' => 0, 'at' => 0, 'values' => array());
$tag = '"s' . (int) $saved['rev'] . '"';
header('Cache-Control: no-cache');
header('ETag: ' . $tag);
if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $tag) {
  http_response_code(304);
  exit;
}
$values = $saved['values'];
foreach (drk_private_keys() as $k) unset($values[$k]);
drk_json(array('rev' => (int) $saved['rev'], 'v' => empty($values) ? new stdClass() : $values));

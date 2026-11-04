<?php
/* A browser reports today's study totals here. No name, no IP address and no
   answers are stored: only a random id made by that browser, and its totals.
   The totals are cumulative, so a repeated or lost report changes nothing. */
require dirname(__FILE__) . '/_lib.php';
require dirname(__FILE__) . '/_stats.php';

header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') drk_json(array('error' => 'POST only'), 405);

/* this site's own pages only */
$origin = isset($_SERVER['HTTP_ORIGIN']) ? parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST) : null;
$host = isset($_SERVER['HTTP_HOST']) ? preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST']) : '';
if ($origin && $origin !== $host) drk_json(array('error' => 'origin'), 403);

$saved = drk_data() ? drk_saved() : null;
if ($saved === null || (isset($saved['values']['stats.on']) && !$saved['values']['stats.on'])) {
  http_response_code(204);
  exit;
}

$raw = file_get_contents('php://input', false, null, 0, 32768);
$in = json_decode((string) $raw, true);
if (!is_array($in) || !isset($in['id'], $in['days']) || !is_array($in['days'])) drk_json(array('error' => 'shape'), 400);
if (!preg_match('/^[0-9a-f]{16}$/', (string) $in['id'])) drk_json(array('error' => 'id'), 400);

$n = 0;
foreach ($in['days'] as $day => $rec) {
  if (++$n > 4) break;
  if (is_array($rec)) drk_stats_put((string) $day, $in['id'], $rec);
}
if (mt_rand(1, 200) === 1) drk_stats_compact();
http_response_code(204);

<?php
/* The one live figure the public gets: how many are studying right now. Real,
   and rebuilt at most twice a minute. */
require dirname(__FILE__) . '/_lib.php';
require dirname(__FILE__) . '/_stats.php';
header('Cache-Control: no-store');
if (!drk_data()) drk_json(array('now' => 0));
$f = drk_data() . '/pulse.json';
$c = drk_read_json($f, null);
if (!$c || time() - $c['t'] > 30) {
  $l = drk_stats_live();
  $c = array('t' => time(), 'now' => $l['now'], 'q' => $l['today']['q']);
  drk_write_json($f, $c);
}
drk_json(array('now' => (int) $c['now'], 'q' => (int) $c['q']));

<?php
/* This week's XP table. Only students who chose to join are on it, under the
   name they chose. */
require dirname(__FILE__) . '/_lib.php';
require dirname(__FILE__) . '/_social.php';

header('Cache-Control: no-store');
$origin = isset($_SERVER['HTTP_ORIGIN']) ? parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST) : null;
$host = isset($_SERVER['HTTP_HOST']) ? preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST']) : '';
if ($origin && $origin !== $host) drk_json(array('error' => 'origin'), 403);
if (!drk_data()) drk_json(array('error' => 'data'), 500);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = isset($_GET['id']) && drk_valid_id($_GET['id']) ? $_GET['id'] : '';
  drk_json(drk_league_board(30, $id));
}
$in = json_decode((string) file_get_contents('php://input', false, null, 0, 4096), true);
if (!is_array($in) || !isset($in['id']) || !drk_valid_id($in['id'])) drk_json(array('error' => 'shape'), 400);
$id = $in['id'];
$key = substr($id, 0, 8);
if (!empty($in['leave'])) {
  drk_league_edit(function (&$all) use ($key) { unset($all[$key]); });
  drk_json(array('ok' => true));
}
if (!drk_setting('fun.on') || !drk_setting('fun.league')) drk_json(array('error' => 'The league is switched off.'), 403);
if (drk_banned($id)) drk_json(array('error' => 'You cannot join the league.'), 403);
if (!drk_rate('g' . $id, 12, 60)) drk_json(array('error' => 'slow'), 429);
$name = drk_clean_text(str_replace("\n", ' ', isset($in['n']) ? $in['n'] : ''), 24);
if ($name === '') drk_json(array('error' => 'Add a name to show.'), 400);
$why = drk_text_problem($name);
if ($why !== '') drk_json(array('error' => $why), 422);
$xp = max(0, min(500000, (int) (isset($in['xp']) ? $in['xp'] : 0)));
if (isset($in['wk']) && $in['wk'] !== drk_league_week()) $xp = 0;
$av = drk_word_id(isset($in['av']) ? $in['av'] : '');
$fr = drk_word_id(isset($in['fr']) ? $in['fr'] : '');
$ti = drk_word_id(isset($in['ti']) ? $in['ti'] : '');
drk_league_edit(function (&$all) use ($key, $name, $xp, $av, $fr, $ti) {
  $old = isset($all[$key]) ? (int) $all[$key]['xp'] : 0;
  /* a browser can claim anything, so one report can only add so much */
  $next = max($old, min($xp, $old + 6000));
  $all[$key] = array('n' => $name, 'av' => $av, 'fr' => $fr, 'ti' => $ti, 'xp' => $next, 't' => time());
});
$files = glob(dirname(drk_league_file(drk_league_week())) . '/*.json');
sort($files);
foreach (array_slice($files, 0, max(0, count($files) - 8)) as $f) @unlink($f);
drk_json(drk_league_board(30, $id));

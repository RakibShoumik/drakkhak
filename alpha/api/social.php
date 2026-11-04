<?php
/* Love, comments and option counts for one question. The app only asks after a
   student has answered it. */
require dirname(__FILE__) . '/_lib.php';
require dirname(__FILE__) . '/_social.php';

header('Cache-Control: no-store');
$origin = isset($_SERVER['HTTP_ORIGIN']) ? parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST) : null;
$host = isset($_SERVER['HTTP_HOST']) ? preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST']) : '';
if ($origin && $origin !== $host) drk_json(array('error' => 'origin'), 403);
if (!drk_data()) drk_json(array('error' => 'data'), 500);

function drk_counts($rec, $id) {
  $key = $id !== '' ? substr($id, 0, 8) : '';
  $l = array(); $me = array(); $c = array(0, 0, 0, 0);
  for ($o = 0; $o < 4; $o++) {
    $l[] = count($rec['l'][$o]);
    $me[] = $key !== '' && in_array($key, $rec['l'][$o], true);
  }
  foreach ($rec['c'] as $x) if (drk_visible($x, $id)) $c[$x['o']]++;
  return array('l' => $l, 'me' => $me, 'c' => $c, 'p' => $rec['p']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $q = isset($_GET['q']) ? $_GET['q'] : '';
  $id = isset($_GET['id']) && drk_valid_id($_GET['id']) ? $_GET['id'] : '';
  if (!drk_valid_q($q)) drk_json(array('error' => 'q'), 400);
  $rec = drk_social_read($q);
  $out = drk_counts($rec, $id);
  if (isset($_GET['o'])) {
    $o = (int) $_GET['o'];
    $list = array();
    foreach ($rec['c'] as $c) if ($c['o'] === $o && drk_visible($c, $id)) $list[] = drk_public_comment($c, $id);
    $out['list'] = $list;
  }
  drk_json($out);
}

$in = json_decode((string) file_get_contents('php://input', false, null, 0, 8192), true);
if (!is_array($in)) drk_json(array('error' => 'shape'), 400);
$a = isset($in['a']) ? $in['a'] : '';
$q = isset($in['q']) ? $in['q'] : '';
$id = isset($in['id']) ? $in['id'] : '';
$o = isset($in['o']) ? (int) $in['o'] : -1;
if (!drk_valid_q($q) || !drk_valid_id($id)) drk_json(array('error' => 'shape'), 400);
if (in_array($a, array('love', 'comment', 'pick'), true) && ($o < 0 || $o > 3)) drk_json(array('error' => 'option'), 400);
$me8 = substr($id, 0, 8);

switch ($a) {
  case 'pick':
    if (!drk_rate('p' . drk_ip(), 900, 60)) drk_json(array('error' => 'slow'), 429);
    drk_social_edit($q, function (&$r) use ($o) { $r['p'][$o]++; });
    http_response_code(204);
    exit;

  case 'love':
    if (!drk_setting('social.love')) drk_json(array('error' => 'Love is switched off.'), 403);
    if (!drk_rate('l' . drk_ip(), 240, 60)) drk_json(array('error' => 'Too fast. Try again in a minute.'), 429);
    $res = drk_social_edit($q, function (&$r) use ($o, $me8, $id) {
      $at = array_search($me8, $r['l'][$o], true);
      if ($at === false) $r['l'][$o][] = $me8;
      else array_splice($r['l'][$o], $at, 1);
      return drk_counts($r, $id);
    });
    if ($res === null) drk_json(array('error' => 'Could not save.'), 500);
    drk_json($res);

  case 'comment':
    if (!drk_setting('social.comment')) drk_json(array('error' => 'Comments are switched off.'), 403);
    if (drk_banned($id)) drk_json(array('error' => 'You cannot comment here any more.'), 403);
    $text = drk_clean_text(isset($in['x']) ? $in['x'] : '', 280);
    $name = drk_clean_text(str_replace("\n", ' ', isset($in['n']) ? $in['n'] : ''), 24);
    if (function_exists('mb_strlen') ? mb_strlen($text, 'UTF-8') < 2 : strlen($text) < 2) drk_json(array('error' => 'Write a little more.'), 400);
    if ($name === '') drk_json(array('error' => 'Add a name to show.'), 400);
    $why = drk_text_problem($text);
    if ($why === '') $why = drk_text_problem($name);
    if ($why !== '') drk_json(array('error' => $why), 422);
    if (!drk_rate('c' . $id, 1, 15)) drk_json(array('error' => 'Wait a few seconds before commenting again.'), 429);
    if (!drk_rate('h' . drk_ip(), 30, 3600)) drk_json(array('error' => 'Too many comments for now. Try again later.'), 429);
    $hold = (bool) drk_setting('social.hold');
    $res = drk_social_edit($q, function (&$r) use ($o, $me8, $text, $name, $in, $hold, $id) {
      if (count($r['c']) >= DRK_MAX_THREAD) return array('error' => 'This question has as many comments as it can hold.');
      $r['c'][] = array('i' => base_convert((string) time(), 10, 36) . bin2hex(random_bytes(2)), 'o' => $o, 'by' => $me8, 'n' => $name,
        'av' => drk_word_id(isset($in['av']) ? $in['av'] : ''), 'fr' => drk_word_id(isset($in['fr']) ? $in['fr'] : ''), 'ti' => drk_word_id(isset($in['ti']) ? $in['ti'] : ''),
        't' => time(), 'x' => $text, 'hold' => $hold ? 1 : 0, 'hid' => 0, 'ok' => 0, 'rep' => array());
      return drk_counts($r, $id);
    });
    if ($res === null) drk_json(array('error' => 'Could not save.'), 500);
    if (isset($res['error'])) drk_json($res, 409);
    $res['held'] = $hold;
    drk_json($res);

  case 'report':
    if (!drk_rate('r' . $id, 20, 3600)) drk_json(array('error' => 'Too many reports for now.'), 429);
    $cid = isset($in['c']) ? (string) $in['c'] : '';
    drk_social_edit($q, function (&$r) use ($cid, $me8) {
      foreach ($r['c'] as &$c) {
        if ($c['i'] !== $cid) continue;
        if (!in_array($me8, $c['rep'], true)) $c['rep'][] = $me8;
        if (count($c['rep']) >= DRK_REPORTS_HIDE && empty($c['ok'])) $c['hid'] = 1;
      }
    });
    drk_json(array('ok' => true));

  case 'del':
    $cid = isset($in['c']) ? (string) $in['c'] : '';
    $res = drk_social_edit($q, function (&$r) use ($cid, $me8, $id) {
      $keep = array();
      foreach ($r['c'] as $c) if (!($c['i'] === $cid && $c['by'] === $me8)) $keep[] = $c;
      $r['c'] = $keep;
      return drk_counts($r, $id);
    });
    drk_json($res ? $res : array('error' => 'Could not save.'));
}
drk_json(array('error' => 'Unknown action'), 404);

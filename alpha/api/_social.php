<?php
/* ===========================================================
   Love and comments on answer options, the share who chose each
   option, and the weekly league. There are no accounts here, so a
   person is the random id their browser made. Students are often
   children, so links, phone numbers and listed words never get in,
   three reports hide a comment, and the owner can remove anything.
   =========================================================== */
define('DRK_REPORTS_HIDE', 3);
define('DRK_MAX_THREAD', 150);

function drk_social_dir() {
  $d = drk_data() . '/social';
  if (!is_dir($d)) @mkdir($d, 0755, true);
  return $d;
}
function drk_valid_q($q) { return is_string($q) && preg_match('/^[A-Za-z0-9._-]{1,60}$/', $q); }
function drk_valid_id($id) { return is_string($id) && preg_match('/^[0-9a-f]{16}$/', $id); }
function drk_shard($q) { return drk_social_dir() . '/' . substr(md5($q), 0, 2) . '.json'; }

function drk_setting($k) {
  $saved = drk_saved();
  if (array_key_exists($k, $saved['values'])) return $saved['values'][$k];
  $d = drk_defaults();
  return $d[$k];
}
function drk_blank_q() { return array('l' => array(array(), array(), array(), array()), 'p' => array(0, 0, 0, 0), 'c' => array()); }

/* change one question under a lock; the callback returns what the caller wants back */
function drk_social_edit($q, $fn) {
  $path = drk_shard($q);
  if (is_file($path) && filesize($path) > 8388608) return null;
  $fp = @fopen($path, 'c+');
  if (!$fp) return null;
  $out = null;
  if (flock($fp, LOCK_EX)) {
    $all = json_decode((string) stream_get_contents($fp), true);
    if (!is_array($all)) $all = array();
    $rec = isset($all[$q]) ? $all[$q] : drk_blank_q();
    $out = call_user_func_array($fn, array(&$rec));
    $all[$q] = $rec;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($all, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
  }
  fclose($fp);
  return $out;
}
function drk_social_read($q) {
  $all = drk_read_json(drk_shard($q), array());
  return isset($all[$q]) ? $all[$q] : drk_blank_q();
}

/* true while under the limit. The address is only hashed, and old files are swept */
function drk_rate($key, $limit, $window) {
  $f = drk_data() . '/throttle/r' . sha1($key) . '.json';
  $t = drk_read_json($f, array('n' => 0, 's' => time()));
  if (time() - $t['s'] > $window) $t = array('n' => 0, 's' => time());
  if ($t['n'] >= $limit) return false;
  $t['n']++;
  drk_write_json($f, $t);
  if (mt_rand(1, 500) === 1) {
    foreach (glob(drk_data() . '/throttle/r*.json') as $old) if (filemtime($old) < time() - 90000) @unlink($old);
  }
  return true;
}
function drk_ip() { return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'x'; }

function drk_bans() { return drk_read_json(drk_data() . '/social-ban.json', array()); }
function drk_banned($id) { return in_array(substr($id, 0, 8), drk_bans(), true); }

function drk_lower($s) { return function_exists('mb_strtolower') ? mb_strtolower($s, 'UTF-8') : strtolower($s); }
/* the reason a piece of text cannot be posted, or '' */
function drk_text_problem($text) {
  $plain = strtr($text, array('০'=>'0','১'=>'1','২'=>'2','৩'=>'3','৪'=>'4','৫'=>'5','৬'=>'6','৭'=>'7','৮'=>'8','৯'=>'9'));
  if (preg_match('~https?:|www\.|\.(com|net|org|xyz|me|io|info|bd|gg|ly)\b|t\.me|wa\.me|@[a-z0-9_]~i', $plain)) return 'Links and usernames are not allowed here.';
  if (preg_match('/(?:\d[\s.\-]*){8,}/', $plain)) return 'Phone numbers are not allowed here. Keep yourself safe.';
  $low = drk_lower($text);
  $tokens = preg_split('/[^\p{L}\p{M}\p{N}]+/u', $low, -1, PREG_SPLIT_NO_EMPTY);
  if (!is_array($tokens)) $tokens = array();
  foreach (preg_split('/[\s,]+/u', drk_lower((string) drk_setting('social.words')), -1, PREG_SPLIT_NO_EMPTY) as $w) {
    if (substr($w, -1) === '*') {
      if (strpos($low, rtrim($w, '*')) !== false) return 'Please keep it polite.';
    } elseif (in_array($w, $tokens, true)) {
      return 'Please keep it polite.';
    }
  }
  return '';
}
function drk_clean_text($s, $max) {
  $s = trim(preg_replace('/[\x00-\x09\x0B-\x1F\x7F]/u', '', (string) $s));
  $s = preg_replace('/\n{3,}/', "\n\n", $s);
  return function_exists('mb_substr') ? mb_substr($s, 0, $max, 'UTF-8') : substr($s, 0, $max);
}
function drk_word_id($s) { return is_string($s) && preg_match('/^[a-z0-9]{1,16}$/', $s) ? $s : ''; }

function drk_public_comment($c, $id) {
  return array('i' => $c['i'], 'o' => $c['o'], 'n' => $c['n'], 'av' => $c['av'], 'fr' => $c['fr'], 'ti' => $c['ti'], 't' => $c['t'], 'x' => $c['x'],
    'mine' => $id !== '' && $c['by'] === substr($id, 0, 8), 'wait' => !empty($c['hold']));
}
function drk_visible($c, $id) {
  $mine = $id !== '' && $c['by'] === substr($id, 0, 8);
  if ($mine) return empty($c['hid']);
  return empty($c['hold']) && empty($c['hid']);
}

/* ---------- the league ---------- */
function drk_league_week() { return date('o-\WW'); }
function drk_league_file($wk) {
  $d = drk_data() . '/league';
  if (!is_dir($d)) @mkdir($d, 0755, true);
  return $d . '/' . $wk . '.json';
}
function drk_league_edit($fn) {
  $fp = @fopen(drk_league_file(drk_league_week()), 'c+');
  if (!$fp) return null;
  $out = null;
  if (flock($fp, LOCK_EX)) {
    $all = json_decode((string) stream_get_contents($fp), true);
    if (!is_array($all)) $all = array();
    $out = call_user_func_array($fn, array(&$all));
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($all, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
  }
  fclose($fp);
  return $out;
}
function drk_league_board($n, $id) {
  $all = drk_read_json(drk_league_file(drk_league_week()), array());
  uasort($all, function ($a, $b) { return $b['xp'] - $a['xp']; });
  $top = array();
  $me = null;
  $rank = 0;
  $key = $id !== '' ? substr($id, 0, 8) : '';
  foreach ($all as $k => $r) {
    $rank++;
    $isMe = (string) $k === $key;
    $row = array('rank' => $rank, 'n' => $r['n'], 'av' => $r['av'], 'fr' => $r['fr'], 'ti' => $r['ti'], 'xp' => $r['xp'], 'me' => $isMe, 'k' => (string) $k);
    if ($rank <= $n) $top[] = $row;
    if ($isMe) $me = $row;
  }
  return array('wk' => drk_league_week(), 'count' => count($all), 'top' => $top, 'me' => $me);
}

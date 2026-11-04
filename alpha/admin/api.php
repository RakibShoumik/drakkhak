<?php
/* The panel's only door to the server. Everything but login needs a session,
   and everything that changes something also needs the session's token. */
require dirname(__FILE__) . '/_auth.php';
require dirname(__FILE__) . '/../api/_stats.php';
require dirname(__FILE__) . '/../api/_social.php';

drk_security_headers();
if (!drk_data()) drk_json(array('error' => 'The server would not let this site create its data folder. Check folder permissions.'), 500);

$a = isset($_GET['a']) ? $_GET['a'] : '';
$post = $_SERVER['REQUEST_METHOD'] === 'POST';
$in = $post ? json_decode((string) file_get_contents('php://input', false, null, 0, 262144), true) : array();
if (!is_array($in)) $in = array();

if ($a === 'login') {
  if (!$post) drk_json(array('error' => 'POST only'), 405);
  $left = drk_locked();
  if ($left) drk_json(array('error' => 'Too many wrong tries. Try again in ' . ceil($left / 60) . ' min.'), 429);
  $ok = drk_login(isset($in['user']) ? $in['user'] : '', isset($in['pass']) ? $in['pass'] : '');
  if (!$ok) {
    $left = drk_locked();
    drk_json(array('error' => $left ? 'Too many wrong tries. Try again in ' . ceil($left / 60) . ' min.' : 'That username or password is not right.'), 401);
  }
  drk_json(array('ok' => true));
}

if (!drk_signed_in()) drk_json(array('error' => 'signed-out'), 401);
if ($post && !drk_token_ok(isset($_SERVER['HTTP_X_DRK_TOKEN']) ? $_SERVER['HTTP_X_DRK_TOKEN'] : '')) {
  drk_json(array('error' => 'The page has gone stale. Reload it and try again.'), 403);
}

function drk_history() {
  $out = array();
  foreach (array_reverse(glob(drk_data() . '/history/*.json')) as $f) {
    $h = drk_read_json($f, null);
    if ($h) $out[] = array('rev' => $h['rev'], 'at' => $h['at'], 'note' => $h['note'], 'changed' => $h['changed']);
  }
  usort($out, function ($x, $y) { return $y['rev'] - $x['rev']; });
  return array_slice($out, 0, 50);
}
/* a publish: only what differs from the defaults is stored */
function drk_publish($values, $note) {
  $defaults = drk_defaults();
  $clean = drk_clean($values);
  if (isset($clean['ed.hsc'], $clean['ed.ssc']) && !$clean['ed.hsc'] && !$clean['ed.ssc']) {
    drk_json(array('error' => 'At least one of HSC and SSC has to stay on.'), 400);
  }
  $store = array();
  foreach ($clean as $k => $v) if ($v !== $defaults[$k]) $store[$k] = $v;
  $old = drk_saved();
  $changed = array();
  foreach ($defaults as $k => $d) {
    $was = array_key_exists($k, $old['values']) ? $old['values'][$k] : $d;
    $now = array_key_exists($k, $store) ? $store[$k] : $d;
    if ($was !== $now) $changed[] = $k;
  }
  $rev = (int) $old['rev'] + 1;
  $rec = array('rev' => $rev, 'at' => time(), 'values' => $store);
  if (!drk_write_json(drk_settings_file(), $rec)) drk_json(array('error' => 'Could not save. Check the data folder permissions.'), 500);
  drk_write_json(drk_data() . '/history/' . sprintf('%07d', $rev) . '.json', array('rev' => $rev, 'at' => $rec['at'], 'note' => (string) $note, 'changed' => $changed, 'values' => $store));
  $files = glob(drk_data() . '/history/*.json');
  sort($files);
  foreach (array_slice($files, 0, max(0, count($files) - 60)) as $f) @unlink($f);
  drk_log('publish', 'v' . $rev . ': ' . count($changed) . ' change(s)');
  return $rec;
}

/* the stem, so the owner can see what a comment is about */
function drk_question_line($id) {
  if (preg_match('/^ssc\.([a-z0-9]+)\.ch(\d+)\./', $id, $m)) $f = 'q-ssc-' . $m[1] . '-ch' . $m[2] . '.js';
  elseif (preg_match('/^([a-z0-9]+)\.ch(\d+)\./', $id, $m)) $f = 'q-hsc-' . $m[1] . '-ch' . $m[2] . '.js';
  else return '';
  $path = dirname(__FILE__) . '/../js/data/' . $f;
  if (!is_file($path)) return '';
  foreach (file($path) as $l) {
    if (strpos($l, '"id":"' . $id . '"') === false) continue;
    $q = json_decode(trim(rtrim(trim($l), ',')), true);
    return is_array($q) && isset($q['stem']) ? trim(strip_tags($q['stem'])) : '';
  }
  return '';
}
function drk_all_comments() {
  $out = array();
  $t = array('loves' => 0, 'comments' => 0, 'wait' => 0, 'reported' => 0);
  foreach (glob(drk_social_dir() . '/*.json') as $f) {
    foreach (drk_read_json($f, array()) as $q => $r) {
      foreach ($r['l'] as $list) $t['loves'] += count($list);
      foreach ($r['c'] as $c) {
        $c['q'] = $q;
        $out[] = $c;
        $t['comments']++;
        if (!empty($c['hold'])) $t['wait']++;
        if (!empty($c['rep'])) $t['reported']++;
      }
    }
  }
  usort($out, function ($x, $y) { return $y['t'] - $x['t']; });
  return array($out, $t);
}

switch ($a) {
  case 'comments':
    list($all, $t) = drk_all_comments();
    $want = isset($_GET['f']) ? $_GET['f'] : 'all';
    $list = array();
    foreach ($all as $c) {
      if ($want === 'wait' && empty($c['hold'])) continue;
      if ($want === 'reported' && empty($c['rep'])) continue;
      if (count($list) >= 80) break;
      $list[] = array('q' => $c['q'], 'stem' => drk_question_line($c['q']), 'i' => $c['i'], 'o' => $c['o'], 'by' => $c['by'], 'n' => $c['n'], 't' => $c['t'], 'x' => $c['x'],
        'hold' => !empty($c['hold']), 'hid' => !empty($c['hid']), 'rep' => count($c['rep']), 'banned' => in_array($c['by'], drk_bans(), true));
    }
    drk_json(array('list' => $list, 'totals' => $t, 'bans' => count(drk_bans()), 'league' => drk_league_board(30, '')));

  case 'comment-do':
    if (!$post) drk_json(array('error' => 'POST only'), 405);
    $q = isset($in['q']) ? $in['q'] : '';
    $cid = isset($in['c']) ? (string) $in['c'] : '';
    $do = isset($in['do']) ? $in['do'] : '';
    if (!drk_valid_q($q)) drk_json(array('error' => 'Unknown question.'), 400);
    $by = drk_social_edit($q, function (&$r) use ($cid, $do) {
      $keep = array();
      $who = null;
      foreach ($r['c'] as $c) {
        if ($c['i'] === $cid) {
          $who = $c['by'];
          if ($do === 'delete' || $do === 'ban') continue;
          if ($do === 'approve') { $c['hold'] = 0; $c['hid'] = 0; $c['ok'] = 1; $c['rep'] = array(); }
          if ($do === 'hide') { $c['hid'] = 1; }
        }
        $keep[] = $c;
      }
      $r['c'] = $keep;
      return $who;
    });
    if ($do === 'ban' && $by) {
      $bans = drk_bans();
      if (!in_array($by, $bans, true)) $bans[] = $by;
      drk_write_json(drk_data() . '/social-ban.json', $bans);
      drk_league_edit(function (&$all) use ($by) { unset($all[$by]); });
      drk_log('comment-ban');
    } elseif ($do === 'delete') {
      drk_log('comment-deleted');
    }
    drk_json(array('ok' => true));

  case 'league-remove':
    if (!$post) drk_json(array('error' => 'POST only'), 405);
    $k = isset($in['k']) ? (string) $in['k'] : '';
    if (preg_match('/^[0-9a-f]{8}$/', $k)) {
      drk_league_edit(function (&$all) use ($k) { unset($all[$k]); });
      $bans = drk_bans();
      if (!in_array($k, $bans, true)) $bans[] = $k;
      drk_write_json(drk_data() . '/social-ban.json', $bans);
      drk_log('comment-ban');
    }
    drk_json(array('ok' => true));

  case 'boot':
    $saved = drk_saved();
    drk_json(array(
      'defaults' => drk_defaults(),
      'values' => $saved['values'] ? $saved['values'] : new stdClass(),
      'rev' => (int) $saved['rev'],
      'user' => $_SESSION['user']
    ));

  case 'save':
    if (!$post) drk_json(array('error' => 'POST only'), 405);
    $rec = drk_publish(isset($in['values']) ? $in['values'] : array(), isset($in['note']) ? substr((string) $in['note'], 0, 200) : '');
    drk_json(array('ok' => true, 'rev' => $rec['rev'], 'values' => $rec['values'] ? $rec['values'] : new stdClass()));

  case 'restore':
    if (!$post) drk_json(array('error' => 'POST only'), 405);
    $h = drk_read_json(drk_data() . '/history/' . sprintf('%07d', (int) (isset($in['rev']) ? $in['rev'] : 0)) . '.json', null);
    if (!$h) drk_json(array('error' => 'That version is gone.'), 404);
    $merged = array_merge(drk_defaults(), $h['values']);
    $rec = drk_publish($merged, 'Restored version ' . (int) $h['rev']);
    drk_json(array('ok' => true, 'rev' => $rec['rev'], 'values' => $rec['values'] ? $rec['values'] : new stdClass()));

  case 'stats':
    $days = isset($_GET['days']) ? (int) $_GET['days'] : 30;
    drk_json(drk_stats_range(max(0, min($days, 1830))));

  case 'live':
    drk_json(drk_stats_live());

  case 'csv':
    $days = isset($_GET['days']) ? max(1, min((int) $_GET['days'], 1830)) : 90;
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="drakkhak-stats-' . drk_today() . '.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, array('date', 'visitors', 'students', 'new_browsers', 'hours_studied', 'questions', 'right', 'sets'));
    for ($i = $days - 1; $i >= 0; $i--) {
      $d = drk_day_add(drk_today(), -$i);
      $s = drk_day_sum($d);
      if ($s) fputcsv($out, array($d, $s['n'], $s['act'], $s['nw'], round($s['mins'] / 60, 2), $s['q'], $s['r'], $s['sets']));
    }
    exit;

  case 'history':
    drk_json(array('history' => drk_history(), 'log' => drk_read_log(60)));

  case 'system':
    $data = drk_data();
    $root = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/') : '';
    drk_json(array(
      'php' => PHP_VERSION,
      'data' => $data,
      'inRoot' => $root !== '' && strpos($data, $root . '/') === 0,
      'statsBytes' => drk_dir_size($data . '/stats'),
      'totalBytes' => drk_dir_size($data),
      'first' => drk_first_day(),
      'time' => date('Y-m-d H:i'),
      'user' => $_SESSION['user']
    ));

  case 'password':
    if (!$post) drk_json(array('error' => 'POST only'), 405);
    $rec = drk_auth_record();
    if (!password_verify(isset($in['current']) ? (string) $in['current'] : '', $rec['hash'])) {
      drk_log('password-refused');
      usleep(600000);
      drk_json(array('error' => 'Your current password is not right.'), 403);
    }
    $user = isset($in['user']) ? trim((string) $in['user']) : '';
    $new = isset($in['next']) ? (string) $in['next'] : '';
    if (!preg_match('/^[A-Za-z0-9._-]{3,40}$/', $user)) drk_json(array('error' => 'Username: 3 to 40 letters or digits.'), 400);
    if ($new !== '' && strlen($new) < 10) drk_json(array('error' => 'Use at least 10 characters for the password.'), 400);
    $hash = $new !== '' ? password_hash($new, PASSWORD_BCRYPT, array('cost' => 11)) : $rec['hash'];
    if (!drk_write_json($data = drk_data() . '/auth.json', array('user' => $user, 'hash' => $hash))) drk_json(array('error' => 'Could not save.'), 500);
    @chmod($data, 0600);
    $_SESSION['user'] = $user;
    drk_log('login-changed');
    drk_json(array('ok' => true, 'user' => $user));

  case 'wipe':
    if (!$post) drk_json(array('error' => 'POST only'), 405);
    if (!isset($in['confirm']) || $in['confirm'] !== 'DELETE') drk_json(array('error' => 'Type DELETE to confirm.'), 400);
    drk_stats_wipe();
    drk_log('stats-wiped');
    drk_json(array('ok' => true));

  case 'logout':
    if (!$post) drk_json(array('error' => 'POST only'), 405);
    drk_log('logout');
    drk_logout();
    drk_json(array('ok' => true));
}
drk_json(array('error' => 'Unknown action'), 404);

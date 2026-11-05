<?php
/* ===========================================================
   Shared by api/ and admin/. PHP 7.2 and up, no database: the whole
   site stays static, and these few files add settings and statistics
   beside it.

   Everything written lives in one data folder, kept above the web
   root when the host allows it, so uploading a new site never wipes
   the settings or the statistics.
   =========================================================== */
date_default_timezone_set('Asia/Dhaka');

function drk_data() {
  static $dir = null;
  if ($dir !== null) return $dir;
  $try = array();
  $env = getenv('DRAKKHAK_DATA');
  if ($env) $try[] = $env;
  $root = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/') : '';
  if ($root) $try[] = dirname($root) . '/drakkhak-data';
  $try[] = dirname(__FILE__) . '/data';
  foreach ($try as $p) {
    if ((@is_dir($p) || @mkdir($p, 0755, true)) && @is_writable($p)) {
      $dir = rtrim($p, '/');
      foreach (array('stats', 'history', 'throttle', 'sessions') as $sub) {
        if (!is_dir($dir . '/' . $sub)) @mkdir($dir . '/' . $sub, 0755, true);
      }
      /* in case the folder ended up inside the web root */
      if (!is_file($dir . '/.htaccess')) {
        @file_put_contents($dir . '/.htaccess',
          "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
      }
      if (!is_file($dir . '/index.html')) @file_put_contents($dir . '/index.html', '');
      return $dir;
    }
  }
  $dir = '';
  return $dir;
}

function drk_read_json($path, $fallback) {
  if (!is_file($path)) return $fallback;
  $o = json_decode((string) @file_get_contents($path), true);
  return is_array($o) ? $o : $fallback;
}
/* written to a side file and renamed, so a reader never sees half of it */
function drk_write_json($path, $data) {
  $tmp = $path . '.' . mt_rand(1000, 999999) . '.tmp';
  $ok = @file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
  if ($ok === false) return false;
  return @rename($tmp, $path);
}
function drk_json($data, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  header('X-Content-Type-Options: nosniff');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

/* ---------- every switch on the site ----------
   type: bool, int, choice, text, color, list, link. A value left at its
   default is not stored. js/site.js holds the same defaults for a visitor
   who has never reached this server: php tools/check-site.php compares them. */
function drk_opts() {
  return array(
    'maintenance.on'      => array('bool', false),
    'maintenance.title'   => array('text', 'We will be back soon', 120),
    'maintenance.message' => array('text', 'Drakkhak is being improved. Your progress is safe in this browser.', 400),

    'notice.on'      => array('bool', false),
    'notice.text'    => array('text', '', 300),
    'notice.link'    => array('link', ''),
    'notice.tone'    => array('choice', 'accent', array('accent', 'info', 'warn')),
    'notice.dismiss' => array('bool', true),

    'layout.nav'     => array('choice', 'left', array('top', 'left', 'mini', 'right', 'dock')),
    'layout.start'   => array('choice', 'classic', array('classic', 'list', 'road', 'subjects', 'columns', 'split', 'tabs', 'strip', 'focus', 'custom')),
    'layout.order'   => array('list', array('hero', 'road', 'nudge', 'mistakes', 'ahead', 'weeks', 'subjects'), array('hero', 'road', 'nudge', 'mistakes', 'ahead', 'weeks', 'subjects')),
    'layout.hide'    => array('list', array(), array('road', 'nudge', 'mistakes', 'ahead', 'weeks', 'subjects')),
    'layout.width'   => array('choice', 'normal', array('normal', 'wide', 'full')),
    'layout.density' => array('choice', 'normal', array('compact', 'normal', 'roomy')),
    'layout.corners' => array('choice', 'soft', array('sharp', 'soft', 'round')),
    'layout.text'    => array('int', 100, 85, 125),
    'look.accent'    => array('color', ''),
    'look.css'       => array('text', '', 20000),

    'bar.brand'     => array('text', 'Drakkhak', 40),
    'bar.community' => array('bool', true),
    'bar.search'    => array('bool', true),
    'bar.xp'        => array('bool', true),
    'bar.coins'     => array('bool', true),
    'bar.days'      => array('bool', true),
    'bar.sound'     => array('bool', true),
    'bar.timer'     => array('bool', true),
    'bar.night'     => array('bool', true),

    'page.map'        => array('bool', true),
    'page.practice'   => array('bool', true),
    'page.progress'   => array('bool', true),
    'page.modes'      => array('bool', true),
    'page.mock'       => array('bool', true),
    'page.tricks'     => array('bool', true),
    'page.quests'     => array('bool', true),
    'page.plan'       => array('bool', true),
    'page.stats'      => array('bool', true),
    'page.predict'    => array('bool', true),
    'page.wrapped'    => array('bool', true),
    'page.record'     => array('bool', true),
    'page.badges'     => array('bool', true),
    'page.collection' => array('bool', true),
    'page.shop'       => array('bool', true),
    'page.social'     => array('bool', true),
    'page.research'   => array('bool', true),
    'game.effects'    => array('bool', true),
    'game.cert'       => array('bool', true),

    'ed.hsc'     => array('bool', true),
    'ed.ssc'     => array('bool', true),
    'ed.default' => array('choice', 'hsc', array('hsc', 'ssc')),
    'subj.hide'  => array('list', array(), array('bangla', 'english', 'ict', 'phy', 'chem', 'bio', 'hmath', 'math', 'bgs')),

    'def.lang'       => array('choice', 'en', array('en', 'bn')),
    'def.theme'      => array('choice', 'day', array('day', 'night')),
    'def.sound'      => array('bool', true),
    'def.timer'      => array('bool', true),
    'def.setSize'    => array('int', 16, 5, 50),
    'def.dailyMin'   => array('int', 119, 15, 600),
    'def.dailyQ'     => array('int', 20, 5, 200),
    'def.challenge'  => array('choice', 'exam', array('flow', 'exam', 'brutal')),
    'def.alarm'      => array('bool', true),
    'def.redemption' => array('bool', true),
    'def.confidence' => array('bool', false),
    'def.breaks'     => array('bool', true),
    'def.pushAt'     => array('int', 0, 0, 4102444800),
    'rule.newShare'  => array('int', 75, 50, 100),

    'social.love'    => array('bool', true),
    'social.comment' => array('bool', true),
    'social.hold'    => array('bool', false),
    'social.words'   => array('text', 'fuck* shit bitch* asshole* bastard চুদ* চোদ* মাগি মাগী খানকি* হারামি হারামজাদা* কুত্তার বাল শালা chod* chud* khanki* magi', 4000),

    'shop.more' => array('bool', true),

    'fun.on'     => array('bool', false),
    'fun.today'  => array('bool', true),
    'fun.spin'   => array('bool', false),
    'fun.combo'  => array('bool', true),
    'fun.lucky'  => array('bool', false),
    'fun.crowd'  => array('bool', true),
    'fun.league' => array('bool', true),
    'fun.finish' => array('bool', true),
    'fun.motion' => array('bool', true),

    'stats.on' => array('bool', true)
  );
}
/* never sent to visitors */
function drk_private_keys() { return array('social.words'); }
function drk_defaults() {
  $o = array();
  foreach (drk_opts() as $k => $d) $o[$k] = $d[1];
  return $o;
}

/* only known keys get through, and each is forced into its own shape */
function drk_clean($input) {
  $opts = drk_opts();
  $out = array();
  foreach ($opts as $k => $d) {
    if (!is_array($input) || !array_key_exists($k, $input)) continue;
    $v = $input[$k];
    switch ($d[0]) {
      case 'bool':
        $v = (bool) $v;
        break;
      case 'int':
        if (!is_numeric($v)) continue 2;
        $v = max($d[2], min($d[3], (int) $v));
        break;
      case 'choice':
        if (!in_array($v, $d[2], true)) continue 2;
        break;
      case 'text':
        if (!is_string($v)) continue 2;
        $v = function_exists('mb_substr') ? mb_substr($v, 0, $d[2], 'UTF-8') : substr($v, 0, $d[2]);
        break;
      case 'color':
        if (!is_string($v) || ($v !== '' && !preg_match('/^#[0-9a-fA-F]{6}$/', $v))) continue 2;
        break;
      case 'link':
        if (!is_string($v)) continue 2;
        $v = trim($v);
        if ($v !== '' && !preg_match('#^(https?://|/(?!/)|\#/)#i', $v)) continue 2;
        $v = substr($v, 0, 500);
        break;
      case 'list':
        if (!is_array($v)) continue 2;
        $keep = array();
        foreach ($v as $x) if (is_string($x) && in_array($x, $d[2], true) && !in_array($x, $keep, true)) $keep[] = $x;
        if ($k === 'layout.order') foreach ($d[2] as $x) if (!in_array($x, $keep, true)) $keep[] = $x;
        $v = $keep;
        break;
    }
    $out[$k] = $v;
  }
  return $out;
}
function drk_settings_file() { return drk_data() . '/settings.json'; }
function drk_saved() {
  return drk_read_json(drk_settings_file(), array('rev' => 0, 'at' => 0, 'values' => array()));
}

function drk_log($what, $detail = '') {
  $dir = drk_data();
  if (!$dir) return;
  $f = $dir . '/log.jsonl';
  if (is_file($f) && filesize($f) > 524288) {
    $lines = file($f);
    @file_put_contents($f, implode('', array_slice($lines, -400)), LOCK_EX);
  }
  @file_put_contents($f, json_encode(array('t' => time(), 'w' => $what, 'd' => $detail), JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
}
function drk_read_log($n) {
  $f = drk_data() . '/log.jsonl';
  if (!is_file($f)) return array();
  $out = array();
  foreach (array_slice(file($f), -$n) as $l) {
    $o = json_decode($l, true);
    if (is_array($o)) $out[] = $o;
  }
  return array_reverse($out);
}

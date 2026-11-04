<?php
/* ===========================================================
   Statistics. Each day is sixteen small files, one per first letter of
   the browser's id, so reports rarely wait for each other. After a few
   days a day is reduced to one summary file and its raw files go, which
   keeps the host's file count and disk use small for years.
   =========================================================== */
define('DRK_KEEP_RAW_DAYS', 3);   /* a late report can still land this far back */
define('DRK_LIVE_SECS', 300);

function drk_today() { return date('Y-m-d'); }
function drk_day_add($day, $n) { return date('Y-m-d', strtotime($day . ' 12:00:00') + $n * 86400); }
function drk_stats_dir() { return drk_data() . '/stats'; }

function drk_num($x, $max) {
  if (!is_numeric($x)) return 0;
  return max(0, min($max, round((float) $x, 1)));
}
/* a map of short names to numbers, with a limit on both */
function drk_map($m, $max, $limit) {
  $o = array();
  if (!is_array($m)) return $o;
  foreach ($m as $k => $v) {
    if (count($o) >= $limit) break;
    if (!preg_match('/^[A-Za-z0-9._\/-]{1,40}$/', (string) $k)) continue;
    $o[(string) $k] = drk_num($v, $max);
  }
  return $o;
}
function drk_word($x, $allowed) { return in_array($x, $allowed, true) ? $x : ''; }

function drk_stats_put($day, $id, $r) {
  if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $day)) return;
  $today = drk_today();
  if ($day > drk_day_add($today, 1) || $day < drk_day_add($today, -DRK_KEEP_RAW_DAYS)) return;
  $dir = drk_stats_dir() . '/' . $day;
  if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) return;
  $path = $dir . '/' . $id[0] . '.json';
  if (is_file($path) && filesize($path) > 4194304) return;

  $tq = array();
  if (isset($r['tq']) && is_array($r['tq'])) {
    foreach ($r['tq'] as $k => $v) {
      if (count($tq) >= 60) break;
      if (!preg_match('/^[A-Za-z0-9._\/-]{1,40}$/', (string) $k) || !is_array($v) || count($v) < 2) continue;
      $tq[(string) $k] = array((int) drk_num($v[0], 5000), (int) drk_num($v[1], 5000));
    }
  }
  $new = array(
    'm' => drk_num(isset($r['m']) ? $r['m'] : 0, 1440),
    'q' => (int) drk_num(isset($r['q']) ? $r['q'] : 0, 5000),
    'r' => (int) drk_num(isset($r['r']) ? $r['r'] : 0, 5000),
    's' => (int) drk_num(isset($r['s']) ? $r['s'] : 0, 500),
    'h' => drk_map(isset($r['h']) ? $r['h'] : null, 60, 24),
    'c' => drk_map(isset($r['c']) ? $r['c'] : null, 1440, 30),
    'tm' => drk_map(isset($r['tm']) ? $r['tm'] : null, 1440, 60),
    'v' => drk_map(isset($r['v']) ? $r['v'] : null, 5000, 30),
    'tq' => $tq
  );
  $meta = array(
    'e' => drk_word(isset($r['e']) ? $r['e'] : '', array('hsc', 'ssc')),
    'l' => drk_word(isset($r['l']) ? $r['l'] : '', array('en', 'bn')),
    'k' => drk_word(isset($r['k']) ? $r['k'] : '', array('p', 't', 'd')),
    'n' => empty($r['n']) ? 0 : 1,
    'sk' => (int) drk_num(isset($r['sk']) ? $r['sk'] : 0, 5000),
    'lv' => (int) drk_num(isset($r['lv']) ? $r['lv'] : 0, 1000),
    'nw' => empty($r['nw']) ? 0 : 1,
    'a' => empty($r['a']) ? 0 : 1,
    'at' => preg_match('/^[a-z]{1,20}$/', isset($r['at']) ? (string) $r['at'] : '') ? $r['at'] : '',
    'ct' => preg_match('/^[A-Za-z0-9._\/-]{1,40}$/', isset($r['ct']) ? (string) $r['ct'] : '') ? $r['ct'] : ''
  );

  $fp = @fopen($path, 'c+');
  if (!$fp) return;
  if (flock($fp, LOCK_EX)) {
    $all = json_decode((string) stream_get_contents($fp), true);
    if (!is_array($all)) $all = array();
    $old = isset($all[$id]) ? $all[$id] : array();
    foreach (array('m', 'q', 'r', 's') as $k) if (isset($old[$k]) && $old[$k] > $new[$k]) $new[$k] = $old[$k];
    foreach (array('h', 'c', 'tm', 'v') as $k) {
      if (empty($old[$k])) continue;
      foreach ($old[$k] as $kk => $vv) if (!isset($new[$k][$kk]) || $new[$k][$kk] < $vv) $new[$k][$kk] = $vv;
    }
    if (!empty($old['tq'])) {
      foreach ($old['tq'] as $kk => $vv) {
        if (!isset($new['tq'][$kk]) || $new['tq'][$kk][0] < $vv[0]) $new['tq'][$kk] = $vv;
      }
    }
    if (!empty($old['nw'])) $meta['nw'] = 1;
    /* only the report about today can say what this browser is doing now */
    $all[$id] = array_merge($new, $meta, array('t' => time()));
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($all, JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
  }
  fclose($fp);
}

function drk_raw_records($day) {
  $dir = drk_stats_dir() . '/' . $day;
  $all = array();
  if (!is_dir($dir)) return $all;
  foreach (glob($dir . '/*.json') as $f) {
    $o = json_decode((string) @file_get_contents($f), true);
    if (is_array($o)) $all = $all + $o;
  }
  return $all;
}

/* one day boiled down to what the dashboard draws */
function drk_sum_records($day, $recs) {
  $s = array('day' => $day, 'n' => 0, 'act' => 0, 'mins' => 0, 'q' => 0, 'r' => 0, 'sets' => 0, 'nw' => 0,
    'hours' => array_fill(0, 24, 0), 'sec' => array(), 'top' => array(), 'ed' => array(), 'lang' => array(), 'kind' => array(),
    'night' => array(0, 0), 'view' => array(), 'buck' => array(0, 0, 0, 0, 0, 0), 'ids' => array());
  foreach ($recs as $id => $r) {
    $s['n']++;
    $s['ids'][] = substr($id, 0, 8);
    $mins = isset($r['m']) ? (float) $r['m'] : 0;
    $q = isset($r['q']) ? (int) $r['q'] : 0;
    if (!empty($r['nw'])) $s['nw']++;
    if (!empty($r['e'])) $s['ed'][$r['e']] = (isset($s['ed'][$r['e']]) ? $s['ed'][$r['e']] : 0) + 1;
    if (!empty($r['l'])) $s['lang'][$r['l']] = (isset($s['lang'][$r['l']]) ? $s['lang'][$r['l']] : 0) + 1;
    if (!empty($r['k'])) $s['kind'][$r['k']] = (isset($s['kind'][$r['k']]) ? $s['kind'][$r['k']] : 0) + 1;
    $s['night'][empty($r['n']) ? 0 : 1]++;
    if (!empty($r['v'])) foreach ($r['v'] as $k => $v) $s['view'][$k] = (isset($s['view'][$k]) ? $s['view'][$k] : 0) + $v;
    /* a student is someone who actually studied, not someone who looked in */
    if ($mins < 1 && $q < 1) continue;
    $s['act']++;
    $s['mins'] += $mins;
    $s['q'] += $q;
    $s['r'] += isset($r['r']) ? (int) $r['r'] : 0;
    $s['sets'] += isset($r['s']) ? (int) $r['s'] : 0;
    $b = $mins < 5 ? 0 : ($mins < 15 ? 1 : ($mins < 30 ? 2 : ($mins < 60 ? 3 : ($mins < 120 ? 4 : 5))));
    $s['buck'][$b]++;
    if (!empty($r['h'])) foreach ($r['h'] as $h => $m) if ((int) $h >= 0 && (int) $h < 24) $s['hours'][(int) $h] += $m;
    if (!empty($r['c'])) foreach ($r['c'] as $k => $m) {
      if (!isset($s['sec'][$k])) $s['sec'][$k] = 0;
      $s['sec'][$k] += $m;
    }
    if (!empty($r['tm'])) foreach ($r['tm'] as $k => $m) {
      if (!isset($s['top'][$k])) $s['top'][$k] = array(0, 0, 0);
      $s['top'][$k][0] += $m;
    }
    if (!empty($r['tq'])) foreach ($r['tq'] as $k => $v) {
      if (!isset($s['top'][$k])) $s['top'][$k] = array(0, 0, 0);
      $s['top'][$k][1] += $v[0];
      $s['top'][$k][2] += $v[1];
    }
  }
  $s['mins'] = round($s['mins'], 1);
  return $s;
}

/* days older than the late-report window become one summary each */
function drk_stats_compact() {
  $cut = drk_day_add(drk_today(), -DRK_KEEP_RAW_DAYS);
  foreach (glob(drk_stats_dir() . '/*', GLOB_ONLYDIR) as $dir) {
    $day = basename($dir);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $day) || $day >= $cut) continue;
    $sum = drk_sum_records($day, drk_raw_records($day));
    if (!drk_write_json(drk_stats_dir() . '/' . $day . '.sum.json', $sum)) continue;
    foreach (glob($dir . '/*') as $f) @unlink($f);
    @rmdir($dir);
  }
}
function drk_day_sum($day) {
  $dir = drk_stats_dir() . '/' . $day;
  if (is_dir($dir)) return drk_sum_records($day, drk_raw_records($day));
  $f = drk_stats_dir() . '/' . $day . '.sum.json';
  return is_file($f) ? drk_read_json($f, null) : null;
}
function drk_first_day() {
  $first = '';
  foreach (scandir(drk_stats_dir()) as $n) {
    if (preg_match('/^(\d{4}-\d{2}-\d{2})/', $n, $m) && ($first === '' || $m[1] < $first)) $first = $m[1];
  }
  return $first;
}

/* ---------- right now ---------- */
function drk_stats_live() {
  $now = time();
  $recs = drk_raw_records(drk_today());
  $live = 0;
  $at = array();
  $top = array();
  foreach ($recs as $r) {
    if (empty($r['a']) || empty($r['t']) || $now - $r['t'] > DRK_LIVE_SECS) continue;
    $live++;
    if (!empty($r['at'])) $at[$r['at']] = (isset($at[$r['at']]) ? $at[$r['at']] : 0) + 1;
    if (!empty($r['ct'])) $top[$r['ct']] = (isset($top[$r['ct']]) ? $top[$r['ct']] : 0) + 1;
  }
  arsort($at);
  arsort($top);
  $today = drk_sum_records(drk_today(), $recs);
  unset($today['ids']);
  return array('now' => $live, 'at' => (object) $at, 'topics' => (object) array_slice($top, 0, 8, true), 'today' => $today, 'time' => $now);
}

/* ---------- a stretch of days ---------- */
function drk_blank_totals() {
  return array('n' => 0, 'act' => 0, 'mins' => 0, 'q' => 0, 'r' => 0, 'sets' => 0, 'nw' => 0, 'uniq' => 0, 'uniqAct' => 0);
}
function drk_add_totals(&$t, $s) {
  foreach (array('n', 'act', 'mins', 'q', 'r', 'sets', 'nw') as $k) $t[$k] += isset($s[$k]) ? $s[$k] : 0;
}
function drk_stats_range($days) {
  drk_stats_compact();
  $today = drk_today();
  $first = drk_first_day();
  if ($days <= 0) {
    $days = $first ? max(1, (int) round((strtotime($today) - strtotime($first)) / 86400) + 1) : 1;
    $days = min($days, 1830);
  }
  $series = array();
  $cur = drk_blank_totals();
  $heat = array();
  for ($i = 0; $i < 7; $i++) $heat[$i] = array_fill(0, 24, 0);
  $sec = array();
  $top = array();
  $ed = array();
  $lang = array();
  $kind = array();
  $night = array(0, 0);
  $view = array();
  $buck = array_fill(0, 6, 0);
  $ids = array();

  for ($i = $days - 1; $i >= 0; $i--) {
    $d = drk_day_add($today, -$i);
    $s = drk_day_sum($d);
    if (!$s) {
      $series[] = array('d' => $d, 'n' => 0, 'act' => 0, 'mins' => 0, 'q' => 0, 'r' => 0, 'nw' => 0);
      continue;
    }
    $series[] = array('d' => $d, 'n' => $s['n'], 'act' => $s['act'], 'mins' => $s['mins'], 'q' => $s['q'], 'r' => $s['r'], 'nw' => $s['nw']);
    drk_add_totals($cur, $s);
    $wd = (int) date('w', strtotime($d . ' 12:00:00'));
    foreach ($s['hours'] as $h => $m) $heat[$wd][$h] += $m;
    foreach ($s['sec'] as $k => $m) $sec[$k] = (isset($sec[$k]) ? $sec[$k] : 0) + $m;
    foreach ($s['top'] as $k => $v) {
      if (!isset($top[$k])) $top[$k] = array(0, 0, 0);
      $top[$k][0] += $v[0];
      $top[$k][1] += $v[1];
      $top[$k][2] += $v[2];
    }
    foreach (array('ed', 'lang', 'kind', 'view') as $w) {
      foreach ($s[$w] as $k => $n) {
        if ($w === 'ed') $ed[$k] = (isset($ed[$k]) ? $ed[$k] : 0) + $n;
        if ($w === 'lang') $lang[$k] = (isset($lang[$k]) ? $lang[$k] : 0) + $n;
        if ($w === 'kind') $kind[$k] = (isset($kind[$k]) ? $kind[$k] : 0) + $n;
        if ($w === 'view') $view[$k] = (isset($view[$k]) ? $view[$k] : 0) + $n;
      }
    }
    $night[0] += $s['night'][0];
    $night[1] += $s['night'][1];
    foreach ($s['buck'] as $k => $n) $buck[$k] += $n;
    foreach ($s['ids'] as $id) $ids[$id] = 1;
  }
  $cur['uniq'] = count($ids);

  /* the same stretch just before, for the arrows on the tiles */
  $prev = drk_blank_totals();
  $prevIds = array();
  for ($i = 2 * $days - 1; $i >= $days && $i < 400; $i--) {
    $s = drk_day_sum(drk_day_add($today, -$i));
    if (!$s) continue;
    drk_add_totals($prev, $s);
    foreach ($s['ids'] as $id) $prevIds[$id] = 1;
  }
  $prev['uniq'] = count($prevIds);

  /* the top chapters are all the page needs */
  uasort($top, function ($a, $b) { return $b[0] < $a[0] ? -1 : ($b[0] > $a[0] ? 1 : 0); });
  $mostStudied = array_slice($top, 0, 15, true);
  $hard = array();
  foreach ($top as $k => $v) if ($v[1] >= 20) $hard[$k] = $v;
  uasort($hard, function ($a, $b) {
    $x = $a[2] / max(1, $a[1]);
    $y = $b[2] / max(1, $b[1]);
    return $x < $y ? -1 : ($x > $y ? 1 : 0);
  });
  arsort($sec);
  return array(
    'days' => $days, 'first' => $first, 'totals' => $cur, 'prev' => $prev, 'series' => $series, 'heat' => $heat,
    'sec' => (object) $sec, 'most' => (object) $mostStudied, 'hard' => (object) array_slice($hard, 0, 15, true),
    'ed' => (object) $ed, 'lang' => (object) $lang, 'kind' => (object) $kind, 'night' => $night, 'view' => (object) $view,
    'buck' => $buck, 'retention' => drk_retention(), 'allTime' => drk_all_time()
  );
}
/* of the browsers first seen far enough back, how many came back in time */
function drk_retention() {
  $today = drk_today();
  $seen = array();
  $byDay = array();
  for ($i = 150; $i >= 0; $i--) {
    $d = drk_day_add($today, -$i);
    $s = drk_day_sum($d);
    if (!$s) continue;
    $byDay[$d] = array_flip($s['ids']);
    foreach ($s['ids'] as $id) if (!isset($seen[$id])) $seen[$id] = $d;
  }
  $out = array();
  foreach (array(1 => 'd1', 7 => 'd7', 30 => 'd30') as $n => $name) {
    $base = 0;
    $back = 0;
    foreach ($seen as $id => $first) {
      if (drk_day_add($first, $n) > $today) continue;
      $base++;
      for ($j = 1; $j <= $n; $j++) {
        $d = drk_day_add($first, $j);
        if (isset($byDay[$d][$id])) { $back++; break; }
      }
    }
    $out[$name] = array('base' => $base, 'back' => $back);
  }
  return $out;
}
function drk_all_time() {
  $t = drk_blank_totals();
  $ids = array();
  foreach (scandir(drk_stats_dir()) as $n) {
    if (!preg_match('/^(\d{4}-\d{2}-\d{2})/', $n, $m)) continue;
    $s = drk_day_sum($m[1]);
    if (!$s) continue;
    drk_add_totals($t, $s);
    foreach ($s['ids'] as $id) $ids[$id] = 1;
  }
  $t['uniq'] = count($ids);
  return $t;
}
function drk_stats_wipe() {
  foreach (glob(drk_stats_dir() . '/*') as $p) {
    if (is_dir($p)) {
      foreach (glob($p . '/*') as $f) @unlink($f);
      @rmdir($p);
    } else {
      @unlink($p);
    }
  }
}
function drk_dir_size($dir) {
  $t = 0;
  foreach (glob($dir . '/*') as $p) $t += is_dir($p) ? drk_dir_size($p) : filesize($p);
  return $t;
}
